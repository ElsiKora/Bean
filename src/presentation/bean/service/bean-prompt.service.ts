import type { IEditorPortInterface } from "@application/interface/port/editor-port.interface";
import type { IOutputPortInterface } from "@application/interface/port/output-port.interface";
import type { IThemePortInterface } from "@application/interface/port/theme-port.interface";
import type { PromptGroupMultiselectUseCase } from "@application/use-case/prompt/prompt-group-multiselect.use-case";
import type { PromptMultiselectUseCase } from "@application/use-case/prompt/prompt-multiselect.use-case";
import type { PromptSelectUseCase } from "@application/use-case/prompt/prompt-select.use-case";
import type { PromptTextUseCase } from "@application/use-case/prompt/prompt-text.use-case";

import type { IBeanMultiselectPromptInputInterface, IBeanSelectPromptInputInterface, IBeanTextPromptInputInterface } from "../../interface";
import type { TAutocompleteInputType, TBeanConfirmInputType, TBeanDateInputType, TBeanEditorInputType, TBeanExpandInputType, TBeanGroupInputType, TBeanListInputType, TBeanNumberInputType, TBeanPasswordInputType, TBeanPromptSchemaItemType, TBeanPromptSchemaType, TBeanRatingInputType, TBeanRawlistInputType, TBeanToggleInputType, TBeanTreeSelectInputType, TBeanTreeSelectNodeType } from "../type";

import { SelectOptionValueObject } from "@domain/value-object/select-option.value-object";

import { EDITOR_NOT_CONFIGURED_ERROR_MESSAGE_CONSTANT, NON_TTY_INPUT_ERROR_MESSAGE_FRAGMENT_CONSTANT, ONE_CONSTANT, RATING_MAX_DEFAULT_CONSTANT, TEN_CONSTANT, ZERO_CONSTANT } from "../constant";

const NUMBER_STEP_VALIDATION_EPSILON_CONSTANT: number = 1e-9;
const DATE_FORMAT_PLACEHOLDER_CONSTANT: string = "YYYY-MM-DD";
const DATE_FORMAT_ERROR_MESSAGE_CONSTANT: string = "Enter date in YYYY-MM-DD format.";
const DATE_MAXIMUM_ERROR_MESSAGE_PREFIX_CONSTANT: string = "Date must be on or before";
const DATE_MINIMUM_ERROR_MESSAGE_PREFIX_CONSTANT: string = "Date must be on or after";
const DATE_PARTS_COUNT_CONSTANT: number = 3;
const ISO_DATE_REGEX_CONSTANT: RegExp = /^\d{4}-\d{2}-\d{2}$/u;
const NUMBER_INVALID_ERROR_MESSAGE_CONSTANT: string = "Enter a valid number.";
const NUMBER_INTEGER_ERROR_MESSAGE_CONSTANT: string = "Enter a whole number.";
const NUMBER_STEP_INVALID_ERROR_MESSAGE_PREFIX_CONSTANT: string = "Value must follow step";
const NUMBER_STEP_POSITIVE_ERROR_MESSAGE_CONSTANT: string = "Step must be greater than 0.";
const SCHEMA_EMPTY_FIELD_KEY_ERROR_MESSAGE_CONSTANT: string = "Schema field key must not be empty.";
const SCHEMA_EMPTY_FIELD_MESSAGE_ERROR_MESSAGE_CONSTANT: string = "Schema field message must not be empty.";
const SCHEMA_FALLBACK_MULTISELECT_TYPE_ERROR_MESSAGE_CONSTANT: string = "Schema fallback value for multiselect must be an array of strings.";
const SCHEMA_FALLBACK_STRING_TYPE_ERROR_MESSAGE_CONSTANT: string = "Schema fallback value must be a string.";
const SCHEMA_MULTISELECT_OPTIONS_REQUIRED_ERROR_MESSAGE_CONSTANT: string = 'Schema "multiselect" field requires at least one option.';
const SCHEMA_SELECT_OPTIONS_REQUIRED_ERROR_MESSAGE_CONSTANT: string = 'Schema "select" field requires at least one option.';
const TREE_ASCII_BRANCH_LAST_PREFIX_CONSTANT: string = String.raw`\- `;
const TREE_ASCII_BRANCH_MIDDLE_PREFIX_CONSTANT: string = "|- ";
const TREE_ASCII_CONTINUATION_PREFIX_CONSTANT: string = "|  ";
const TREE_ASCII_EMPTY_CONTINUATION_PREFIX_CONSTANT: string = "   ";
const TREE_UNICODE_BRANCH_LAST_PREFIX_CONSTANT: string = "└─ ";
const TREE_UNICODE_BRANCH_MIDDLE_PREFIX_CONSTANT: string = "├─ ";
const TREE_UNICODE_CONTINUATION_PREFIX_CONSTANT: string = "│  ";
const TREE_UNICODE_EMPTY_CONTINUATION_PREFIX_CONSTANT: string = "   ";

