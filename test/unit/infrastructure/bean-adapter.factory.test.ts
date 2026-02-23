import { describe, expect, it } from "vitest";
import type { IPromptStylePortInterface } from "../../../src/application/interface/port/prompt-style-port.interface";
import type { IThemePortInterface } from "../../../src/application/interface/port/theme-port.interface";
import { SelectOptionValueObject } from "../../../src/domain/value-object/select-option.value-object";
import { createBeanAdapterFactory } from "../../../src/infrastructure/di/factory/bean-adapter.factory";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeInputPortFixture } from "../../e2e/fixtures/fake-input-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";

class FakeThemePortFixture implements IThemePortInterface {
	public accent(text: string): string {
		return `[accent]${text}`;
	}

	public success(text: string): string {
		return `[success]${text}`;
	}

	public danger(text: string): string {
		return `[danger]${text}`;
	}

	public muted(text: string): string {
		return `[muted]${text}`;
	}

	public strong(text: string): string {
		return `[strong]${text}`;
	}

	public info(text: string): string {
		return `[info]${text}`;
	}
}

describe("createBeanAdapterFactory", () => {
	it("wires dependencies and executes prompt flow", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const bean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			outputPort: output,
			themePort: new FakeThemePortFixture(),
		});

		const resultPromise = bean.text({ isRequired: true, message: "Type" });
		input.emit({ NAME: "", SEQUENCE: "f" });
		input.emit({ NAME: "", SEQUENCE: "i" });
		input.emit({ NAME: "", SEQUENCE: "x" });
		input.emit({ NAME: "return" });

		await expect(resultPromise).resolves.toBe("fix");
	});

	it("creates adapter with default node-backed ports", () => {
		const bean = createBeanAdapterFactory();
		expect(bean).toBeDefined();
	});

	it("registers process signal cleanup only once", () => {
		const beforeSigintCount: number = process.listenerCount("SIGINT");
		const beforeSigtermCount: number = process.listenerCount("SIGTERM");
		createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			inputPort: new FakeInputPortFixture(),
			outputPort: new FakeOutputPortFixture(),
			themePort: new FakeThemePortFixture(),
		});
		createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			inputPort: new FakeInputPortFixture(),
			outputPort: new FakeOutputPortFixture(),
			themePort: new FakeThemePortFixture(),
		});
		const afterSigintCount: number = process.listenerCount("SIGINT");
		const afterSigtermCount: number = process.listenerCount("SIGTERM");

		expect(afterSigintCount - beforeSigintCount).toBeLessThanOrEqual(1);
		expect(afterSigtermCount - beforeSigtermCount).toBeLessThanOrEqual(1);
	});

	it("applies custom prompt style through options", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture({ supportsUnicode: false });
		const promptStylePort: IPromptStylePortInterface = {
			ACTIVE_POINTER_ASCII: "->",
			ACTIVE_POINTER_UNICODE: "->",
			COMPLETED_MARK_ASCII: "OK",
			COMPLETED_MARK_UNICODE: "OK",
			DESCRIPTION_INDENT_PREFIX: "  ",
			DISABLED_LABEL_SUFFIX: " (off)",
			ERROR_PREFIX: "!",
			FAILED_MARK_ASCII: "X",
			FAILED_MARK_UNICODE: "X",
			GROUP_INDENT_PREFIX: "--",
			HINT_PREFIX: " - ",
			IS_BLANK_LINE_AFTER_QUESTION_ENABLED: false,
			NEUTRAL_MARK_ASCII: ".",
			NEUTRAL_MARK_UNICODE: ".",
			PLACEHOLDER_PREFIX: "> ",
			QUESTION_PREFIX_SYMBOL: "Q",
			SEPARATOR_SYMBOL: "-",
			SELECTED_MARK_ASCII: "[x]",
			SELECTED_MARK_UNICODE: "[x]",
			TOGGLE_FALSE_LABEL: "no",
			TOGGLE_TRUE_LABEL: "yes",
			UNSELECTED_MARK_ASCII: "[ ]",
			UNSELECTED_MARK_UNICODE: "[ ]",
		};
		const bean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			outputPort: output,
			promptStylePort,
			themePort: new FakeThemePortFixture(),
		});
		const resultPromise = bean.select({
			message: "Mode",
			options: [new SelectOptionValueObject({ label: "A", value: "a" })],
		});
		input.emit({ NAME: "return" });
		await expect(resultPromise).resolves.toBe("a");
		expect(output.frames.at(0)).toContain("Q [strong]Mode");
		expect(output.frames.at(0)).not.toContain("\n\n");
		expect(output.frames.at(0)).toContain("[info]-> [info]A");
		expect(output.lines.at(-1)).toContain("[success]OK [strong]Mode: A");
	});
});
