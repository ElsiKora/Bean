import { describe, expect, it, vi } from "vitest";
import { SelectOptionValueObject } from "../../../src/domain/value-object/select-option.value-object";
import { BeanPromptService } from "../../../src/presentation/bean/service/bean-prompt.service";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";
import { IdentityThemePortFixture } from "../fixtures/identity-theme-port.fixture";

type TPromptUseCaseMock<TResult> = {
	execute: (input: unknown) => Promise<TResult>;
};

const createPromptUseCaseMock = <TResult>(resolvedValue: TResult): TPromptUseCaseMock<TResult> => {
	return {
		execute: vi.fn(async (): Promise<TResult> => resolvedValue),
	};
};

describe("BeanPromptService", () => {
	it("falls back when interactive prompts are unavailable", async () => {
		const outputPort = new FakeOutputPortFixture();
		const textUseCase = {
			execute: vi.fn(async (): Promise<null | string> => {
				throw new Error("Interactive prompts require a TTY stdin.");
			}),
		};
		const onLog = vi.fn();
		const service = new BeanPromptService({
			editorPort: {
				open: vi.fn(async (): Promise<string> => ""),
			},
			environment: {},
			isDebugEnabled: true,
			isSilent: false,
			onLog,
			outputPort,
			promptGroupMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptSelectUseCase: createPromptUseCaseMock<null | string>(null) as never,
			promptTextUseCase: textUseCase as never,
			themePort: new IdentityThemePortFixture(),
		});

		await expect(
			service.text({
				fallbackValue: "fallback",
				message: "Question",
			}),
		).resolves.toBe("fallback");
		expect(outputPort.lines.some((line: string): boolean => line.includes("Interactive prompt fallback used."))).toBe(true);
		expect(onLog).not.toHaveBeenCalled();
	});

	it("uses external editor when configured and prints completed line", async () => {
		const outputPort = new FakeOutputPortFixture({ supportsUnicode: false });
		const editorOpen = vi.fn(async (): Promise<string> => "edited");
		const service = new BeanPromptService({
			editorPort: {
				open: editorOpen,
			},
			environment: { EDITOR: "vim" },
			isDebugEnabled: false,
			isSilent: false,
			onLog: vi.fn(),
			outputPort,
			promptGroupMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptSelectUseCase: createPromptUseCaseMock<null | string>(null) as never,
			promptTextUseCase: createPromptUseCaseMock<null | string>(null) as never,
			themePort: new IdentityThemePortFixture(),
		});

		await expect(
			service.editor({
				message: "Edit text",
			}),
		).resolves.toBe("edited");
		expect(editorOpen).toHaveBeenCalledWith({
			command: "vim",
			initialValue: "",
		});
		expect(outputPort.lines.at(-1)).toContain("Edit text: edited");
	});

	it("passes masking callbacks to password prompt", async () => {
		const promptTextExecute = vi.fn(async (input: { formatSubmittedValue?: (value: string) => string; transformer?: (value: string) => string }): Promise<null | string> => {
			expect(input.transformer?.("secret")).toBe("******");
			expect(input.formatSubmittedValue?.("secret")).toBe("******");

			return "secret";
		});
		const service = new BeanPromptService({
			editorPort: {
				open: vi.fn(async (): Promise<string> => ""),
			},
			environment: {},
			isDebugEnabled: false,
			isSilent: false,
			onLog: vi.fn(),
			outputPort: new FakeOutputPortFixture(),
			promptGroupMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptSelectUseCase: createPromptUseCaseMock<null | string>(null) as never,
			promptTextUseCase: { execute: promptTextExecute } as never,
			themePort: new IdentityThemePortFixture(),
		});

		await expect(
			service.password({
				maskCharacter: "*",
				message: "Password",
			}),
		).resolves.toBe("secret");
		expect(promptTextExecute).toHaveBeenCalledTimes(1);
	});

	it("returns null and logs warning when autocomplete source is empty", async () => {
		const onLog = vi.fn();
		const service = new BeanPromptService({
			editorPort: {
				open: vi.fn(async (): Promise<string> => ""),
			},
			environment: {},
			isDebugEnabled: false,
			isSilent: false,
			onLog,
			outputPort: new FakeOutputPortFixture(),
			promptGroupMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptSelectUseCase: createPromptUseCaseMock<null | string>("selected") as never,
			promptTextUseCase: createPromptUseCaseMock<null | string>("query") as never,
			themePort: new IdentityThemePortFixture(),
		});

		await expect(
			service.autocomplete({
				message: "Pick",
				source: async (): Promise<ReadonlyArray<never>> => [],
			}),
		).resolves.toBeNull();
		expect(onLog).toHaveBeenCalledWith({
			level: "warn",
			message: "No options available.",
		});
	});

	it("uses schema messages and validates select/multiselect options at runtime", async () => {
		const option = new SelectOptionValueObject({
			label: "A",
			value: "a",
		});
		const promptTextExecute = vi.fn(async (): Promise<null | string> => "title");
		const promptSelectExecute = vi.fn(async (): Promise<null | string> => "a");
		const promptMultiselectExecute = vi.fn(async (): Promise<null | ReadonlyArray<string>> => ["a"]);
		const service = new BeanPromptService({
			editorPort: {
				open: vi.fn(async (): Promise<string> => ""),
			},
			environment: {},
			isDebugEnabled: false,
			isSilent: false,
			onLog: vi.fn(),
			outputPort: new FakeOutputPortFixture(),
			promptGroupMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptMultiselectUseCase: { execute: promptMultiselectExecute } as never,
			promptSelectUseCase: { execute: promptSelectExecute } as never,
			promptTextUseCase: { execute: promptTextExecute } as never,
			themePort: new IdentityThemePortFixture(),
		});

		await expect(
			service.promptFromSchema({
				schema: {
					mode: { kind: "select", message: "Select mode", options: [option] },
					scopes: { kind: "multiselect", message: "Select scopes", options: [option] },
					title: { kind: "text", message: "Commit title" },
				},
			}),
		).resolves.toEqual({
			mode: "a",
			scopes: ["a"],
			title: "title",
		});
		expect(promptTextExecute).toHaveBeenCalledWith(expect.objectContaining({ message: "Commit title" }));
		expect(promptSelectExecute).toHaveBeenCalledWith(expect.objectContaining({ message: "Select mode" }));
		expect(promptMultiselectExecute).toHaveBeenCalledWith(expect.objectContaining({ message: "Select scopes" }));

		await expect(
			service.promptFromSchema({
				schema: {
					mode: { kind: "select", options: [] },
				},
			}),
		).rejects.toThrow('Schema "select" field requires at least one option.');
		await expect(
			service.promptFromSchema({
				schema: {
					scopes: { kind: "multiselect", options: [] },
				},
			}),
		).rejects.toThrow('Schema "multiselect" field requires at least one option.');
	});

	it("renders treeSelect options with branch prefixes", async () => {
		const promptMultiselectExecute = vi.fn(async (): Promise<null | ReadonlyArray<string>> => ["feature"]);
		const service = new BeanPromptService({
			editorPort: {
				open: vi.fn(async (): Promise<string> => ""),
			},
			environment: {},
			isDebugEnabled: false,
			isSilent: false,
			onLog: vi.fn(),
			outputPort: new FakeOutputPortFixture({ supportsUnicode: true }),
			promptGroupMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptMultiselectUseCase: { execute: promptMultiselectExecute } as never,
			promptSelectUseCase: createPromptUseCaseMock<null | string>(null) as never,
			promptTextUseCase: createPromptUseCaseMock<null | string>(null) as never,
			themePort: new IdentityThemePortFixture(),
		});

		await expect(
			service.treeSelect({
				message: "Pick scopes",
				nodes: [
					{
						children: [{ label: "feature", value: "feature" }],
						label: "core",
						value: "core",
					},
				],
			}),
		).resolves.toEqual(["feature"]);
		expect(promptMultiselectExecute).toHaveBeenCalledWith(
			expect.objectContaining({
				options: [expect.objectContaining({ label: "└─ core" }), expect.objectContaining({ label: "   └─ feature" })],
			}),
		);
	});

	it("validates strict ISO date input with optional min/max bounds", async () => {
		const promptTextExecute = vi.fn(async (input: { placeholder?: string; validate?: (value: string) => null | string }): Promise<null | string> => {
			expect(input.placeholder).toBe("YYYY-MM-DD");
			expect(input.validate?.("2026-02-30")).toBe("Enter date in YYYY-MM-DD format.");
			expect(input.validate?.("2026-01-09")).toContain("Date must be on or after");
			expect(input.validate?.("2026-01-21")).toContain("Date must be on or before");

			return "2026-01-15";
		});
		const service = new BeanPromptService({
			editorPort: {
				open: vi.fn(async (): Promise<string> => ""),
			},
			environment: {},
			isDebugEnabled: false,
			isSilent: false,
			onLog: vi.fn(),
			outputPort: new FakeOutputPortFixture(),
			promptGroupMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptSelectUseCase: createPromptUseCaseMock<null | string>(null) as never,
			promptTextUseCase: { execute: promptTextExecute } as never,
			themePort: new IdentityThemePortFixture(),
		});

		await expect(
			service.date({
				max: new Date("2026-01-20T17:45:00.000Z"),
				message: "Date",
				min: new Date("2026-01-10T01:00:00.000Z"),
			}),
		).resolves.toEqual(new Date("2026-01-15T00:00:00.000Z"));
	});

	it("validates number input with integer and step constraints", async () => {
		const promptTextExecute = vi.fn(async (input: { placeholder?: string; validate?: (value: string) => null | string }): Promise<null | string> => {
			expect(input.placeholder).toBe("0");
			expect(input.validate?.("4.5")).toBe("Enter a whole number.");
			expect(input.validate?.("5")).toBe("Value must follow step 2.");
			expect(input.validate?.("4")).toBeNull();

			return "4";
		});
		const service = new BeanPromptService({
			editorPort: {
				open: vi.fn(async (): Promise<string> => ""),
			},
			environment: {},
			isDebugEnabled: false,
			isSilent: false,
			onLog: vi.fn(),
			outputPort: new FakeOutputPortFixture(),
			promptGroupMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptMultiselectUseCase: createPromptUseCaseMock<null | ReadonlyArray<string>>(null) as never,
			promptSelectUseCase: createPromptUseCaseMock<null | string>(null) as never,
			promptTextUseCase: { execute: promptTextExecute } as never,
			themePort: new IdentityThemePortFixture(),
		});

		await expect(
			service.number({
				isInteger: true,
				max: 10,
				message: "Number",
				min: 0,
				step: 2,
			}),
		).resolves.toBe(4);
		await expect(
			service.number({
				message: "Invalid step",
				step: 0,
			}),
		).rejects.toThrow("Step must be greater than 0.");
	});
});