export class BeanPromptService {
	private readonly EDITOR_PORT: IEditorPortInterface;

	private readonly ENVIRONMENT: Readonly<Record<string, string | undefined>>;

	private readonly IS_DEBUG_ENABLED: boolean;

	private readonly IS_SILENT: boolean;

	private readonly ON_LOG: (input: { level: "error" | "info" | "success" | "warn"; message: string }) => void;

	private readonly OUTPUT_PORT: IOutputPortInterface;

	private readonly PROMPT_GROUP_MULTISELECT_USE_CASE: PromptGroupMultiselectUseCase;

	private readonly PROMPT_MULTISELECT_USE_CASE: PromptMultiselectUseCase;

	private readonly PROMPT_SELECT_USE_CASE: PromptSelectUseCase;

	private readonly PROMPT_TEXT_USE_CASE: PromptTextUseCase;

	private readonly THEME_PORT: IThemePortInterface;

	public constructor(input: {
		editorPort: IEditorPortInterface;
		environment: Readonly<Record<string, string | undefined>>;
		isDebugEnabled: boolean;
		isSilent: boolean;
		onLog: (input: { level: "error" | "info" | "success" | "warn"; message: string }) => void;
		outputPort: IOutputPortInterface;
		promptGroupMultiselectUseCase: PromptGroupMultiselectUseCase;
		promptMultiselectUseCase: PromptMultiselectUseCase;
		promptSelectUseCase: PromptSelectUseCase;
		promptTextUseCase: PromptTextUseCase;
		themePort: IThemePortInterface;
	}) {
		this.EDITOR_PORT = input.editorPort;
		this.ENVIRONMENT = input.environment;
		this.IS_DEBUG_ENABLED = input.isDebugEnabled;
		this.IS_SILENT = input.isSilent;
		this.ON_LOG = input.onLog;
		this.OUTPUT_PORT = input.outputPort;
		this.PROMPT_TEXT_USE_CASE = input.promptTextUseCase;
		this.PROMPT_SELECT_USE_CASE = input.promptSelectUseCase;
		this.PROMPT_MULTISELECT_USE_CASE = input.promptMultiselectUseCase;
		this.PROMPT_GROUP_MULTISELECT_USE_CASE = input.promptGroupMultiselectUseCase;
		this.THEME_PORT = input.themePort;
	}

	public async autocomplete(input: TAutocompleteInputType): Promise<null | string> {
		const fallbackQuery: string | undefined = input.initialQuery ?? input.fallbackValue;

		const query: null | string = await this.text({
			fallbackValue: fallbackQuery,
			initialValue: input.initialQuery,
			message: input.queryMessage ?? `${input.message} (search)`,
			placeholder: "Type to search",
		});

		if (query === null) {
			return null;
		}

		const options: ReadonlyArray<SelectOptionValueObject> = await Promise.resolve(input.source(query));

		if (options.length === ZERO_CONSTANT) {
			this.ON_LOG({
				level: "warn",
				message: "No options available.",
			});

			return null;
		}

		return await this.select({
			defaultValue: input.fallbackValue,
			fallbackValue: input.fallbackValue,
			message: input.message,
			options,
		});
	}

	public async confirm(input: TBeanConfirmInputType): Promise<boolean | null> {
		const defaultAnswer: string = input.isDefaultValue === false ? "n" : "y";
		let fallbackAnswer: string | undefined;

		if (input.isFallbackValue !== undefined) {
			fallbackAnswer = input.isFallbackValue ? "yes" : "no";
		}

		const result: null | string = await this.text({
			defaultValue: defaultAnswer,
			fallbackValue: fallbackAnswer,
			isRequired: true,
			message: `${input.message} (${input.isDefaultValue === false ? "y/N" : "Y/n"})`,
			validate: (value: string): null | string => {
				const normalizedValue: string = value.trim().toLowerCase();

				if (normalizedValue === "y" || normalizedValue === "yes" || normalizedValue === "n" || normalizedValue === "no") {
					return null;
				}

				return "Please enter y or n.";
			},
		});

		if (result === null) {
			return null;
		}

		const normalizedResult: string = result.trim().toLowerCase();

		return normalizedResult === "y" || normalizedResult === "yes";
	}

