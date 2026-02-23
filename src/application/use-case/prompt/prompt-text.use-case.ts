import type { TTextCommandType } from "@application/service/prompt/type/text-command.type";
import type { IKeyEventInterface } from "@domain/interface/input/key-event.interface";

import type { IClockPortInterface } from "../../interface/port/clock-port.interface";
import type { IInputPortInterface } from "../../interface/port/input-port.interface";
import type { IOutputPortInterface } from "../../interface/port/output-port.interface";
import type { IPromptStylePortInterface } from "../../interface/port/prompt-style-port.interface";
import type { IThemePortInterface } from "../../interface/port/theme-port.interface";
import type { TClockHandleType } from "../../interface/port/type/clock-handle.type";
import type { PromptKeyDispatchService } from "../../service/prompt/prompt-key-dispatch.service";
import type { PromptValidationService } from "../../service/prompt/prompt-validation.service";
import type { TextBufferService } from "../../service/prompt/text-buffer.service";

import type { TPromptTextArgumentsType, TTextBufferStateType } from "./type";

import { renderCompletedTextLineFunction } from "./render-completed-text-line.function";

const CURSOR_MARKER_CONSTANT: string = "|";
const ERROR_OPEN_BRACKET_CONSTANT: string = " (";
const ERROR_CLOSE_BRACKET_CONSTANT: string = ")";
const NOOP_DISPOSE_FUNCTION: () => void = (): void => void 0;

export class PromptTextUseCase {
	private readonly CLOCK_PORT: IClockPortInterface;

	private readonly INPUT_PORT: IInputPortInterface;

	private readonly KEY_DISPATCH_SERVICE: PromptKeyDispatchService;

	private readonly OUTPUT_PORT: IOutputPortInterface;

	private readonly PROMPT_STYLE_PORT: IPromptStylePortInterface;

	private readonly TEXT_BUFFER_SERVICE: TextBufferService;

	private readonly THEME_PORT: IThemePortInterface;

	private readonly VALIDATION_SERVICE: PromptValidationService;

	public constructor(input: { clockPort: IClockPortInterface; inputPort: IInputPortInterface; keyDispatchService: PromptKeyDispatchService; outputPort: IOutputPortInterface; promptStylePort: IPromptStylePortInterface; textBufferService: TextBufferService; themePort: IThemePortInterface; validationService: PromptValidationService }) {
		this.CLOCK_PORT = input.clockPort;
		this.INPUT_PORT = input.inputPort;
		this.KEY_DISPATCH_SERVICE = input.keyDispatchService;
		this.OUTPUT_PORT = input.outputPort;
		this.PROMPT_STYLE_PORT = input.promptStylePort;
		this.TEXT_BUFFER_SERVICE = input.textBufferService;
		this.THEME_PORT = input.themePort;
		this.VALIDATION_SERVICE = input.validationService;
	}

