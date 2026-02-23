import type { TListCommandType } from "@application/service/prompt/type/list-command.type";
import type { IKeyEventInterface } from "@domain/interface/input/key-event.interface";
import type { SelectOptionValueObject } from "@domain/value-object/select-option.value-object";

import type { IClockPortInterface } from "../../interface/port/clock-port.interface";
import type { IInputPortInterface } from "../../interface/port/input-port.interface";
import type { IOutputPortInterface } from "../../interface/port/output-port.interface";
import type { IPromptStylePortInterface } from "../../interface/port/prompt-style-port.interface";
import type { IThemePortInterface } from "../../interface/port/theme-port.interface";
import type { TClockHandleType } from "../../interface/port/type/clock-handle.type";
import type { ListViewportService } from "../../service/prompt/list-viewport.service";
import type { PromptKeyDispatchService } from "../../service/prompt/prompt-key-dispatch.service";
import type { PromptNavigationService } from "../../service/prompt/prompt-navigation.service";
import type { PromptValidationService } from "../../service/prompt/prompt-validation.service";

import type { TPromptGroupMultiselectArgumentsType } from "./type";

import { mapSelectedValuesToLabelsFunction } from "./map-selected-values-to-labels.function";
import { renderCompletedGroupMultiselectLineFunction } from "./render-completed-group-multiselect-line.function";
import { renderGroupMultiselectFrameFunction } from "./render-group-multiselect-frame.function";

const DEFAULT_GROUP_NAME_CONSTANT: string = "default";
const NO_SELECTABLE_OPTIONS_ERROR_MESSAGE_CONSTANT: string = "No selectable options are available.";
const NOOP_DISPOSE_FUNCTION: () => void = (): void => void 0;

const createViewToSourceIndices = (options: ReadonlyArray<SelectOptionValueObject>): Array<number> => {
	const indices: Array<number> = [];

	for (const [index] of options.entries()) {
		indices.push(index);
	}

	return indices;
};

export class PromptGroupMultiselectUseCase {
	private readonly CLOCK_PORT: IClockPortInterface;

	private readonly INPUT_PORT: IInputPortInterface;

	private readonly KEY_DISPATCH_SERVICE: PromptKeyDispatchService;

	private readonly LIST_VIEWPORT_SERVICE: ListViewportService;

	private readonly NAVIGATION_SERVICE: PromptNavigationService;

	private readonly OUTPUT_PORT: IOutputPortInterface;

	private readonly PROMPT_STYLE_PORT: IPromptStylePortInterface;

	private readonly THEME_PORT: IThemePortInterface;

	private readonly VALIDATION_SERVICE: PromptValidationService;

	public constructor(input: { clockPort: IClockPortInterface; inputPort: IInputPortInterface; keyDispatchService: PromptKeyDispatchService; listViewportService: ListViewportService; navigationService: PromptNavigationService; outputPort: IOutputPortInterface; promptStylePort: IPromptStylePortInterface; themePort: IThemePortInterface; validationService: PromptValidationService }) {
		this.CLOCK_PORT = input.clockPort;
		this.INPUT_PORT = input.inputPort;
		this.KEY_DISPATCH_SERVICE = input.keyDispatchService;
		this.LIST_VIEWPORT_SERVICE = input.listViewportService;
		this.OUTPUT_PORT = input.outputPort;
		this.NAVIGATION_SERVICE = input.navigationService;
		this.PROMPT_STYLE_PORT = input.promptStylePort;
		this.THEME_PORT = input.themePort;
		this.VALIDATION_SERVICE = input.validationService;
	}