	public async date(input: TBeanDateInputType): Promise<Date | null> {
		const defaultValueText: string | undefined = input.defaultValue === undefined ? undefined : this.formatDateInputValue(input.defaultValue);
		const fallbackValueText: string | undefined = input.fallbackValue === undefined ? undefined : this.formatDateInputValue(input.fallbackValue);
		const minimumDate: Date | undefined = input.min === undefined ? undefined : (this.parseIsoDateInput(this.formatDateInputValue(input.min)) ?? undefined);
		const maximumDate: Date | undefined = input.max === undefined ? undefined : (this.parseIsoDateInput(this.formatDateInputValue(input.max)) ?? undefined);

		if (minimumDate !== undefined && maximumDate !== undefined && minimumDate.getTime() > maximumDate.getTime()) {
			throw new Error("Date min must be <= max.");
		}

		const result: null | string = await this.text({
			defaultValue: defaultValueText,
			fallbackValue: fallbackValueText,
			isRequired: input.isRequired,
			message: input.message,
			placeholder: DATE_FORMAT_PLACEHOLDER_CONSTANT,
			validate: (value: string): null | string => {
				const dateValue: Date | null = this.parseIsoDateInput(value);

				if (dateValue === null) {
					return DATE_FORMAT_ERROR_MESSAGE_CONSTANT;
				}

				if (minimumDate !== undefined && dateValue.getTime() < minimumDate.getTime()) {
					return `${DATE_MINIMUM_ERROR_MESSAGE_PREFIX_CONSTANT} ${this.formatDateInputValue(minimumDate)}.`;
				}

				if (maximumDate !== undefined && dateValue.getTime() > maximumDate.getTime()) {
					return `${DATE_MAXIMUM_ERROR_MESSAGE_PREFIX_CONSTANT} ${this.formatDateInputValue(maximumDate)}.`;
				}

				return null;
			},
		});

		if (result === null) {
			return null;
		}

		const parsedDate: Date | null = this.parseIsoDateInput(result);

		if (parsedDate === null) {
			throw new Error(DATE_FORMAT_ERROR_MESSAGE_CONSTANT);
		}

		return parsedDate;
	}

	public async editor(input: TBeanEditorInputType): Promise<null | string> {
		const editorCommand: string | undefined = input.editorCommand ?? this.ENVIRONMENT.VISUAL ?? this.ENVIRONMENT.EDITOR;

		if (editorCommand === undefined || editorCommand.trim().length === ZERO_CONSTANT) {
			this.debug(EDITOR_NOT_CONFIGURED_ERROR_MESSAGE_CONSTANT);

			return await this.text({
				defaultValue: input.defaultValue,
				fallbackValue: input.fallbackValue,
				initialValue: input.initialValue,
				isRequired: input.isRequired,
				message: input.message,
				validate: input.validate,
			});
		}

		const editedValue: string = await this.EDITOR_PORT.open({
			command: editorCommand,
			initialValue: input.initialValue ?? input.defaultValue ?? "",
		});
		const value: string = editedValue.trim().length === ZERO_CONSTANT && input.defaultValue !== undefined ? input.defaultValue : editedValue;
		const requiredError: null | string = (input.isRequired ?? false) && value.trim().length === ZERO_CONSTANT ? "Value is required." : null;
		const customError: null | string = input.validate?.(value) ?? null;
		const validationError: null | string = requiredError ?? customError;

		if (validationError !== null) {
			this.OUTPUT_PORT.writeLine(this.THEME_PORT.danger(validationError));

			return null;
		}

		const completedMark: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? "✔" : "v";
		const completedLine: string = `${this.THEME_PORT.success(completedMark)} ${this.THEME_PORT.strong(input.message)}: ${value}`;
		this.OUTPUT_PORT.writeLine(completedLine);

		return value;
	}

