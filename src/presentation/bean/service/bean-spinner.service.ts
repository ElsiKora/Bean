import type { IClockPortInterface } from "@application/interface/port/clock-port.interface";
import type { IThemePortInterface } from "@application/interface/port/theme-port.interface";
import type { SpinnerStartUseCase } from "@application/use-case/spinner/spinner-start.use-case";
import type { SpinnerStopUseCase } from "@application/use-case/spinner/spinner-stop.use-case";
import type { SpinnerUpdateUseCase } from "@application/use-case/spinner/spinner-update.use-case";
import type { SpinnerStateEntity } from "@domain/entity/spinner-state.entity";

import type { IBeanSpinnerHandleInterface } from "../../interface";
import type { TBeanSpinnerInputType, TBeanSpinnerPromiseInputType } from "../type";

import { ESpinnerStatusEnum } from "@domain/enum";

const MIN_SPINNER_INTERVAL_MS_CONSTANT: number = 1;
const MILLISECONDS_IN_SECOND_CONSTANT: number = 1000;
const SPINNER_ELAPSED_SECONDS_FRACTION_DIGITS_CONSTANT: number = 1;

export class BeanSpinnerService {
	private readonly CLOCK_PORT: IClockPortInterface;

	private readonly SPINNER_START_USE_CASE: SpinnerStartUseCase;

	private readonly SPINNER_STOP_USE_CASE: SpinnerStopUseCase;

	private readonly SPINNER_UPDATE_USE_CASE: SpinnerUpdateUseCase;

	private readonly THEME_PORT: IThemePortInterface;

	public constructor(input: { clockPort: IClockPortInterface; spinnerStartUseCase: SpinnerStartUseCase; spinnerStopUseCase: SpinnerStopUseCase; spinnerUpdateUseCase: SpinnerUpdateUseCase; themePort: IThemePortInterface }) {
		this.CLOCK_PORT = input.clockPort;
		this.SPINNER_START_USE_CASE = input.spinnerStartUseCase;
		this.SPINNER_STOP_USE_CASE = input.spinnerStopUseCase;
		this.SPINNER_UPDATE_USE_CASE = input.spinnerUpdateUseCase;
		this.THEME_PORT = input.themePort;
	}

	public spinner(input: TBeanSpinnerInputType): IBeanSpinnerHandleInterface {
		if (input.intervalMs !== undefined && input.intervalMs < MIN_SPINNER_INTERVAL_MS_CONSTANT) {
			throw new Error(`Spinner intervalMs must be >= ${String(MIN_SPINNER_INTERVAL_MS_CONSTANT)}.`);
		}

		if (input.frames?.length === 0) {
			throw new Error("Spinner frames must not be empty.");
		}

		const applyPrefix = (text: string): string => {
			if (input.prefix === undefined || input.prefix.length === 0) {
				return text;
			}

			return `${input.prefix} ${text}`;
		};
		const startedAtMs: number = this.CLOCK_PORT.now();

		let state: SpinnerStateEntity = this.SPINNER_START_USE_CASE.execute({
			frames: input.frames,
			intervalMs: input.intervalMs,
			text: applyPrefix(input.text),
		});
		let isSpinning: boolean = true;
		input.onStateChange?.({
			status: ESpinnerStatusEnum.RUNNING,
			text: state.TEXT,
		});

		const stopSpinner = (status: ESpinnerStatusEnum, text?: string): void => {
			if (!isSpinning) {
				return;
			}

			const baseText: string = text ?? state.TEXT;

			const finalText: string = (input.isElapsedTimeEnabled ?? false) ? `${baseText} (${((this.CLOCK_PORT.now() - startedAtMs) / MILLISECONDS_IN_SECOND_CONSTANT).toFixed(SPINNER_ELAPSED_SECONDS_FRACTION_DIGITS_CONSTANT)}s)` : baseText;
			state = this.SPINNER_STOP_USE_CASE.execute({ state, status, text: finalText });
			isSpinning = false;
			input.onStateChange?.({
				status,
				text: state.TEXT,
			});
		};

		return {
			fail: (text?: string): void => {
				stopSpinner(ESpinnerStatusEnum.FAILED, text === undefined ? undefined : applyPrefix(text));
			},
			info: (text?: string): void => {
				const infoText: string = text === undefined ? state.TEXT : applyPrefix(text);
				stopSpinner(ESpinnerStatusEnum.INFO, this.THEME_PORT.info(infoText));
			},
			get isSpinning(): boolean {
				return isSpinning;
			},
			stop: (text?: string): void => {
				stopSpinner(ESpinnerStatusEnum.NEUTRAL, text === undefined ? undefined : applyPrefix(text));
			},
			succeed: (text?: string): void => {
				stopSpinner(ESpinnerStatusEnum.SUCCEEDED, text === undefined ? undefined : applyPrefix(text));
			},
			update: (text: string): void => {
				if (!isSpinning) {
					return;
				}

				state = this.SPINNER_UPDATE_USE_CASE.execute({
					state,
					text: applyPrefix(text),
				});
				input.onStateChange?.({
					status: ESpinnerStatusEnum.RUNNING,
					text: state.TEXT,
				});
			},
			warn: (text?: string): void => {
				const warnText: string = text === undefined ? state.TEXT : applyPrefix(text);
				stopSpinner(ESpinnerStatusEnum.WARNING, this.THEME_PORT.accent(warnText));
			},
		};
	}

	public async spinnerPromise<TResult>(input: TBeanSpinnerPromiseInputType<TResult>): Promise<TResult> {
		const spinnerHandle: IBeanSpinnerHandleInterface = this.spinner({
			text: input.text,
		});

		try {
			const result: TResult = await input.task();
			spinnerHandle.succeed(input.successText);

			return result;
		} catch (error) {
			spinnerHandle.fail(input.failText ?? this.getErrorMessage(error));

			throw error;
		}
	}

	private getErrorMessage(error: unknown): string {
		if (error instanceof Error) {
			return error.message;
		}

		return "Unknown error";
	}
}
