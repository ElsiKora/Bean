import { describe, expect, it, vi } from "vitest";
import type { IClockPortInterface } from "../../../src/application/interface/port/clock-port.interface";
import type { TClockHandleType } from "../../../src/application/interface/port/type/clock-handle.type";
import type { IInputPortInterface } from "../../../src/application/interface/port/input-port.interface";
import type { IThemePortInterface } from "../../../src/application/interface/port/theme-port.interface";
import { ESpinnerStatusEnum } from "../../../src/domain/enum";
import { SelectOptionValueObject } from "../../../src/domain/value-object/select-option.value-object";
import { createBeanAdapterFactory } from "../../../src/infrastructure/di/factory/bean-adapter.factory";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeInputPortFixture } from "../../e2e/fixtures/fake-input-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";

class IdentityThemePortFixture implements IThemePortInterface {
	public accent(text: string): string {
		return text;
	}

	public danger(text: string): string {
		return text;
	}

	public info(text: string): string {
		return text;
	}

	public muted(text: string): string {
		return text;
	}

	public strong(text: string): string {
		return text;
	}

	public success(text: string): string {
		return text;
	}
}

class NonInteractiveInputPortFixture implements IInputPortInterface {
	public disableRawMode(): void {}

	public enableRawMode(): void {
		throw new Error("Interactive prompts require a TTY stdin.");
	}

	public onKeyEvent(): () => void {
		return (): void => {};
	}
}

class UnexpectedFailureInputPortFixture implements IInputPortInterface {
	public disableRawMode(): void {}

	public enableRawMode(): void {
		throw new Error("Unexpected failure");
	}

	public onKeyEvent(): () => void {
		return (): void => {};
	}
}

class SequenceClockPortFixture implements IClockPortInterface {
	public clearIntervalCallCount: number = 0;

	public setIntervalCallCount: number = 0;

	private readonly nowValues: Array<number>;

	public constructor(nowValues: ReadonlyArray<number>) {
		this.nowValues = [...nowValues];
	}

	public clearInterval(_handle: TClockHandleType): void {
		this.clearIntervalCallCount += 1;
	}

	public clearTimeout(_handle: TClockHandleType): void {}

	public now(): number {
		const value: number | undefined = this.nowValues.shift();

		return value ?? 0;
	}

	public setInterval(_callback: () => void, _intervalMs: number): TClockHandleType {
		this.setIntervalCallCount += 1;

		return this.setIntervalCallCount as unknown as TClockHandleType;
	}

	public setTimeout(_callback: () => void, _timeoutMs: number): TClockHandleType {
		return 1 as unknown as TClockHandleType;
	}
}