	public async expand(input: TBeanExpandInputType): Promise<null | string> {
		const shortcutOptions: Array<string> = input.options.map((option: SelectOptionValueObject): string => (option.shortKey === null ? "" : `${option.shortKey}:${option.label}`)).filter((value: string): boolean => value.length > ZERO_CONSTANT);

		if (shortcutOptions.length > ZERO_CONSTANT) {
			const rawValue: null | string = await this.text({
				fallbackValue: input.fallbackValue,
				message: `${input.message} (${shortcutOptions.join(", ")})`,
				placeholder: "Type shortcut",
			});

			if (rawValue === null) {
				return null;
			}

			const matchedOption: SelectOptionValueObject | undefined = input.options.find((option: SelectOptionValueObject): boolean => option.shortKey?.toLowerCase() === rawValue.toLowerCase());

			if (matchedOption !== undefined) {
				return matchedOption.value;
			}
		}

		return await this.select({
			defaultValue: input.fallbackValue,
			message: input.message,
			options: input.options,
		});
	}

	public async group(input: TBeanGroupInputType): Promise<null | Readonly<Record<string, unknown>>> {
		const context: Record<string, unknown> = {};

		for (const step of input.steps) {
			const shouldRunStep: boolean = step.when === undefined ? true : await Promise.resolve(step.when(context));

			if (!shouldRunStep) {
				continue;
			}

			const result: unknown = await step.run(context);

			if (result === null) {
				input.onCancel?.(context);

				return null;
			}

			context[step.key] = result;
		}
		const readonlyContext: Readonly<Record<string, unknown>> = context;
		input.onSubmit?.(readonlyContext);

		return readonlyContext;
	}

	public async groupMultiselect(input: IBeanMultiselectPromptInputInterface): Promise<null | ReadonlyArray<string>> {
		return await this.executePromptWithFallback({
			fallbackValue: input.fallbackValue,
			run: async (): Promise<null | ReadonlyArray<string>> => {
				const options: ReadonlyArray<SelectOptionValueObject> = input.optionsLoader === undefined ? input.options : await this.resolvePromptOptions({ options: input.options, optionsLoader: input.optionsLoader, query: "" });

				return await this.PROMPT_GROUP_MULTISELECT_USE_CASE.execute({
					abortSignal: input.abortSignal,
					initialValues: input.initialValues,
					isRequired: input.isRequired,
					isSearchEnabled: input.isSearchEnabled,
					message: input.message,
					onCancel: input.onCancel,
					onState: input.onState,
					onSubmit: input.onSubmit,
					options,
					pageSize: input.pageSize,
					renderFrame: input.renderFrame,
					timeoutMs: input.timeoutMs,
					withLoop: input.withLoop,
				});
			},
		});
	}

	public async list(input: TBeanListInputType): Promise<null | ReadonlyArray<string>> {
		const separator: string = input.separator ?? ",";
		const defaultValue: string | undefined = input.defaultValue?.join(`${separator} `);
		const fallbackValue: string | undefined = input.fallbackValue?.join(separator);

		const value: null | string = await this.text({
			defaultValue,
			fallbackValue,
			isRequired: input.isRequired,
			message: input.message,
			placeholder: `value${separator} value`,
		});

		if (value === null) {
			return null;
		}

		return value
			.split(separator)
			.map((item: string): string => item.trim())
			.filter((item: string): boolean => item.length > ZERO_CONSTANT);
	}

	public async multiselect(input: IBeanMultiselectPromptInputInterface): Promise<null | ReadonlyArray<string>> {
		return await this.executePromptWithFallback({
			fallbackValue: input.fallbackValue,
			run: async (): Promise<null | ReadonlyArray<string>> => {
				const options: ReadonlyArray<SelectOptionValueObject> = input.optionsLoader === undefined ? input.options : await this.resolvePromptOptions({ options: input.options, optionsLoader: input.optionsLoader, query: "" });

				return await this.PROMPT_MULTISELECT_USE_CASE.execute({
					abortSignal: input.abortSignal,
					initialValues: input.initialValues,
					isRequired: input.isRequired,
					isSearchEnabled: input.isSearchEnabled,
					message: input.message,
					onCancel: input.onCancel,
					onState: input.onState,
					onSubmit: input.onSubmit,
					options,
					pageSize: input.pageSize,
					renderFrame: input.renderFrame,
					timeoutMs: input.timeoutMs,
					withLoop: input.withLoop,
				});
			},
		});
	}

