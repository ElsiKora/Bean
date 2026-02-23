import type { SpinnerStateEntity } from "@domain/entity/spinner-state.entity";

import type { IClockPortInterface } from "../../interface/port/clock-port.interface";
import type { IOutputPortInterface } from "../../interface/port/output-port.interface";
import type { IPromptStylePortInterface } from "../../interface/port/prompt-style-port.interface";

import type { TSpinnerStopArgumentsType } from "./type/spinner-stop-arguments.type";
import type { TSpinnerStopRuntimeType } from "./type/spinner-stop-runtime.type";

import { ESpinnerStatusEnum } from "@domain/enum";

export class SpinnerStopUseCase {
	private readonly CLOCK_PORT: IClockPortInterface;

	private readonly OUTPUT_PORT: IOutputPortInterface;

	private readonly PROMPT_STYLE_PORT: IPromptStylePortInterface;

	public constructor(input: { clockPort: IClockPortInterface; outputPort: IOutputPortInterface; promptStylePort: IPromptStylePortInterface }) {
		this.OUTPUT_PORT = input.outputPort;
		this.CLOCK_PORT = input.clockPort;
		this.PROMPT_STYLE_PORT = input.promptStylePort;
	}

	public execute(input: TSpinnerStopArgumentsType): SpinnerStateEntity {
		if (!input.state.IS_ACTIVE) {
			return input.state.with({
				isActive: false,
				text: input.text ?? input.state.TEXT,
			});
		}

		const runtime: null | TSpinnerStopRuntimeType = input.state.TIMER_HANDLE as null | TSpinnerStopRuntimeType;
		runtime?.disposeExternalWriteListener();

		if (runtime !== null) {
			if (runtime.intervalHandle !== null) {
				this.CLOCK_PORT.clearInterval(runtime.intervalHandle);
			}

			if (runtime.scheduledTimeoutHandle !== undefined && runtime.scheduledTimeoutHandle !== null) {
				this.CLOCK_PORT.clearTimeout(runtime.scheduledTimeoutHandle);
			}
		}

		const finalText: string = input.text ?? input.state.TEXT;
		const successSymbol: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? this.PROMPT_STYLE_PORT.COMPLETED_MARK_UNICODE : this.PROMPT_STYLE_PORT.COMPLETED_MARK_ASCII;
		const failSymbol: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? this.PROMPT_STYLE_PORT.FAILED_MARK_UNICODE : this.PROMPT_STYLE_PORT.FAILED_MARK_ASCII;
		const neutralSymbol: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? this.PROMPT_STYLE_PORT.NEUTRAL_MARK_UNICODE : this.PROMPT_STYLE_PORT.NEUTRAL_MARK_ASCII;

		const symbolByStatus: Record<ESpinnerStatusEnum, string> = {
			[ESpinnerStatusEnum.FAILED]: failSymbol,
			[ESpinnerStatusEnum.INFO]: neutralSymbol,
			[ESpinnerStatusEnum.NEUTRAL]: neutralSymbol,
			[ESpinnerStatusEnum.RUNNING]: neutralSymbol,
			[ESpinnerStatusEnum.SUCCEEDED]: successSymbol,
			[ESpinnerStatusEnum.WARNING]: neutralSymbol,
		};
		const symbol: string = symbolByStatus[input.status];

		this.OUTPUT_PORT.writeFrame(`${symbol} ${finalText}`);
		this.OUTPUT_PORT.writeLine("");
		this.OUTPUT_PORT.showCursor();

		return input.state.with({ isActive: false, text: finalText, timerHandle: null });
	}
}
