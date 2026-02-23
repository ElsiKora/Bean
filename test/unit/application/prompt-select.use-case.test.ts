import { describe, expect, it, vi } from "vitest";
import type { IPromptStylePortInterface } from "../../../src/application/interface/port/prompt-style-port.interface";
import { ListViewportService } from "../../../src/application/service/prompt/list-viewport.service";
import { PromptKeyDispatchService } from "../../../src/application/service/prompt/prompt-key-dispatch.service";
import { PromptNavigationService } from "../../../src/application/service/prompt/prompt-navigation.service";
import { PromptSelectUseCase } from "../../../src/application/use-case/prompt/prompt-select.use-case";
import { SelectOptionValueObject } from "../../../src/domain/value-object/select-option.value-object";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeInputPortFixture } from "../../e2e/fixtures/fake-input-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";
import { IdentityPromptStylePortFixture } from "../fixtures/identity-prompt-style-port.fixture";
import { IdentityThemePortFixture } from "../fixtures/identity-theme-port.fixture";

describe("PromptSelectUseCase", () => {
	it("navigates options and submits selected value", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const useCase = new PromptSelectUseCase({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			keyDispatchService: new PromptKeyDispatchService(),
			listViewportService: new ListViewportService(),
			outputPort: output,
			navigationService: new PromptNavigationService(),
			promptStylePort: new IdentityPromptStylePortFixture(),
			themePort: new IdentityThemePortFixture(),
		});

		const execution = useCase.execute({
			message: "Pick one",
			options: [new SelectOptionValueObject({ label: "A", value: "a" }), new SelectOptionValueObject({ isDisabled: true, label: "B", value: "b" }), new SelectOptionValueObject({ label: "C", value: "c" })],
		});

		input.emit({ NAME: "down" });
		input.emit({ NAME: "return" });

		await expect(execution).resolves.toBe("c");
		expect(output.frames.at(0)).toContain("\n\n");
		expect(output.lines.at(-1)).toContain("v Pick one: C");
	});

	it("returns null on ctrl+c", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const useCase = new PromptSelectUseCase({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			keyDispatchService: new PromptKeyDispatchService(),
			listViewportService: new ListViewportService(),
			outputPort: output,
			navigationService: new PromptNavigationService(),
			promptStylePort: new IdentityPromptStylePortFixture(),
			themePort: new IdentityThemePortFixture(),
		});

		const execution = useCase.execute({
			message: "Pick one",
			options: [new SelectOptionValueObject({ label: "A", value: "a" })],
		});

		input.emit({ IS_CTRL: true, NAME: "c" });
		await expect(execution).resolves.toBeNull();
	});

	it("uses custom prompt style configuration", async () => {
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
		const useCase = new PromptSelectUseCase({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			keyDispatchService: new PromptKeyDispatchService(),
			listViewportService: new ListViewportService(),
			outputPort: output,
			navigationService: new PromptNavigationService(),
			promptStylePort,
			themePort: new IdentityThemePortFixture(),
		});
		const execution = useCase.execute({
			message: "Pick one",
			options: [new SelectOptionValueObject({ label: "A", value: "a" }), new SelectOptionValueObject({ isDisabled: true, label: "B", value: "b" })],
		});
		input.emit({ NAME: "return" });

		await expect(execution).resolves.toBe("a");
		expect(output.frames.at(0)).toContain("Q Pick one");
		expect(output.frames.at(0)).not.toContain("\n\n");
		expect(output.frames.at(0)).toContain("-> A");
		expect(output.frames.at(0)).toContain("B (off)");
		expect(output.lines.at(-1)).toContain("OK Pick one: A");
	});

	it("returns null when all options are disabled", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const useCase = new PromptSelectUseCase({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			keyDispatchService: new PromptKeyDispatchService(),
			listViewportService: new ListViewportService(),
			outputPort: output,
			navigationService: new PromptNavigationService(),
			promptStylePort: new IdentityPromptStylePortFixture(),
			themePort: new IdentityThemePortFixture(),
		});

		await expect(
			useCase.execute({
				message: "Pick one",
				options: [new SelectOptionValueObject({ isDisabled: true, label: "A", value: "a" })],
			}),
		).resolves.toBeNull();
		expect(output.lines.at(-1)).toContain("No selectable options are available.");
	});

	it("supports state hooks, separators and timeout cancellation", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const clock = new FakeClockPortFixture();
		const onState = vi.fn();
		const onCancel = vi.fn();
		const useCase = new PromptSelectUseCase({
			clockPort: clock,
			inputPort: input,
			keyDispatchService: new PromptKeyDispatchService(),
			listViewportService: new ListViewportService(),
			navigationService: new PromptNavigationService(),
			outputPort: output,
			promptStylePort: new IdentityPromptStylePortFixture(),
			themePort: new IdentityThemePortFixture(),
		});

		const timeoutExecution = useCase.execute({
			message: "timed-select",
			onCancel,
			onState,
			options: [new SelectOptionValueObject({ isSeparator: true, label: "sep", value: "_" }), new SelectOptionValueObject({ description: "desc", hint: "hint", label: "A", value: "a" })],
			timeoutMs: 1,
			withLoop: false,
		});
		clock.runTimeouts();
		await expect(timeoutExecution).resolves.toBeNull();
		expect(onState).toHaveBeenCalled();
		expect(onCancel).toHaveBeenCalledTimes(1);
		expect(output.frames.some((line) => line.includes("hint"))).toBe(true);
	});
});
