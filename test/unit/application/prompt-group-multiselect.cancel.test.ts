import { describe, expect, it, vi } from "vitest";
import { ListViewportService } from "../../../src/application/service/prompt/list-viewport.service";
import { PromptKeyDispatchService } from "../../../src/application/service/prompt/prompt-key-dispatch.service";
import { PromptNavigationService } from "../../../src/application/service/prompt/prompt-navigation.service";
import { PromptValidationService } from "../../../src/application/service/prompt/prompt-validation.service";
import { PromptGroupMultiselectUseCase } from "../../../src/application/use-case/prompt/prompt-group-multiselect.use-case";
import { SelectOptionValueObject } from "../../../src/domain/value-object/select-option.value-object";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeInputPortFixture } from "../../e2e/fixtures/fake-input-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";
import { IdentityPromptStylePortFixture } from "../fixtures/identity-prompt-style-port.fixture";
import { IdentityThemePortFixture } from "../fixtures/identity-theme-port.fixture";

describe("PromptGroupMultiselectUseCase cancellation", () => {
	it("returns null on ctrl+d", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const useCase = new PromptGroupMultiselectUseCase({
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
			message: "Grouped",
			options: [new SelectOptionValueObject({ label: "a", value: "a", group: "g" })],
		});
		input.emit({ IS_CTRL: true, NAME: "d" });

		await expect(execution).resolves.toBeNull();
	});

	it("cancels by timeout and invokes callback", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const clock = new FakeClockPortFixture();
		const onCancel = vi.fn();
		const useCase = new PromptGroupMultiselectUseCase({
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
			message: "timeout-group",
			onCancel,
			options: [new SelectOptionValueObject({ label: "a", value: "a" })],
			timeoutMs: 1,
		});
		clock.runTimeouts();
		await expect(timeoutExecution).resolves.toBeNull();
		expect(onCancel).toHaveBeenCalledTimes(1);
	});
});
