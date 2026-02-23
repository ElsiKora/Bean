import { describe, expect, it, vi } from "vitest";
import { ListViewportService } from "../../../src/application/service/prompt/list-viewport.service";
import { PromptKeyDispatchService } from "../../../src/application/service/prompt/prompt-key-dispatch.service";
import { PromptNavigationService } from "../../../src/application/service/prompt/prompt-navigation.service";
import { PromptValidationService } from "../../../src/application/service/prompt/prompt-validation.service";
import { PromptMultiselectUseCase } from "../../../src/application/use-case/prompt/prompt-multiselect.use-case";
import { SelectOptionValueObject } from "../../../src/domain/value-object/select-option.value-object";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeInputPortFixture } from "../../e2e/fixtures/fake-input-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";
import { IdentityPromptStylePortFixture } from "../fixtures/identity-prompt-style-port.fixture";
import { IdentityThemePortFixture } from "../fixtures/identity-theme-port.fixture";

describe("PromptMultiselectUseCase", () => {
	it("returns null when all options are disabled", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const useCase = new PromptMultiselectUseCase({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			keyDispatchService: new PromptKeyDispatchService(),
			listViewportService: new ListViewportService(),
			navigationService: new PromptNavigationService(),
			outputPort: output,
			promptStylePort: new IdentityPromptStylePortFixture(),
			themePort: new IdentityThemePortFixture(),
			validationService: new PromptValidationService(),
		});

		await expect(
			useCase.execute({
				message: "Select scopes",
				options: [new SelectOptionValueObject({ isDisabled: true, label: "api", value: "api" })],
			}),
		).resolves.toBeNull();
		expect(output.lines.at(-1)).toContain("No selectable options are available.");
	});

	it("requires at least one selected option when required", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const useCase = new PromptMultiselectUseCase({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			keyDispatchService: new PromptKeyDispatchService(),
			listViewportService: new ListViewportService(),
			outputPort: output,
			navigationService: new PromptNavigationService(),
			promptStylePort: new IdentityPromptStylePortFixture(),
			themePort: new IdentityThemePortFixture(),
			validationService: new PromptValidationService(),
		});

		const execution = useCase.execute({
			isRequired: true,
			message: "Select scopes",
			options: [new SelectOptionValueObject({ label: "api", value: "api" }), new SelectOptionValueObject({ label: "ui", value: "ui" })],
		});

		input.emit({ NAME: "return" });
		expect(output.frames.at(-1)).toContain("Select at least one option.");

		input.emit({ NAME: "space" });
		input.emit({ NAME: "return" });
		await expect(execution).resolves.toEqual(["api"]);
		expect(output.lines.at(-1)).toContain("v Select scopes: api");
	});

	it("supports ctrl+a/ctrl+i toggles and renders separators/hints", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const onSubmit = vi.fn();
		const onState = vi.fn();
		const useCase = new PromptMultiselectUseCase({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			keyDispatchService: new PromptKeyDispatchService(),
			listViewportService: new ListViewportService(),
			navigationService: new PromptNavigationService(),
			outputPort: output,
			promptStylePort: new IdentityPromptStylePortFixture(),
			themePort: new IdentityThemePortFixture(),
			validationService: new PromptValidationService(),
		});

		const execution = useCase.execute({
			initialValues: ["a"],
			message: "Pick many",
			onState,
			onSubmit,
			options: [new SelectOptionValueObject({ isSeparator: true, label: "group", value: "_" }), new SelectOptionValueObject({ description: "desc-a", hint: "hint-a", label: "A", value: "a" }), new SelectOptionValueObject({ isDisabled: true, label: "B", value: "b" }), new SelectOptionValueObject({ label: "C", value: "c" })],
			withLoop: false,
		});

		input.emit({ IS_CTRL: true, NAME: "i" });
		input.emit({ IS_CTRL: true, NAME: "a" });
		input.emit({ NAME: "space" });
		input.emit({ NAME: "down" });
		input.emit({ NAME: "space" });
		input.emit({ NAME: "return" });

		await expect(execution).resolves.toEqual([]);
		expect(onState).toHaveBeenCalled();
		expect(onSubmit).toHaveBeenCalledWith([]);
		expect(output.frames.some((line) => line.includes("hint-a"))).toBe(true);
		expect(output.frames.some((line) => line.includes("--- group"))).toBe(true);
	});

	it("supports timeout cancellation hooks", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const clock = new FakeClockPortFixture();
		const onCancel = vi.fn();
		const useCase = new PromptMultiselectUseCase({
			clockPort: clock,
			inputPort: input,
			keyDispatchService: new PromptKeyDispatchService(),
			listViewportService: new ListViewportService(),
			navigationService: new PromptNavigationService(),
			outputPort: output,
			promptStylePort: new IdentityPromptStylePortFixture(),
			themePort: new IdentityThemePortFixture(),
			validationService: new PromptValidationService(),
		});

		const timeoutExecution = useCase.execute({
			message: "timeout",
			onCancel,
			options: [new SelectOptionValueObject({ label: "A", value: "a" })],
			timeoutMs: 1,
		});
		clock.runTimeouts();
		await expect(timeoutExecution).resolves.toBeNull();
		expect(onCancel).toHaveBeenCalledTimes(1);
	});
});
