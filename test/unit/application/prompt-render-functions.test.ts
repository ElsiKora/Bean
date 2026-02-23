import { describe, expect, it } from "vitest";
import { renderCompletedGroupMultiselectLineFunction } from "../../../src/application/use-case/prompt/render-completed-group-multiselect-line.function";
import { renderCompletedMultiselectLineFunction } from "../../../src/application/use-case/prompt/render-completed-multiselect-line.function";
import { renderCompletedSelectLineFunction } from "../../../src/application/use-case/prompt/render-completed-select-line.function";
import { renderCompletedTextLineFunction } from "../../../src/application/use-case/prompt/render-completed-text-line.function";
import { renderGroupMultiselectFrameFunction } from "../../../src/application/use-case/prompt/render-group-multiselect-frame.function";
import { renderMultiselectFrameFunction } from "../../../src/application/use-case/prompt/render-multiselect-frame.function";
import { renderSelectFrameFunction } from "../../../src/application/use-case/prompt/render-select-frame.function";
import { SelectOptionValueObject } from "../../../src/domain/value-object/select-option.value-object";
import { ONE_CONSTANT, ZERO_CONSTANT } from "../../../src/presentation/bean/constant";
import { IdentityPromptStylePortFixture } from "../fixtures/identity-prompt-style-port.fixture";
import { IdentityThemePortFixture } from "../fixtures/identity-theme-port.fixture";

describe("Prompt render functions", () => {
	it("renders select frame with hint, disabled item and description", () => {
		const frame: string = renderSelectFrameFunction({
			cursorIndex: ZERO_CONSTANT,
			isUnicodeSupported: false,
			message: "Select item",
			options: [new SelectOptionValueObject({ description: "first item", hint: "hint", label: "A", value: "a" }), new SelectOptionValueObject({ isDisabled: true, label: "B", value: "b" })],
			pageEndIndex: 2,
			pageStartIndex: ZERO_CONSTANT,
			promptStylePort: new IdentityPromptStylePortFixture(),
			themePort: new IdentityThemePortFixture(),
		});

		expect(frame).toContain("? Select item");
		expect(frame).toContain("> A - hint");
		expect(frame).toContain("first item");
		expect(frame).toContain("B (disabled)");
	});

	it("renders multiselect and grouped frames with errors", () => {
		const multiselectFrame: string = renderMultiselectFrameFunction({
			cursorIndex: ONE_CONSTANT,
			errorMessage: "Required",
			isUnicodeSupported: false,
			message: "Select many",
			options: [new SelectOptionValueObject({ label: "A", value: "a" }), new SelectOptionValueObject({ label: "B", value: "b" })],
			pageEndIndex: 2,
			pageStartIndex: ZERO_CONSTANT,
			promptStylePort: new IdentityPromptStylePortFixture(),
			selectedIndices: new Set<number>([ONE_CONSTANT]),
			themePort: new IdentityThemePortFixture(),
		});
		const groupedFrame: string = renderGroupMultiselectFrameFunction({
			cursorIndex: ZERO_CONSTANT,
			errorMessage: "Group required",
			groupedOptions: new Map<string, ReadonlyArray<SelectOptionValueObject>>([["backend", [new SelectOptionValueObject({ label: "api", value: "api" }), new SelectOptionValueObject({ label: "core", value: "core" })]]]),
			isUnicodeSupported: false,
			message: "Grouped",
			pageEndIndex: 2,
			pageStartIndex: ZERO_CONSTANT,
			promptStylePort: new IdentityPromptStylePortFixture(),
			selectedIndices: new Set<number>([ZERO_CONSTANT]),
			themePort: new IdentityThemePortFixture(),
		});

		expect(multiselectFrame).toContain("[x] B");
		expect(multiselectFrame).toContain("! Required");
		expect(groupedFrame).toContain("backend");
		expect(groupedFrame).toContain("! Group required");
	});

	it("renders completed line variants", () => {
		const promptStylePort = new IdentityPromptStylePortFixture();
		const themePort = new IdentityThemePortFixture();

		expect(
			renderCompletedTextLineFunction({
				isUnicodeSupported: false,
				message: "Text",
				promptStylePort,
				themePort,
				value: "hello",
			}),
		).toBe("v Text: hello");
		expect(
			renderCompletedSelectLineFunction({
				isUnicodeSupported: false,
				message: "Select",
				promptStylePort,
				selectedLabel: "value",
				themePort,
			}),
		).toBe("v Select: value");
		expect(
			renderCompletedMultiselectLineFunction({
				isUnicodeSupported: false,
				message: "Multi",
				promptStylePort,
				selectedLabels: ["a", "b"],
				themePort,
			}),
		).toBe("v Multi: a, b");
		expect(
			renderCompletedGroupMultiselectLineFunction({
				isUnicodeSupported: false,
				message: "Group",
				promptStylePort,
				selectedLabels: [],
				themePort,
			}),
		).toBe("v Group");
	});
});