	public async number(input: TBeanNumberInputType): Promise<null | number> {
		const minimum: number | undefined = input.min;
		const maximum: number | undefined = input.max;
		const step: number = input.step ?? ONE_CONSTANT;
		const isInteger: boolean = input.isInteger ?? false;

		if (step <= ZERO_CONSTANT) {
			throw new Error(NUMBER_STEP_POSITIVE_ERROR_MESSAGE_CONSTANT);
		}

		const result: null | string = await this.text({
			defaultValue: input.defaultValue === undefined ? undefined : String(input.defaultValue),
			fallbackValue: input.fallbackValue === undefined ? undefined : String(input.fallbackValue),
			isRequired: input.isRequired,
			message: input.message,
			placeholder: input.placeholder ?? (isInteger ? "0" : "0.0"),
			validate: (value: string): null | string => {
				const normalizedValue: string = value.trim();
				const numberValue: number = Number(normalizedValue);

				if (Number.isNaN(numberValue)) {
					return NUMBER_INVALID_ERROR_MESSAGE_CONSTANT;
				}

				if (isInteger && !Number.isInteger(numberValue)) {
					return NUMBER_INTEGER_ERROR_MESSAGE_CONSTANT;
				}

				if (minimum !== undefined && numberValue < minimum) {
					return `Value must be >= ${String(minimum)}.`;
				}

				if (maximum !== undefined && numberValue > maximum) {
					return `Value must be <= ${String(maximum)}.`;
				}

				const baseValue: number = minimum ?? ZERO_CONSTANT;
				const ratio: number = (numberValue - baseValue) / step;

				if (Math.abs(ratio - Math.round(ratio)) > NUMBER_STEP_VALIDATION_EPSILON_CONSTANT) {
					return `${NUMBER_STEP_INVALID_ERROR_MESSAGE_PREFIX_CONSTANT} ${String(step)}.`;
				}

				return null;
			},
		});

		if (result === null) {
			return null;
		}

		const parsedValue: number = Number(result.trim());

		return isInteger ? Math.trunc(parsedValue) : parsedValue;
	}

	public async password(input: TBeanPasswordInputType): Promise<null | string> {
		const maskCharacter: string = (input.maskCharacter?.slice(ZERO_CONSTANT, ONE_CONSTANT) ?? "*") || "*";

		return await this.executePromptWithFallback({
			fallbackValue: input.fallbackValue,
			run: async (): Promise<null | string> => {
				return await this.PROMPT_TEXT_USE_CASE.execute({
					defaultValue: input.defaultValue,
					formatSubmittedValue: (value: string): string => this.maskValue(value, maskCharacter),
					initialValue: input.initialValue,
					isRequired: input.isRequired,
					message: input.message,
					timeoutMs: input.timeoutMs,
					transformer: (value: string): string => this.maskValue(value, maskCharacter),
					validate: input.validate,
				});
			},
		});
	}

	public async promptFromSchema(input: { fallbackValues?: Readonly<Record<string, unknown>>; schema: TBeanPromptSchemaType }): Promise<null | Readonly<Record<string, unknown>>> {
		const result: Record<string, unknown> = {};
		this.validatePromptSchema(input.schema);

		for (const [key, schemaItem] of Object.entries(input.schema)) {
			const message: string = this.resolveSchemaMessage({
				fieldKey: key,
				schemaItem,
			});

			if (schemaItem.kind === "text") {
				const promptResult: null | string = await this.text({
					...schemaItem,
					fallbackValue: this.resolveSchemaStringFallbackValue({
						fallbackValues: input.fallbackValues,
						fieldKey: key,
					}),
					message,
				});

				if (promptResult === null) {
					return null;
				}

				result[key] = promptResult;

				continue;
			}

			if (schemaItem.kind === "select") {
				const promptResult: null | string = await this.select({
					...schemaItem,
					fallbackValue: this.resolveSchemaStringFallbackValue({
						fallbackValues: input.fallbackValues,
						fieldKey: key,
					}),
					message,
					options: schemaItem.options,
				});

				if (promptResult === null) {
					return null;
				}

				result[key] = promptResult;

				continue;
			}

			const promptResult: null | ReadonlyArray<string> = await this.multiselect({
				...schemaItem,
				fallbackValue: this.resolveSchemaStringArrayFallbackValue({
					fallbackValues: input.fallbackValues,
					fieldKey: key,
				}),
				message,
				options: schemaItem.options,
			});

			if (promptResult === null) {
				return null;
			}

			result[key] = promptResult;
		}

		return result;
	}

