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

import type { TPromptSelectArgumentsType } from "./type";

const NO_SELECTABLE_OPTIONS_ERROR_MESSAGE_CONSTANT: string = "No selectable options are available.";
const NOOP_DISPOSE_FUNCTION: () => void = (): void => void 0;
import { renderCompletedSelectLineFunction } from "./render-completed-select-line.function";
import { renderSelectFrameFunction } from "./render-select-frame.function";

export class PromptSelectUseCase {
	private readonly CLOCK_PORT: IClockPortInterface;

	private readonly INPUT_PORT: IInputPortInterface;

	private readonly KEY_DISPATCH_SERVICE: PromptKeyDispatchService;

	private readonly LIST_VIEWPORT_SERVICE: ListViewportService;

	private readonly NAVIGATION_SERVICE: PromptNavigationService;

	private readonly OUTPUT_PORT: IOutputPortInterface;

	private readonly PROMPT_STYLE_PORT: IPromptStylePortInterface;

	private readonly THEME_PORT: IThemePortInterface;

	public constructor(input: { clockPort: IClockPortInterface; inputPort: IInputPortInterface; keyDispatchService: PromptKeyDispatchService; listViewportService: ListViewportService; navigationService: PromptNavigationService; outputPort: IOutputPortInterface; promptStylePort: IPromptStylePortInterface; themePort: IThemePortInterface }) {
		this.CLOCK_PORT = input.clockPort;
		this.INPUT_PORT = input.inputPort;
		this.KEY_DISPATCH_SERVICE = input.keyDispatchService;
		this.LIST_VIEWPORT_SERVICE = input.listViewportService;
		this.OUTPUT_PORT = input.outputPort;
		this.NAVIGATION_SERVICE = input.navigationService;
		this.PROMPT_STYLE_PORT = input.promptStylePort;
		this.THEME_PORT = input.themePort;
	}

	public async execute(input: TPromptSelectArgumentsType): Promise<null | string> {
		const sourceOptions: Array<SelectOptionValueObject> = [...input.options];
		let options: Array<SelectOptionValueObject> = [...sourceOptions];
		let query: string = "";
		const hasEnabledOption: boolean = sourceOptions.some((option: SelectOptionValueObject): boolean => !option.isDisabled && !option.isSeparator);

		if (!hasEnabledOption) {
			this.OUTPUT_PORT.writeLine(this.THEME_PORT.danger(NO_SELECTABLE_OPTIONS_ERROR_MESSAGE_CONSTANT));

			return null;
		}

		let cursorIndex: number = input.defaultValue === undefined ? -1 : options.findIndex((option: SelectOptionValueObject): boolean => option.value === input.defaultValue && !option.isDisabled && !option.isSeparator);

		if (cursorIndex < 0 && input.initialIndex !== undefined) {
			const initialOption: SelectOptionValueObject | undefined = options[input.initialIndex];

			if (initialOption !== undefined && !initialOption.isDisabled && !initialOption.isSeparator) {
				cursorIndex = input.initialIndex;
			}
		}

		if (cursorIndex < 0) {
			cursorIndex = this.NAVIGATION_SERVICE.findFirstEnabledIndex(options);
		}

		const filterOptions = (): void => {
			if (!(input.isSearchEnabled ?? false) || query.trim().length === 0) {
				options = [...sourceOptions];

				return;
			}

			const normalizedQuery: string = query.trim().toLowerCase();
			options = sourceOptions.filter((option: SelectOptionValueObject): boolean => {
				const normalizedLabel: string = option.label.toLowerCase();
				const normalizedHint: string = option.hint?.toLowerCase() ?? "";
				const normalizedDescription: string = option.description?.toLowerCase() ?? "";

				return normalizedLabel.includes(normalizedQuery) || normalizedHint.includes(normalizedQuery) || normalizedDescription.includes(normalizedQuery);
			});
		};

		const syncCursorIndex = (): void => {
			if (options.length === 0) {
				cursorIndex = 0;

				return;
			}

			if (cursorIndex >= options.length) {
				cursorIndex = options.length - 1;
			}

			const optionAtCursor: SelectOptionValueObject | undefined = options[cursorIndex];

			if (optionAtCursor?.isDisabled || optionAtCursor?.isSeparator) {
				const nextEnabledIndex: number = this.NAVIGATION_SERVICE.findFirstEnabledIndex(options);
				cursorIndex = Math.max(nextEnabledIndex, 0);
			}
		};

		const render = (): void => {
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
								}) ??
								renderSelectFrameFunction({
									cursorIndex,
									isUnicodeSupported: this.OUTPUT_PORT.IS_UNICODE_SUPPORTED,
									message: input.message,
									options,
									pageEndIndex: window.endIndex,
									pageStartIndex: window.startIndex,
									promptStylePort: this.PROMPT_STYLE_PORT,
									query,
									themePort: this.THEME_PORT,
								})
							);
						})();

			this.OUTPUT_PORT.writeFrame(frame);
			input.onState?.({
				cursorIndex,
				selectedOption: options[cursorIndex]?.value ?? null,
			});
		};

		return await new Promise<null | string>((resolve: (value: null | string) => void) => {
			let timeoutHandle: null | TClockHandleType = null;
			let off: () => void = NOOP_DISPOSE_FUNCTION;
			const abortSignal: AbortSignal | undefined = input.abortSignal;

			const onAbort = (): void => {
				finish(null, "");
			};

			const finish = (result: null | string, selectedLabel: string): void => {
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

				const completedLine: string = renderCompletedSelectLineFunction({
					isUnicodeSupported: this.OUTPUT_PORT.IS_UNICODE_SUPPORTED,
					message: input.message,
					promptStylePort: this.PROMPT_STYLE_PORT,
					selectedLabel,
					themePort: this.THEME_PORT,
				});
				this.OUTPUT_PORT.writeLine(completedLine);
				resolve(result);
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
					finish(null, "");

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

				if (command === "enter") {
					const selectedOption: SelectOptionValueObject | undefined = options[cursorIndex];

					if (!selectedOption?.isDisabled && !selectedOption?.isSeparator) {
						finish(selectedOption?.value ?? null, selectedOption?.label ?? "");
					}
				}
			};

			filterOptions();
			syncCursorIndex();

			if (abortSignal?.aborted ?? false) {
				finish(null, "");

				return;
			}

			if (input.timeoutMs !== undefined && input.timeoutMs > 0) {
				timeoutHandle = this.CLOCK_PORT.setTimeout((): void => {
					finish(null, "");
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