	public async execute(input: TPromptGroupMultiselectArgumentsType): Promise<null | ReadonlyArray<string>> {
		const sourceOptions: Array<SelectOptionValueObject> = [...input.options];
		let options: Array<SelectOptionValueObject> = [...sourceOptions];
		let viewToSourceIndices: Array<number> = createViewToSourceIndices(sourceOptions);
		let query: string = "";
		const hasEnabledOption: boolean = sourceOptions.some((option: SelectOptionValueObject): boolean => !option.isDisabled && !option.isSeparator);

		if (!hasEnabledOption) {
			this.OUTPUT_PORT.writeLine(this.THEME_PORT.danger(NO_SELECTABLE_OPTIONS_ERROR_MESSAGE_CONSTANT));

			return null;
		}

		let cursorIndex: number = this.NAVIGATION_SERVICE.findFirstEnabledIndex(options);

		if (cursorIndex < 0) {
			cursorIndex = 0;
		}

		let selectedIndices: Set<number> = new Set<number>((input.initialValues ?? []).map((value: string): number => sourceOptions.findIndex((option: SelectOptionValueObject): boolean => option.value === value && !option.isDisabled && !option.isSeparator)).filter((index: number): boolean => index >= 0));
		let errorMessage: null | string = null;

		const filterOptions = (): void => {
			if (!(input.isSearchEnabled ?? false) || query.trim().length === 0) {
				options = [...sourceOptions];
				viewToSourceIndices = createViewToSourceIndices(sourceOptions);

				return;
			}

			const normalizedQuery: string = query.trim().toLowerCase();
			viewToSourceIndices = sourceOptions
				.map((option: SelectOptionValueObject, index: number): { index: number; option: SelectOptionValueObject } => ({ index, option }))
				.filter((entry: { index: number; option: SelectOptionValueObject }): boolean => {
					const normalizedLabel: string = entry.option.label.toLowerCase();
					const normalizedHint: string = entry.option.hint?.toLowerCase() ?? "";
					const normalizedDescription: string = entry.option.description?.toLowerCase() ?? "";

					return normalizedLabel.includes(normalizedQuery) || normalizedHint.includes(normalizedQuery) || normalizedDescription.includes(normalizedQuery);
				})
				.map((entry: { index: number; option: SelectOptionValueObject }): number => entry.index);
			options = viewToSourceIndices.map((index: number): SelectOptionValueObject | undefined => sourceOptions[index]).filter((option: SelectOptionValueObject | undefined): option is SelectOptionValueObject => option !== undefined);
		};

		const syncCursorIndex = (): void => {
			if (options.length === 0) {
				cursorIndex = 0;

				return;
			}

			if (cursorIndex >= options.length) {
				cursorIndex = options.length - 1;
			}

			const currentOption: SelectOptionValueObject | undefined = options[cursorIndex];

			if (currentOption?.isDisabled || currentOption?.isSeparator) {
				const firstEnabledIndex: number = this.NAVIGATION_SERVICE.findFirstEnabledIndex(options);
				cursorIndex = Math.max(firstEnabledIndex, 0);
			}
		};

		const getEnabledSourceIndices = (): Array<number> => {
			return options
				.map((option: SelectOptionValueObject, index: number): { index: number; option: SelectOptionValueObject } => ({ index, option }))
				.filter((item: { index: number; option: SelectOptionValueObject }): boolean => !item.option.isDisabled && !item.option.isSeparator)
				.map((item: { index: number; option: SelectOptionValueObject }): number => viewToSourceIndices[item.index] ?? item.index);
		};

		const toggleGroupSelection = (): void => {
			const focusedSourceIndex: number = viewToSourceIndices[cursorIndex] ?? cursorIndex;
			const focusedOption: SelectOptionValueObject | undefined = sourceOptions[focusedSourceIndex];
			const focusedGroup: string = focusedOption?.group ?? DEFAULT_GROUP_NAME_CONSTANT;

			const allGroupIndices: Array<number> = sourceOptions
				.map((option: SelectOptionValueObject, index: number): { index: number; option: SelectOptionValueObject } => ({ index, option }))
				.filter((item: { index: number; option: SelectOptionValueObject }): boolean => (item.option.group ?? DEFAULT_GROUP_NAME_CONSTANT) === focusedGroup && !item.option.isDisabled && !item.option.isSeparator)
				.map((item: { index: number; option: SelectOptionValueObject }): number => item.index);
			const isAllSelected: boolean = allGroupIndices.every((index: number): boolean => selectedIndices.has(index));

			if (isAllSelected) {
				for (const index of allGroupIndices) {
					selectedIndices.delete(index);
				}
			} else {
				for (const index of allGroupIndices) {
					selectedIndices.add(index);
				}
			}
			errorMessage = null;
		};

		const selectAllOrClear = (): void => {
			const enabledIndices: Array<number> = getEnabledSourceIndices();
			const isAllSelected: boolean = enabledIndices.every((index: number): boolean => selectedIndices.has(index));
			selectedIndices = isAllSelected ? new Set<number>() : new Set<number>(enabledIndices);
			errorMessage = null;
		};

		const invertSelection = (): void => {
			const next: Set<number> = new Set<number>(selectedIndices);

			for (const index of getEnabledSourceIndices()) {
				if (next.has(index)) {
					next.delete(index);
				} else {
					next.add(index);
				}
			}

			selectedIndices = next;
			errorMessage = null;
		};

		const render = (): void => {
			const groupedOptions: Map<string, Array<SelectOptionValueObject>> = this.NAVIGATION_SERVICE.groupByName(options);
			const selectedViewIndices: Set<number> = new Set<number>();

			for (const [viewIndex, sourceIndex] of viewToSourceIndices.entries()) {
				if (selectedIndices.has(sourceIndex)) {
					selectedViewIndices.add(viewIndex);
				}
			}

			const frame: string =
				options.length === 0
					? this.THEME_PORT.muted(`${this.PROMPT_STYLE_PORT.QUESTION_PREFIX_SYMBOL} ${input.message}\n\nNo matches found.`)
					: ((): string => {
							const window: { endIndex: number; startIndex: number } = this.LIST_VIEWPORT_SERVICE.getWindow({
								cursorIndex,
								optionCount: options.length,
								pageSize: input.pageSize ?? options.length,
							});

							return (
								input.renderFrame?.({
									cursorIndex,
									message: input.message,
									options,
									query,
									selectedValues: [...selectedIndices].map((sourceIndex: number): string | undefined => sourceOptions[sourceIndex]?.value).filter((value: string | undefined): value is string => value !== undefined),
								}) ??
								renderGroupMultiselectFrameFunction({
									cursorIndex,
									errorMessage,
									groupedOptions,
									isUnicodeSupported: this.OUTPUT_PORT.IS_UNICODE_SUPPORTED,
									message: input.message,
									pageEndIndex: window.endIndex,
									pageStartIndex: window.startIndex,
									promptStylePort: this.PROMPT_STYLE_PORT,
									query,
									selectedIndices: selectedViewIndices,
									themePort: this.THEME_PORT,
								})
							);
						})();
			this.OUTPUT_PORT.writeFrame(frame);

			const selectedValues: Array<string> = [...selectedIndices].map((sourceIndex: number): string | undefined => sourceOptions[sourceIndex]?.value).filter((value: string | undefined): value is string => value !== undefined);
			input.onState?.({
				cursorIndex,
				selectedValues,
			});
		};

		return await new Promise<null | ReadonlyArray<string>>((resolve: (value: null | ReadonlyArray<string>) => void) => {
			let timeoutHandle: null | TClockHandleType = null;
			let off: () => void = NOOP_DISPOSE_FUNCTION;
			const abortSignal: AbortSignal | undefined = input.abortSignal;

			const onAbort = (): void => {
				finish(null);
			};

			const finish = (result: null | ReadonlyArray<string>): void => {
				off();
				abortSignal?.removeEventListener("abort", onAbort);

				if (timeoutHandle !== null) {
					this.CLOCK_PORT.clearTimeout(timeoutHandle);
				}
				this.INPUT_PORT.disableRawMode();
				this.OUTPUT_PORT.showCursor();

				if (result === null) {
					input.onCancel?.();
					this.OUTPUT_PORT.writeLine("");
					resolve(result);

					return;
				}
				input.onSubmit?.(result);

				const selectedLabels: Array<string> = mapSelectedValuesToLabelsFunction({ options: sourceOptions, values: result });

				const completedLine: string = renderCompletedGroupMultiselectLineFunction({
					isUnicodeSupported: this.OUTPUT_PORT.IS_UNICODE_SUPPORTED,
					message: input.message,
					promptStylePort: this.PROMPT_STYLE_PORT,
					selectedLabels,
					themePort: this.THEME_PORT,
				});
				this.OUTPUT_PORT.writeLine(completedLine);
				resolve(result);
			};

			const submit = (): void => {
				const validationError: null | string = this.VALIDATION_SERVICE.validateSelectRequired(selectedIndices.size, input.isRequired ?? false);

				if (validationError !== null) {
					errorMessage = validationError;
					render();

					return;
				}

				const values: Array<string> = [...selectedIndices]
					.sort((firstIndex: number, secondIndex: number): number => firstIndex - secondIndex)
					.map((sourceIndex: number): string | undefined => sourceOptions[sourceIndex]?.value)
					.filter((value: string | undefined): value is string => value !== undefined);

				finish(values);
			};

			const onKeyEvent = (event: IKeyEventInterface): void => {
				const command: TListCommandType = this.KEY_DISPATCH_SERVICE.resolveListCommand(event);

				if (input.isSearchEnabled ?? false) {
					if (command === "text") {
						query += event.SEQUENCE;
						filterOptions();
						syncCursorIndex();
						render();

						return;
					}

					if (command === "backspace") {
						query = query.slice(0, -1);
						filterOptions();
						syncCursorIndex();
						render();

						return;
					}
				}

				if (command === "cancel") {
					finish(null);

					return;
				}

				if (event.IS_CTRL && event.NAME === "a") {
					selectAllOrClear();
					render();

					return;
				}

				if (event.IS_CTRL && event.NAME === "i") {
					invertSelection();
					render();

					return;
				}

				if (command === "down" || command === "right") {
					cursorIndex = this.NAVIGATION_SERVICE.moveNextEnabled(cursorIndex, options, input.withLoop ?? true);
					render();

					return;
				}

				if (command === "up" || command === "left") {
					cursorIndex = this.NAVIGATION_SERVICE.movePreviousEnabled(cursorIndex, options, input.withLoop ?? true);
					render();

					return;
				}

				if (command === "space") {
					const selectedOption: SelectOptionValueObject | undefined = options[cursorIndex];

					if (!selectedOption?.isDisabled && !selectedOption?.isSeparator) {
						const sourceIndex: number = viewToSourceIndices[cursorIndex] ?? cursorIndex;
						selectedIndices = this.NAVIGATION_SERVICE.toggleIndex(selectedIndices, sourceIndex);
						errorMessage = null;
						render();
					}

					return;
				}

				if (command === "enter") {
					submit();

					return;
				}

				if (event.NAME === "a" && !event.IS_CTRL && !event.IS_META) {
					toggleGroupSelection();
					render();
				}
			};

			filterOptions();
			syncCursorIndex();

			if (abortSignal?.aborted ?? false) {
				finish(null);

				return;
			}

			if (input.timeoutMs !== undefined && input.timeoutMs > 0) {
				timeoutHandle = this.CLOCK_PORT.setTimeout((): void => {
					finish(null);
				}, input.timeoutMs);
			}

			this.INPUT_PORT.enableRawMode();
			this.OUTPUT_PORT.hideCursor();
			off = this.INPUT_PORT.onKeyEvent(onKeyEvent);
			abortSignal?.addEventListener("abort", onAbort, { ["once"]: true });
			render();
		});
	}
}