	public async rating(input: TBeanRatingInputType): Promise<null | number> {
		const min: number = Math.max(input.min ?? ONE_CONSTANT, ONE_CONSTANT);
		const max: number = Math.max(input.max ?? RATING_MAX_DEFAULT_CONSTANT, min);

		const result: null | number = await this.number({
			defaultValue: input.defaultValue,
			fallbackValue: input.fallbackValue,
			isRequired: true,
			max,
			message: input.message,
			min,
			step: ONE_CONSTANT,
		});

		if (result === null) {
			return null;
		}

		return Math.min(Math.max(Math.round(result), min), max);
	}

	public async rawlist(input: TBeanRawlistInputType): Promise<null | string> {
		const options: ReadonlyArray<SelectOptionValueObject> = input.options.map(
			(option: SelectOptionValueObject, index: number): SelectOptionValueObject =>
				new SelectOptionValueObject({
					description: option.description ?? undefined,
					group: option.group ?? undefined,
					hint: option.hint ?? undefined,
					isDisabled: option.isDisabled,
					isSeparator: option.isSeparator,
					label: `${String(index + ONE_CONSTANT)}) ${option.label}`,
					shortKey: option.shortKey ?? undefined,
					value: option.value,
				}),
		);

		return await this.select({
			defaultValue: input.defaultValue,
			fallbackValue: input.fallbackValue,
			message: input.message,
			options,
			pageSize: input.pageSize,
		});
	}

	public async select(input: IBeanSelectPromptInputInterface): Promise<null | string> {
		return await this.executePromptWithFallback({
			fallbackValue: input.fallbackValue,
			run: async (): Promise<null | string> => {
				const options: ReadonlyArray<SelectOptionValueObject> = input.optionsLoader === undefined ? input.options : await this.resolvePromptOptions({ options: input.options, optionsLoader: input.optionsLoader, query: "" });

				return await this.PROMPT_SELECT_USE_CASE.execute({
					abortSignal: input.abortSignal,
					defaultValue: input.defaultValue,
					initialIndex: input.initialIndex,
					isSearchEnabled: input.isSearchEnabled,
					message: input.message,
					onCancel: input.onCancel,
					onState: input.onState,
					onSubmit: input.onSubmit,
					options,
					pageSize: input.pageSize,
					renderFrame: input.renderFrame,
					timeoutMs: input.timeoutMs,
					withLoop: input.withLoop,
				});
			},
		});
	}

	public async text(input: IBeanTextPromptInputInterface): Promise<null | string> {
		return await this.executePromptWithFallback({
			fallbackValue: input.fallbackValue,
			run: async (): Promise<null | string> => {
				return await this.PROMPT_TEXT_USE_CASE.execute(input);
			},
		});
	}

	public async toggle(input: TBeanToggleInputType): Promise<boolean | null> {
		const toggleDefaultValue: boolean | undefined = input.isDefaultValue ?? input.isFallbackValue;
		let defaultValue: string | undefined;

		if (toggleDefaultValue !== undefined) {
			defaultValue = toggleDefaultValue ? "true" : "false";
		}

		const fallbackValue: string | undefined = input.isFallbackValue === undefined ? undefined : String(input.isFallbackValue);

		const result: null | string = await this.select({
			defaultValue,
			fallbackValue,
			message: input.message,
			options: [
				new SelectOptionValueObject({
					label: input.onLabel ?? "On",
					value: "true",
				}),
				new SelectOptionValueObject({
					label: input.offLabel ?? "Off",
					value: "false",
				}),
			],
		});

		if (result === null) {
			return null;
		}

		return result === "true";
	}

