import { describe, expect, it } from "vitest";
import { ListViewportService } from "../../../src/application/service/prompt/list-viewport.service";
import { PromptKeyDispatchService } from "../../../src/application/service/prompt/prompt-key-dispatch.service";
import { PromptNavigationService } from "../../../src/application/service/prompt/prompt-navigation.service";
import { TextBufferService } from "../../../src/application/service/prompt/text-buffer.service";
import { PromptValidationService } from "../../../src/application/service/prompt/prompt-validation.service";
import { PromptRunnerFactory } from "../../../src/infrastructure/di/factory/prompt-runner.factory";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeInputPortFixture } from "../../e2e/fixtures/fake-input-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";
import { IdentityPromptStylePortFixture } from "../fixtures/identity-prompt-style-port.fixture";
import { IdentityThemePortFixture } from "../fixtures/identity-theme-port.fixture";

describe("PromptRunnerFactory", () => {
	it("creates prompt use-cases", () => {
		const factory = new PromptRunnerFactory({
			clockPort: new FakeClockPortFixture(),
			inputPort: new FakeInputPortFixture(),
			listViewportService: new ListViewportService(),
			outputPort: new FakeOutputPortFixture(),
			promptKeyDispatchService: new PromptKeyDispatchService(),
			promptNavigationService: new PromptNavigationService(),
			promptStylePort: new IdentityPromptStylePortFixture(),
			textBufferService: new TextBufferService(),
			themePort: new IdentityThemePortFixture(),
			promptValidationService: new PromptValidationService(),
		});

		expect(factory.createPromptTextUseCase()).toBeDefined();
		expect(factory.createPromptSelectUseCase()).toBeDefined();
		expect(factory.createPromptMultiselectUseCase()).toBeDefined();
		expect(factory.createPromptGroupMultiselectUseCase()).toBeDefined();
	});
});
