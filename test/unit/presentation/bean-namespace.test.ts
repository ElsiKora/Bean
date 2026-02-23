import type { BeanAdapter } from "../../../src/presentation/bean/adapter";
import type { IBeanSpinnerHandleInterface } from "../../../src/presentation/interface";

import { describe, expect, it, vi } from "vitest";

import { BeanProgressNamespace } from "../../../src/presentation/bean/namespace/bean-progress.presenter";
import { BeanPromptNamespace } from "../../../src/presentation/bean/namespace/bean-prompt.presenter";
import { BeanSpinnerNamespace } from "../../../src/presentation/bean/namespace/bean-spinner.presenter";
import { BeanTaskNamespace } from "../../../src/presentation/bean/namespace/bean-task.presenter";

const createSpinnerHandle = (): IBeanSpinnerHandleInterface => {
	return {
		fail: vi.fn(),
		info: vi.fn(),
		get isSpinning(): boolean {
			return false;
		},
		stop: vi.fn(),
		succeed: vi.fn(),
		update: vi.fn(),
		warn: vi.fn(),
	};
};

describe("Bean namespaces", () => {
	it("delegates prompt namespace methods", async () => {
		const adapter: Partial<BeanAdapter> = {
			autocomplete: vi.fn(async (): Promise<null | string> => "autocomplete"),
			confirm: vi.fn(async (): Promise<boolean | null> => true),
			date: vi.fn(async (): Promise<Date | null> => new Date("2026-01-01T00:00:00.000Z")),
			editor: vi.fn(async (): Promise<null | string> => "editor"),
			expand: vi.fn(async (): Promise<null | string> => "expand"),
			group: vi.fn(async (): Promise<null | Readonly<Record<string, unknown>>> => ({ ok: true })),
			groupMultiselect: vi.fn(async (): Promise<null | ReadonlyArray<string>> => ["group"]),
			isCancel: vi.fn((value: unknown): boolean => value === null),
			list: vi.fn(async (): Promise<null | ReadonlyArray<string>> => ["list"]),
			multiselect: vi.fn(async (): Promise<null | ReadonlyArray<string>> => ["multi"]),
			number: vi.fn(async (): Promise<null | number> => 42),
			password: vi.fn(async (): Promise<null | string> => "secret"),
			promptFromSchema: vi.fn(async (): Promise<null | Readonly<Record<string, unknown>>> => ({ schema: true })),
			rating: vi.fn(async (): Promise<null | number> => 5),
			rawlist: vi.fn(async (): Promise<null | string> => "raw"),
			select: vi.fn(async (): Promise<null | string> => "select"),
			text: vi.fn(async (): Promise<null | string> => "text"),
			toggle: vi.fn(async (): Promise<boolean | null> => false),
			treeSelect: vi.fn(async (): Promise<null | ReadonlyArray<string>> => ["tree"]),
		};
		const namespace = new BeanPromptNamespace({ beanAdapter: adapter as BeanAdapter });

		await expect(namespace.autocomplete({ message: "a", source: async (): Promise<ReadonlyArray<never>> => [] } as never)).resolves.toBe("autocomplete");
		await expect(namespace.confirm({ message: "confirm" } as never)).resolves.toBe(true);
		await expect(namespace.date({ message: "date" } as never)).resolves.toEqual(new Date("2026-01-01T00:00:00.000Z"));
		await expect(namespace.editor({ message: "editor" } as never)).resolves.toBe("editor");
		await expect(namespace.expand({ message: "expand", options: [] } as never)).resolves.toBe("expand");
		await expect(namespace.group({ steps: [] } as never)).resolves.toEqual({ ok: true });
		await expect(namespace.groupMultiselect({ message: "group", options: [] } as never)).resolves.toEqual(["group"]);
		expect(namespace.isCancel(null)).toBe(true);
		await expect(namespace.list({ message: "list" } as never)).resolves.toEqual(["list"]);
		await expect(namespace.multiselect({ message: "multi", options: [] } as never)).resolves.toEqual(["multi"]);
		await expect(namespace.number({ message: "number" } as never)).resolves.toBe(42);
		await expect(namespace.password({ message: "password" } as never)).resolves.toBe("secret");
		await expect(namespace.promptFromSchema({ schema: { title: { kind: "text" } } })).resolves.toEqual({ schema: true });
		await expect(namespace.rating({ message: "rating" } as never)).resolves.toBe(5);
		await expect(namespace.rawlist({ message: "raw", options: [] } as never)).resolves.toBe("raw");
		await expect(namespace.select({ message: "select", options: [] } as never)).resolves.toBe("select");
		await expect(namespace.text({ message: "text" } as never)).resolves.toBe("text");
		await expect(namespace.toggle({ message: "toggle" } as never)).resolves.toBe(false);
		await expect(namespace.treeSelect({ message: "tree", nodes: [] } as never)).resolves.toEqual(["tree"]);
	});

	it("delegates progress, spinner and task namespaces", async () => {
		const spinnerHandle = createSpinnerHandle();
		const progressHandle = {
			increment: vi.fn(),
			stop: vi.fn(),
			update: vi.fn(),
		};
		const multiProgressHandle = {
			add: vi.fn(() => ({
				increment: vi.fn(),
				setLabel: vi.fn(),
				setPrefix: vi.fn(),
				stop: vi.fn(),
				update: vi.fn(),
			})),
			stop: vi.fn(),
		};
		const spinnerManagerHandle = {
			create: vi.fn(() => spinnerHandle),
			stopAll: vi.fn(),
		};
		const adapter: Partial<BeanAdapter> = {
			createMultiProgress: vi.fn(() => multiProgressHandle),
			createProgress: vi.fn(() => progressHandle),
			progress: vi.fn(),
			runTasks: vi.fn(async () => ({ failed: 0, skipped: 0, succeeded: 1 })),
			spinner: vi.fn(() => spinnerHandle),
			spinnerManager: vi.fn(() => spinnerManagerHandle),
			spinnerPromise: async <TResult>(input: { task: () => Promise<TResult> }): Promise<TResult> => await input.task(),
		};
		const progressNamespace = new BeanProgressNamespace({ beanAdapter: adapter as BeanAdapter });
		const spinnerNamespace = new BeanSpinnerNamespace({ beanAdapter: adapter as BeanAdapter });
		const taskNamespace = new BeanTaskNamespace({ beanAdapter: adapter as BeanAdapter });

		progressNamespace.render({ current: 1, total: 2 } as never);
		expect(progressNamespace.create({ total: 1 } as never)).toBe(progressHandle);
		expect(progressNamespace.createMulti()).toBe(multiProgressHandle);

		expect(spinnerNamespace.create({ text: "spinner" } as never)).toBe(spinnerHandle);
		expect(spinnerNamespace.createManager()).toBe(spinnerManagerHandle);
		await expect(spinnerNamespace.track({ task: async (): Promise<string> => "ok", text: "track" })).resolves.toBe("ok");

		await expect(taskNamespace.run({ tasks: [{ run: (): void => {}, title: "task" }] })).resolves.toEqual({
			failed: 0,
			skipped: 0,
			succeeded: 1,
		});
	});
});