describe("BeanAdapter full parity methods", () => {
	it("handles fallback prompt and schema/group methods in non-interactive mode", async () => {
		const bean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			environment: { FORCE_COLOR: "3" },
			inputPort: new NonInteractiveInputPortFixture(),
			isDebugEnabled: true,
			outputPort: new FakeOutputPortFixture({ isTTY: false }),
			themePort: new IdentityThemePortFixture(),
		});
		const options: ReadonlyArray<SelectOptionValueObject> = [new SelectOptionValueObject({ label: "A", shortKey: "a", value: "a" })];
		const dateFallback = new Date("2026-01-02T00:00:00.000Z");

		await expect(bean.text({ fallbackValue: "fallback", message: "text" })).resolves.toBe("fallback");
		await expect(bean.select({ fallbackValue: "a", message: "select", options })).resolves.toBe("a");
		await expect(bean.multiselect({ fallbackValue: ["a"], message: "multi", options })).resolves.toEqual(["a"]);
		await expect(bean.groupMultiselect({ fallbackValue: ["a"], message: "group", options })).resolves.toEqual(["a"]);
		await expect(bean.confirm({ isFallbackValue: true, message: "confirm" })).resolves.toBe(true);
		await expect(bean.toggle({ isFallbackValue: false, message: "toggle" })).resolves.toBe(false);
		await expect(bean.number({ fallbackValue: 10, message: "number" })).resolves.toBe(10);
		await expect(bean.password({ fallbackValue: "secret", message: "password" })).resolves.toBe("secret");
		await expect(bean.date({ fallbackValue: dateFallback, message: "date" })).resolves.toEqual(dateFallback);
		await expect(bean.list({ fallbackValue: ["x", "y"], message: "list" })).resolves.toEqual(["x", "y"]);
		await expect(bean.rating({ fallbackValue: 3, message: "rating" })).resolves.toBe(3);
		await expect(bean.rawlist({ fallbackValue: "a", message: "raw", options })).resolves.toBe("a");
		await expect(bean.expand({ fallbackValue: "a", message: "expand", options })).resolves.toBe("a");
		await expect(
			bean.autocomplete({
				fallbackValue: "a",
				message: "autocomplete",
				source: async (): Promise<ReadonlyArray<SelectOptionValueObject>> => options,
			}),
		).resolves.toBe("a");
		await expect(bean.editor({ fallbackValue: "edit", message: "editor" })).resolves.toBe("edit");
		await expect(bean.promptNamespace().text({ fallbackValue: "fallback-ns", message: "text-ns" })).resolves.toBe("fallback-ns");

		const groupSubmit = vi.fn();
		const groupCancel = vi.fn();
		await expect(
			bean.group({
				onCancel: groupCancel,
				onSubmit: groupSubmit,
				steps: [
					{ key: "first", run: async (): Promise<string> => "ok" },
					{
						key: "second",
						run: async (): Promise<string> => "skipped",
						when: async (): Promise<boolean> => false,
					},
				],
			}),
		).resolves.toEqual({ first: "ok" });
		expect(groupSubmit).toHaveBeenCalledTimes(1);
		expect(groupCancel).toHaveBeenCalledTimes(0);
		await expect(
			bean.group({
				onCancel: groupCancel,
				steps: [{ key: "cancel", run: async (): Promise<null> => null }],
			}),
		).resolves.toBeNull();
		expect(groupCancel).toHaveBeenCalledTimes(1);

		await expect(
			bean.promptFromSchema({
				fallbackValues: {
					mode: "a",
					scopes: ["a"],
					title: "hello",
				},
				schema: {
					mode: { kind: "select", options },
					scopes: { kind: "multiselect", options },
					title: { kind: "text" },
				},
			}),
		).resolves.toEqual({
			mode: "a",
			scopes: ["a"],
			title: "hello",
		});
		expect(bean.isCancel(null)).toBe(true);
		expect(bean.promptNamespace().isCancel(null)).toBe(true);
	});

	it("covers output, style, progress, spinner, and task-runner utilities", async () => {
		const output = new FakeOutputPortFixture({ columns: 40, isTTY: true });
		const bean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			environment: { FORCE_COLOR: "3", TERM: "xterm-256color" },
			inputPort: new FakeInputPortFixture(),
			outputPort: output,
			themePort: new IdentityThemePortFixture(),
		});

		bean.intro({ message: "intro" });
		bean.message({ message: "message" });
		bean.step({ message: "step" });
		bean.outro({ message: "outro" });
		bean.columns({ columns: ["a", "b"] });
		bean.columns({ columns: ["very-long-column-value", "another-long-column-value"], gap: 1 });
		bean.divider({ char: "-", width: 4 });
		bean.diff({ after: "b", before: "a", labelAfter: "new", labelBefore: "old" });
		bean.json({ isPretty: true, value: { ok: true } });
		bean.link({ label: "site", url: "https://example.com" });
		bean.table({
			columns: ["c1", "c2"],
			rows: [["v1", "v2"]],
		});
		bean.table({
			columns: ["c"],
			rows: [["\u001B[31mred\u001B[0m"]],
		});
		bean.tree({
			children: [{ label: "leaf" }],
			label: "root",
		});
		bean.box({ message: "boxed", title: "title" });
		bean.image({
			maxWidth: 2,
			pixels: [
				[
					{ b: 0, g: 0, r: 0 },
					{ b: 255, g: 255, r: 255 },
				],
				[
					{ b: 255, g: 255, r: 255 },
					{ b: 0, g: 0, r: 0 },
				],
			],
		});
		bean.image({
			alt: "image-fallback",
			pixels: [],
		});

		const createdTheme = bean.createTheme({
			info: (text: string): string => `[info]${text}`,
		});
		expect(createdTheme.info("x")).toBe("[info]x");
		expect(bean.colorLevel()).toBe(3);
		expect(bean.style({ color: "#00ff00", isBold: true, isUnderline: true, text: "x" })).toContain("\u001B[");
		expect(bean.style256({ color: 100, text: "x" })).toContain("\u001B[");
		expect(bean.styleBg256({ color: 100, text: "x" })).toContain("\u001B[");
		expect(bean.styleHex({ color: "#00ff00", text: "x" })).toContain("\u001B[");
		expect(bean.styleBgHex({ color: "#00ff00", text: "x" })).toContain("\u001B[");
		expect(bean.styleRgb({ rgb: { b: 0, g: 255, r: 0 }, text: "x" })).toContain("\u001B[");
		expect(bean.styleBgRgb({ rgb: { b: 0, g: 255, r: 0 }, text: "x" })).toContain("\u001B[");
		expect(bean.styleBright({ color: "green", text: "x" })).toContain("\u001B[");

		bean.progress({ current: 2, label: "L", total: 4 });
		bean.progressNamespace().render({ current: 1, total: 2 });
		const progress = bean.createProgress({
			chars: { complete: "#", incomplete: "." },
			format: "{label}[{bar}] {percent}% {current}/{total}",
			initial: 1,
			isClearOnComplete: true,
			label: "P",
			total: 3,
		});
		progress.increment();
		progress.update(3);
		progress.stop();

		const multiProgress = bean.createMultiProgress({ isClearOnComplete: true });
		const bar = multiProgress.add({ id: "one", label: "One", total: 2 });
		bar.increment();
		bar.update(2);
		bar.stop();
		multiProgress.stop();

		const spinnerEvents: Array<string> = [];
		const spinner = bean.spinner({
			intervalMs: 5,
			onStateChange: (state: { status: ESpinnerStatusEnum; text: string }): void => {
				spinnerEvents.push(`${state.status}:${state.text}`);
			},
			prefix: "[task]",
			text: "spin",
		});
		spinner.update("updated");
		expect(spinner.isSpinning).toBe(true);
		spinner.warn("warn");
		expect(spinner.isSpinning).toBe(false);
		expect(spinnerEvents.some((event: string): boolean => event.includes("running:[task] spin"))).toBe(true);
		expect(spinnerEvents.some((event: string): boolean => event.includes("warning:"))).toBe(true);

		const spinnerManager = bean.spinnerManager({ frames: ["-", "+"], intervalMs: 5 });
		const managed = spinnerManager.create({ id: "m1", prefix: "root", text: "running" });
		managed.update("progress");
		managed.succeed("done");
		spinnerManager.stopAll();
		const namespaceSpinnerManager = bean.spinnerNamespace().createManager({ frames: ["-", "+"], intervalMs: 5 });
		const namespaceManaged = namespaceSpinnerManager.create({ id: "nm1", text: "running" });
		namespaceManaged.stop("done");
		namespaceSpinnerManager.stopAll();

		await expect(
			bean.spinnerPromise({
				task: async (): Promise<string> => "ok",
				text: "promise",
			}),
		).resolves.toBe("ok");
		await expect(
			bean.spinnerPromise({
				task: async (): Promise<never> => {
					throw new Error("boom");
				},
				text: "promise-fail",
			}),
		).rejects.toThrow("boom");
		await expect(
			bean.spinnerNamespace().track({
				task: async (): Promise<string> => "tracked",
				text: "namespace-track",
			}),
		).resolves.toBe("tracked");

		const rollback = vi.fn();
		const summary = await bean.runTasks({
			concurrency: 2,
			isFailFast: false,
			tasks: [
				{
					run: (): void => {},
					title: "ok",
				},
				{
					run: (): void => {
						throw new Error("fail");
					},
					rollback,
					title: "fail",
				},
				{
					run: (): void => {},
					title: "skip",
					when: (): boolean => false,
				},
			],
		});
		expect(summary).toEqual({ failed: 1, skipped: 1, succeeded: 1 });
		await expect(
			bean.taskNamespace().run({
				tasks: [
					{
						run: (): void => {},
						title: "namespace-task",
					},
				],
			}),
		).resolves.toEqual({ failed: 0, skipped: 0, succeeded: 1 });
		expect(rollback).toHaveBeenCalledTimes(1);
		expect(output.lines.some((line: string): boolean => line.includes("+-----+\n| c   |\n+-----+\n| \u001B[31mred\u001B[0m |\n+-----+"))).toBe(true);
		expect(output.lines.some((line: string): boolean => line.includes("…"))).toBe(true);
		expect(output.lines.some((line: string): boolean => line.includes("image-fallback"))).toBe(true);
		expect(output.frames.length).toBeGreaterThan(0);
		expect(output.lines.length).toBeGreaterThan(0);
	});

	it("covers additional branch paths for color levels, fallbacks and runner controls", async () => {
		const noColorBean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			environment: { NO_COLOR: "1" },
			inputPort: new FakeInputPortFixture(),
			outputPort: new FakeOutputPortFixture({ isTTY: true }),
			themePort: new IdentityThemePortFixture(),
		});
		expect(noColorBean.colorLevel()).toBe(0);
		expect(noColorBean.style({ color: "#zzzzzz", text: "plain" })).toBe("plain");
		expect(noColorBean.styleHex({ color: "#ff00ff", text: "plain" })).toBe("plain");

		const levelOneBean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			environment: { FORCE_COLOR: "1" },
			inputPort: new FakeInputPortFixture(),
			outputPort: new FakeOutputPortFixture({ isTTY: true }),
			themePort: new IdentityThemePortFixture(),
		});
		expect(levelOneBean.style256({ color: 100, text: "x" })).toContain("\u001B[");
		expect(levelOneBean.style256({ color: 100, text: "x" })).not.toContain("38;5;100");

		const levelTwoBean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			environment: { FORCE_COLOR: "2" },
			inputPort: new FakeInputPortFixture(),
			outputPort: new FakeOutputPortFixture({ isTTY: true }),
			themePort: new IdentityThemePortFixture(),
		});
		expect(levelTwoBean.styleRgb({ rgb: { b: 0, g: 255, r: 0 }, text: "x" })).toContain("38;5;");
		expect(levelTwoBean.styleRgb({ rgb: { b: 0, g: 255, r: 0 }, text: "x" })).not.toContain("38;2;");

		const nonTtyOutput = new FakeOutputPortFixture({ isTTY: false });
		const nonTtyBean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			inputPort: new FakeInputPortFixture(),
			outputPort: nonTtyOutput,
			themePort: new IdentityThemePortFixture(),
		});
		nonTtyBean.link({ label: "site", url: "https://example.com" });
		expect(nonTtyOutput.lines.some((line: string): boolean => line.includes("(https://example.com)"))).toBe(true);

		const manager = noColorBean.spinnerManager({ frames: ["-", "+"], intervalMs: 5 });
		const spinner = manager.create({ id: "x", text: "t" });
		spinner.fail("f");
		const spinnerTwo = manager.create({ id: "y", text: "i" });
		spinnerTwo.info("info");
		manager.stopAll();

		const failFastSummary = await noColorBean.runTasks({
			isFailFast: true,
			tasks: [
				{
					run: (): void => {
						throw new Error("fail");
					},
					title: "fail-fast",
				},
				{
					run: (): void => {},
					title: "skipped-after-fail",
				},
			],
		});
		expect(failFastSummary.failed).toBe(1);
		expect(failFastSummary.skipped).toBe(1);

		const rejectBean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			inputPort: new UnexpectedFailureInputPortFixture(),
			outputPort: new FakeOutputPortFixture({ isTTY: false }),
			themePort: new IdentityThemePortFixture(),
		});
		await expect(rejectBean.text({ fallbackValue: "x", message: "reject" })).rejects.toThrow("Unexpected failure");
	});

	it("renders nested tree indentation and lcs-based diffs", () => {
		const output = new FakeOutputPortFixture();
		const bean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			inputPort: new FakeInputPortFixture(),
			outputPort: output,
			themePort: new IdentityThemePortFixture(),
		});

		bean.tree({
			children: [
				{
					children: [{ label: "grandchild" }],
					label: "child-1",
				},
				{ label: "child-2" },
			],
			label: "root",
		});
		expect(output.lines.at(-1)).toContain("│  └─ grandchild");

		bean.diff({
			after: "x\na\nb",
			before: "a\nb",
		});

		const diffOutput: string = output.lines.at(-1) ?? "";
		expect(diffOutput).toContain("+ x");
		expect(diffOutput).toContain("  a");
		expect(diffOutput).toContain("  b");
		expect(diffOutput).not.toContain("- a");
	});

	it("uses injected clock for progress and spinner manager timing", () => {
		const clock = new SequenceClockPortFixture([1000, 3000]);
		const output = new FakeOutputPortFixture();
		const bean = createBeanAdapterFactory({
			clockPort: clock,
			inputPort: new FakeInputPortFixture(),
			outputPort: output,
			themePort: new IdentityThemePortFixture(),
		});

		bean.createProgress({
			format: "{elapsed}|{eta}|{speed}",
			initial: 5,
			total: 10,
		});
		expect(output.frames.at(-1)).toContain("2.0|2.0|2.50");

		const manager = bean.spinnerManager({ intervalMs: 5 });
		manager.create({ id: "spinner-id", text: "running" });
		expect(clock.setIntervalCallCount).toBe(1);
		manager.stopAll();
		expect(clock.clearIntervalCallCount).toBeGreaterThan(0);
	});

	it("executes external editor command when provided", async () => {
		const bean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			inputPort: new FakeInputPortFixture(),
			outputPort: new FakeOutputPortFixture(),
			themePort: new IdentityThemePortFixture(),
		});
		const editorCommand: string = "node -e \"const fs=require('node:fs');const file=process.argv[1];fs.writeFileSync(file,'edited',{encoding:'utf8'});\"";

		await expect(
			bean.editor({
				editorCommand,
				message: "Edit me",
			}),
		).resolves.toBe("edited");
	});

	it("supports fluent api with output and prompt actions", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const bean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			outputPort: output,
			themePort: new IdentityThemePortFixture(),
		});
		const resolvedTextValues: Array<null | string> = [];

		const runPromise = bean
			.fluent()
			.text({
				message: "Name",
				onResolved: (value: null | string): void => {
					resolvedTextValues.push(value);
				},
			})
			.intro("Intro")
			.message("Message")
			.step("Step")
			.outro("Done")
			.run();

		input.emit({ NAME: "", SEQUENCE: "x" });
		input.emit({ NAME: "return" });
		await runPromise;

		expect(resolvedTextValues).toEqual(["x"]);
		expect(output.lines.some((line: string): boolean => line.includes("Done"))).toBe(true);
	});

	it("supports interactive rawlist and expand flows", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture({ supportsUnicode: false });
		const bean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			outputPort: output,
			themePort: new IdentityThemePortFixture(),
		});
		const options: ReadonlyArray<SelectOptionValueObject> = [new SelectOptionValueObject({ label: "Alpha", shortKey: "a", value: "alpha" }), new SelectOptionValueObject({ label: "Beta", shortKey: "b", value: "beta" })];

		const rawlistPromise = bean.rawlist({
			message: "rawlist",
			options,
		});
		input.emit({ NAME: "return" });
		await expect(rawlistPromise).resolves.toBe("alpha");

		const expandPromise = bean.expand({
			message: "expand",
			options,
		});
		input.emit({ NAME: "", SEQUENCE: "b" });
		input.emit({ NAME: "return" });
		await expect(expandPromise).resolves.toBe("beta");

		expect(output.lines.some((line: string): boolean => line.includes("expand"))).toBe(true);
	});
});