	public async treeSelect(input: TBeanTreeSelectInputType): Promise<null | ReadonlyArray<string>> {
		const options: Array<SelectOptionValueObject> = [];
		const optionOrder: Array<string> = [];
		const descendantsByValue: Map<string, ReadonlyArray<string>> = new Map<string, ReadonlyArray<string>>();
		const branchMiddlePrefix: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? TREE_UNICODE_BRANCH_MIDDLE_PREFIX_CONSTANT : TREE_ASCII_BRANCH_MIDDLE_PREFIX_CONSTANT;
		const branchLastPrefix: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? TREE_UNICODE_BRANCH_LAST_PREFIX_CONSTANT : TREE_ASCII_BRANCH_LAST_PREFIX_CONSTANT;
		const continuationPrefix: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? TREE_UNICODE_CONTINUATION_PREFIX_CONSTANT : TREE_ASCII_CONTINUATION_PREFIX_CONSTANT;
		const emptyContinuationPrefix: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? TREE_UNICODE_EMPTY_CONTINUATION_PREFIX_CONSTANT : TREE_ASCII_EMPTY_CONTINUATION_PREFIX_CONSTANT;

		const collectDescendants = (node: TBeanTreeSelectNodeType): Array<string> => {
			if (node.children === undefined || node.children.length === ZERO_CONSTANT) {
				descendantsByValue.set(node.value, []);

				return [];
			}

			const descendants: Array<string> = [];

			for (const childNode of node.children) {
				descendants.push(childNode.value, ...collectDescendants(childNode));
			}

			descendantsByValue.set(node.value, descendants);

			return descendants;
		};

		const visit = (nodes: ReadonlyArray<TBeanTreeSelectNodeType>, prefix: string): void => {
			for (const [index, node] of nodes.entries()) {
				const isLastNode: boolean = index === nodes.length - ONE_CONSTANT;
				const branchPrefix: string = isLastNode ? branchLastPrefix : branchMiddlePrefix;
				optionOrder.push(node.value);
				options.push(
					new SelectOptionValueObject({
						label: `${prefix}${branchPrefix}${node.label}`,
						value: node.value,
					}),
				);

				if (node.children !== undefined) {
					visit(node.children, `${prefix}${isLastNode ? emptyContinuationPrefix : continuationPrefix}`);
				}
			}
		};

		for (const node of input.nodes) {
			collectDescendants(node);
		}

		visit(input.nodes, "");

		const selectedValues: null | ReadonlyArray<string> = await this.multiselect({
			abortSignal: input.abortSignal,
			fallbackValue: input.fallbackValue,
			initialValues: input.initialValues,
			isRequired: input.isRequired,
			isSearchEnabled: input.isSearchEnabled,
			message: input.message,
			onCancel: input.onCancel,
			onState: input.onState,
			onSubmit: input.onSubmit,
			options,
			pageSize: input.pageSize,
			withLoop: input.withLoop,
		});

		if (selectedValues === null) {
			return null;
		}

		const expandedSelectedValues: Set<string> = new Set<string>(selectedValues);
		const queue: Array<string> = [...selectedValues];

		while (queue.length > ZERO_CONSTANT) {
			const value: string | undefined = queue.shift();

			if (value === undefined) {
				continue;
			}

			const descendants: ReadonlyArray<string> = descendantsByValue.get(value) ?? [];

			for (const descendant of descendants) {
				if (expandedSelectedValues.has(descendant)) {
					continue;
				}

				expandedSelectedValues.add(descendant);
				queue.push(descendant);
			}
		}

		return optionOrder.filter((value: string): boolean => expandedSelectedValues.has(value));
	}

	private debug(message: string): void {
		if (!this.IS_DEBUG_ENABLED || this.IS_SILENT) {
			return;
		}

		this.OUTPUT_PORT.writeLine(this.THEME_PORT.muted(`[bean:debug] ${message}`));
	}

	private async executePromptWithFallback<TResult>(input: { fallbackValue?: TResult; run: () => Promise<TResult> }): Promise<TResult> {
		try {
			return await input.run();
		} catch (error) {
			if (this.isNonInteractiveError(error) && input.fallbackValue !== undefined) {
				this.debug("Interactive prompt fallback used.");

				return input.fallbackValue;
			}

			throw error;
		}
	}

	private formatDateInputValue(date: Date): string {
		return date.toISOString().slice(ZERO_CONSTANT, TEN_CONSTANT);
	}

	private isNonInteractiveError(error: unknown): boolean {
		if (!(error instanceof Error)) {
			return false;
		}

		return error.message.includes(NON_TTY_INPUT_ERROR_MESSAGE_FRAGMENT_CONSTANT);
	}

	private maskValue(value: string, maskCharacter: string): string {
		if (value.length === ZERO_CONSTANT) {
			return "";
		}

		return maskCharacter.repeat(value.length);
	}

