import { describe, expect, it, vi } from "vitest";
import { PromptKeyDispatchService } from "../../../src/application/service/prompt/prompt-key-dispatch.service";
import { TextBufferService } from "../../../src/application/service/prompt/text-buffer.service";
import { PromptValidationService } from "../../../src/application/service/prompt/prompt-validation.service";
import { PromptTextUseCase } from "../../../src/application/use-case/prompt/prompt-text.use-case";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeInputPortFixture } from "../../e2e/fixtures/fake-input-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";
import { IdentityPromptStylePortFixture } from "../fixtures/identity-prompt-style-port.fixture";
import { IdentityThemePortFixture } from "../fixtures/identity-theme-port.fixture";

describe("PromptTextUseCase", () => {
	it("submits typed value and enforces required validation", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const useCase = new PromptTextUseCase({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			keyDispatchService: new PromptKeyDispatchService(),
			outputPort: output,
			promptStylePort: new IdentityPromptStylePortFixture(),
			textBufferService: new TextBufferService(),
			themePort: new IdentityThemePortFixture(),
			validationService: new PromptValidationService(),
		});

		const execution = useCase.execute({
			isRequired: true,
			message: "Commit message",
		});

		input.emit({ NAME: "return" });
		expect(output.frames.at(-1)).toContain("Value is required.");

		input.emit({ NAME: "", SEQUENCE: "f" });
		input.emit({ NAME: "", SEQUENCE: "i" });
		input.emit({ NAME: "", SEQUENCE: "x" });
		input.emit({ NAME: "return" });

		await expect(execution).resolves.toBe("fix");
		expect(output.lines.at(-1)).toContain("v Commit message: fix");
		expect(input.rawModeEnabled).toBe(false);
		expect(output.cursorHidden).toBe(false);
	});

	it("returns null on escape", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const useCase = new PromptTextUseCase({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			keyDispatchService: new PromptKeyDispatchService(),
			outputPort: output,
			promptStylePort: new IdentityPromptStylePortFixture(),
			textBufferService: new TextBufferService(),
			themePort: new IdentityThemePortFixture(),
			validationService: new PromptValidationService(),
		});

		const execution = useCase.execute({ message: "Message" });
		input.emit({ NAME: "escape" });

		await expect(execution).resolves.toBeNull();
	});

	it("handles backspace and custom validator", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const useCase = new PromptTextUseCase({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			keyDispatchService: new PromptKeyDispatchService(),
			outputPort: output,
			promptStylePort: new IdentityPromptStylePortFixture(),
			textBufferService: new TextBufferService(),
			themePort: new IdentityThemePortFixture(),
			validationService: new PromptValidationService(),
		});

		const execution = useCase.execute({
			message: "Message",
			validate: (value) => (value.startsWith("feat") ? null : "Must start with feat"),
		});

		input.emit({ NAME: "", SEQUENCE: "x" });
		input.emit({ NAME: "backspace" });
		input.emit({ NAME: "", SEQUENCE: "f" });
		input.emit({ NAME: "", SEQUENCE: "e" });
		input.emit({ NAME: "", SEQUENCE: "a" });
		input.emit({ NAME: "", SEQUENCE: "t" });
		input.emit({ NAME: "return" });

		await expect(execution).resolves.toBe("feat");
		expect(output.lines.at(-1)).toContain("v Message: feat");
		expect(output.frames.some((line) => line.includes("Must start with feat"))).toBe(false);
	});

	it("supports cursor commands, hooks, defaults, filter and timeout", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const clock = new FakeClockPortFixture();
		const onCancel = vi.fn();
		const onState = vi.fn();
		const onSubmit = vi.fn();
		const useCase = new PromptTextUseCase({
			clockPort: clock,
			inputPort: input,
			keyDispatchService: new PromptKeyDispatchService(),
			outputPort: output,
			promptStylePort: new IdentityPromptStylePortFixture(),
			textBufferService: new TextBufferService(),
			themePort: new IdentityThemePortFixture(),
			validationService: new PromptValidationService(),
		});

		const execution = useCase.execute({
			defaultValue: "default",
			filter: (value: string): string => value.toUpperCase(),
			initialValue: "ab cd",
			message: "Advanced",
			onState,
			onSubmit,
			transformer: (value: string): string => value,
		});
		input.emit({ IS_CTRL: true, NAME: "a" });
		input.emit({ NAME: "", SEQUENCE: "z" });
		input.emit({ NAME: "left" });
		input.emit({ NAME: "right" });
		input.emit({ NAME: "home" });
		input.emit({ NAME: "end" });
		input.emit({ IS_CTRL: true, NAME: "w" });
		input.emit({ IS_CTRL: true, NAME: "u" });
		input.emit({ IS_CTRL: true, NAME: "k" });
		input.emit({ NAME: "return" });

		await expect(execution).resolves.toBe("DEFAULT");
		expect(onState).toHaveBeenCalled();
		expect(onSubmit).toHaveBeenCalledWith("DEFAULT");

		const timeoutExecution = useCase.execute({
			message: "Timeout",
			onCancel,
			timeoutMs: 1,
		});
		clock.runTimeouts();
		await expect(timeoutExecution).resolves.toBeNull();
		expect(onCancel).toHaveBeenCalledTimes(1);
	});
});
