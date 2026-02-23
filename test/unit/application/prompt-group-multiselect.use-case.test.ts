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

describe("PromptGroupMultiselectUseCase", () => {
	it("returns null when all options are disabled", async () => {
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

		await expect(
			useCase.execute({
				message: "Select grouped scopes",
				options: [new SelectOptionValueObject({ isDisabled: true, label: "core", value: "core", group: "backend" })],
			}),
		).resolves.toBeNull();
		expect(output.lines.at(-1)).toContain("No selectable options are available.");
	});

	it("toggles full group with 'a' and submits values", async () => {
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
			message: "Select grouped scopes",
			options: [new SelectOptionValueObject({ label: "core", value: "core", group: "backend" }), new SelectOptionValueObject({ label: "api", value: "api", group: "backend" }), new SelectOptionValueObject({ label: "ui", value: "ui", group: "frontend" })],
		});

		input.emit({ NAME: "a", SEQUENCE: "a" });
		input.emit({ NAME: "return" });

		await expect(execution).resolves.toEqual(["core", "api"]);
		expect(output.lines.at(-1)).toContain("v Select grouped scopes: core, api");
	});

	it("supports ctrl+a and ctrl+i selection helpers", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const onSubmit = vi.fn();
		const useCase = new PromptGroupMultiselectUseCase({
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
			message: "Select grouped scopes",
			onSubmit,
			options: [new SelectOptionValueObject({ label: "core", value: "core", group: "backend" }), new SelectOptionValueObject({ isDisabled: true, label: "api", value: "api", group: "backend" }), new SelectOptionValueObject({ label: "ui", value: "ui", group: "frontend" })],
			withLoop: false,
		});

		input.emit({ IS_CTRL: true, NAME: "a" });
		input.emit({ IS_CTRL: true, NAME: "i" });
		input.emit({ NAME: "return" });

		await expect(execution).resolves.toEqual([]);
		expect(onSubmit).toHaveBeenCalledWith([]);
		expect(output.frames.some((line) => line.includes("backend"))).toBe(true);
	});
});