	private parseIsoDateInput(value: string): Date | null {
		const normalizedValue: string = value.trim();

		if (!ISO_DATE_REGEX_CONSTANT.test(normalizedValue)) {
			return null;
		}

		const parts: Array<string> = normalizedValue.split("-");

		if (parts.length !== DATE_PARTS_COUNT_CONSTANT) {
			return null;
		}

		const [yearText, monthText, dayText]: [string, string, string] = parts as [string, string, string];
		const year: number = Number.parseInt(yearText, TEN_CONSTANT);
		const month: number = Number.parseInt(monthText, TEN_CONSTANT);
		const day: number = Number.parseInt(dayText, TEN_CONSTANT);
		const parsedDate: Date = new Date(Date.UTC(year, month - ONE_CONSTANT, day));

		if (parsedDate.getUTCFullYear() !== year || parsedDate.getUTCMonth() !== month - ONE_CONSTANT || parsedDate.getUTCDate() !== day) {
			return null;
		}

		return parsedDate;
	}

	private async resolvePromptOptions(input: { options: ReadonlyArray<SelectOptionValueObject>; optionsLoader?: (input: { query: string }) => Promise<ReadonlyArray<SelectOptionValueObject>> | ReadonlyArray<SelectOptionValueObject>; query: string }): Promise<ReadonlyArray<SelectOptionValueObject>> {
		if (input.optionsLoader === undefined) {
			return input.options;
		}

		return await Promise.resolve(input.optionsLoader({ query: input.query }));
	}

	private resolveSchemaMessage(input: { fieldKey: string; schemaItem: TBeanPromptSchemaItemType }): string {
		const key: string = input.fieldKey.trim();

		if (key.length === ZERO_CONSTANT) {
			throw new Error(SCHEMA_EMPTY_FIELD_KEY_ERROR_MESSAGE_CONSTANT);
		}

		if (input.schemaItem.message === undefined) {
			return key;
		}

		const message: string = input.schemaItem.message.trim();

		if (message.length === ZERO_CONSTANT) {
			throw new Error(`${SCHEMA_EMPTY_FIELD_MESSAGE_ERROR_MESSAGE_CONSTANT} Field: "${key}".`);
		}

		return message;
	}

	private resolveSchemaStringArrayFallbackValue(input: { fallbackValues?: Readonly<Record<string, unknown>>; fieldKey: string }): ReadonlyArray<string> | undefined {
		const fallbackValue: unknown = input.fallbackValues?.[input.fieldKey];

		if (fallbackValue === undefined) {
			return undefined;
		}

		if (!Array.isArray(fallbackValue) || !fallbackValue.every((value: unknown): value is string => typeof value === "string")) {
			throw new TypeError(`${SCHEMA_FALLBACK_MULTISELECT_TYPE_ERROR_MESSAGE_CONSTANT} Field: "${input.fieldKey}".`);
		}

		return fallbackValue;
	}

	private resolveSchemaStringFallbackValue(input: { fallbackValues?: Readonly<Record<string, unknown>>; fieldKey: string }): string | undefined {
		const fallbackValue: unknown = input.fallbackValues?.[input.fieldKey];

		if (fallbackValue === undefined) {
			return undefined;
		}

		if (typeof fallbackValue !== "string") {
			throw new TypeError(`${SCHEMA_FALLBACK_STRING_TYPE_ERROR_MESSAGE_CONSTANT} Field: "${input.fieldKey}".`);
		}

		return fallbackValue;
	}

	private validatePromptSchema(schema: TBeanPromptSchemaType): void {
		for (const [fieldKey, schemaItem] of Object.entries(schema)) {
			if (fieldKey.trim().length === ZERO_CONSTANT) {
				throw new Error(SCHEMA_EMPTY_FIELD_KEY_ERROR_MESSAGE_CONSTANT);
			}

			if (schemaItem.message?.trim().length === ZERO_CONSTANT) {
				throw new Error(`${SCHEMA_EMPTY_FIELD_MESSAGE_ERROR_MESSAGE_CONSTANT} Field: "${fieldKey}".`);
			}

			if (schemaItem.kind === "multiselect" && schemaItem.options.length === ZERO_CONSTANT) {
				throw new Error(`${SCHEMA_MULTISELECT_OPTIONS_REQUIRED_ERROR_MESSAGE_CONSTANT} Field: "${fieldKey}".`);
			}

			if (schemaItem.kind === "select" && schemaItem.options.length === ZERO_CONSTANT) {
				throw new Error(`${SCHEMA_SELECT_OPTIONS_REQUIRED_ERROR_MESSAGE_CONSTANT} Field: "${fieldKey}".`);
			}
		}
	}
}