	public async execute(input: TPromptTextArgumentsType): Promise<null | string> {
		let value: string = input.initialValue ?? "";
		let cursorIndex: number = value.length;
		let isAllSelected: boolean = false;
		let validationError: null | string = null;
		let timeoutHandle: null | TClockHandleType = null;

		const notifyState = (): void => {
			input.onState?.({ cursorIndex, isAllSelected, validationError, value });
		};

		const clearSelection = (): void => {
			if (!isAllSelected) {
				return;
			}

			isAllSelected = false;
		};

		const applySelectionReplacement = (): void => {
			if (!isAllSelected) {
				return;
			}

			value = "";
			cursorIndex = 0;
			isAllSelected = false;
		};

		const getRenderedValue = (): string => {
			if (value.length === 0 && input.placeholder !== undefined) {
				return this.THEME_PORT.muted(`${this.PROMPT_STYLE_PORT.PLACEHOLDER_PREFIX}${input.placeholder}`);
			}

			const transformedValue: string = input.transformer?.(value) ?? value;

			if (isAllSelected) {
				return `[${transformedValue}]`;
			}

			const clampedCursor: number = Math.min(Math.max(cursorIndex, 0), transformedValue.length);

			return `${transformedValue.slice(0, clampedCursor)}${CURSOR_MARKER_CONSTANT}${transformedValue.slice(clampedCursor)}`;
		};

		const render = (): void => {
			const questionPrefix: string = this.THEME_PORT.info(this.PROMPT_STYLE_PORT.QUESTION_PREFIX_SYMBOL);
			const header: string = `${questionPrefix} ${this.THEME_PORT.strong(input.message)}: ${getRenderedValue()}`;
			const errorSuffix: string = validationError === null ? "" : `${ERROR_OPEN_BRACKET_CONSTANT}${this.THEME_PORT.danger(validationError)}${ERROR_CLOSE_BRACKET_CONSTANT}`;

			const frame: string =
				input.renderFrame?.({
					cursorIndex,
					isAllSelected,
					message: input.message,
					validationError,
					value,
				}) ?? `${header}${errorSuffix}`;
			this.OUTPUT_PORT.writeFrame(frame);
			notifyState();
		};

		return await new Promise<null | string>((resolve: (value: null | string) => void) => {
			let off: () => void = NOOP_DISPOSE_FUNCTION;
			const abortSignal: AbortSignal | undefined = input.abortSignal;

			const finish = (result: null | string): void => {
				off();
				abortSignal?.removeEventListener("abort", cancel);

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

				const filteredResult: string = input.filter?.(result) ?? result;
				const submittedDisplayValue: string = input.formatSubmittedValue?.(filteredResult) ?? filteredResult;
				input.onSubmit?.(filteredResult);

				const completedLine: string = renderCompletedTextLineFunction({
					isUnicodeSupported: this.OUTPUT_PORT.IS_UNICODE_SUPPORTED,
					message: input.message,
					promptStylePort: this.PROMPT_STYLE_PORT,
					themePort: this.THEME_PORT,
					value: submittedDisplayValue,
				});
				this.OUTPUT_PORT.writeLine(completedLine);
				resolve(filteredResult);
			};

			const submit = (): void => {
				const submittedValue: string = value.trim().length === 0 && input.defaultValue !== undefined ? input.defaultValue : value;
				const requiredError: null | string = this.VALIDATION_SERVICE.validateRequired(submittedValue, input.isRequired ?? false);
				const customError: null | string = input.validate?.(submittedValue) ?? null;
				validationError = requiredError ?? customError;

				if (validationError !== null) {
					render();

					return;
				}
				finish(submittedValue);
			};

			const cancel = (): void => {
				finish(null);
			};

			const onKeyEvent = (event: IKeyEventInterface): void => {
				const command: TTextCommandType = this.KEY_DISPATCH_SERVICE.resolveTextCommand(event);

				if (command === "cancel") {
					cancel();

					return;
				}

				if (command === "enter") {
					submit();

					return;
				}

				if (command === "ctrl-a") {
					isAllSelected = true;
					render();

					return;
				}

				if (command === "ctrl-k") {
					const nextState: TTextBufferStateType = this.TEXT_BUFFER_SERVICE.killToEnd({ cursorIndex, value });
					value = nextState.value;
					cursorIndex = nextState.cursorIndex;
					clearSelection();
					validationError = null;
					render();

					return;
				}

				if (command === "ctrl-u") {
					const nextState: TTextBufferStateType = this.TEXT_BUFFER_SERVICE.killToStart({ cursorIndex, value });
					value = nextState.value;
					cursorIndex = nextState.cursorIndex;
					clearSelection();
					validationError = null;
					render();

					return;
				}

				if (command === "ctrl-w") {
					const nextState: TTextBufferStateType = this.TEXT_BUFFER_SERVICE.deleteWordBackward({ cursorIndex, value });
					value = nextState.value;
					cursorIndex = nextState.cursorIndex;
					clearSelection();
					validationError = null;
					render();

					return;
				}

				if (command === "left") {
					cursorIndex = event.IS_CTRL ? this.TEXT_BUFFER_SERVICE.moveWordLeft({ cursorIndex, value }) : this.TEXT_BUFFER_SERVICE.moveLeft({ cursorIndex, value });
					clearSelection();
					render();

					return;
				}

				if (command === "right") {
					cursorIndex = event.IS_CTRL ? this.TEXT_BUFFER_SERVICE.moveWordRight({ cursorIndex, value }) : this.TEXT_BUFFER_SERVICE.moveRight({ cursorIndex, value });
					clearSelection();
					render();

					return;
				}

				if (command === "home") {
					cursorIndex = this.TEXT_BUFFER_SERVICE.moveHome();
					clearSelection();
					render();

					return;
				}

				if (command === "end") {
					cursorIndex = this.TEXT_BUFFER_SERVICE.moveEnd({ value });
					clearSelection();
					render();

					return;
				}

				if (command === "delete") {
					applySelectionReplacement();
					const nextState: TTextBufferStateType = this.TEXT_BUFFER_SERVICE.applyDeleteForward({ cursorIndex, value });
					value = nextState.value;
					cursorIndex = nextState.cursorIndex;
					validationError = null;
					render();

					return;
				}

				if (command === "backspace") {
					applySelectionReplacement();
					const nextState: TTextBufferStateType = this.TEXT_BUFFER_SERVICE.applyBackspace({ cursorIndex, value });
					value = nextState.value;
					cursorIndex = nextState.cursorIndex;
					validationError = null;
					render();

					return;
				}

				if (command === "text") {
					applySelectionReplacement();
					const nextState: TTextBufferStateType = this.TEXT_BUFFER_SERVICE.applyInsert({ cursorIndex, value, valueToInsert: event.SEQUENCE });
					value = nextState.value;
					cursorIndex = nextState.cursorIndex;
					validationError = null;
					render();
				}
			};

			if (input.timeoutMs !== undefined && input.timeoutMs > 0) {
				timeoutHandle = this.CLOCK_PORT.setTimeout(() => {
					cancel();
				}, input.timeoutMs);
			}

			if (abortSignal?.aborted ?? false) {
				cancel();

				return;
			}

			this.INPUT_PORT.enableRawMode();
			this.OUTPUT_PORT.hideCursor();
			off = this.INPUT_PORT.onKeyEvent(onKeyEvent);
			abortSignal?.addEventListener("abort", cancel, { ["once"]: true });
			render();
		});
	}
}
