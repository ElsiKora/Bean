import type { IClockPortInterface } from "../../interface/port/clock-port.interface";
import type { IOutputPortInterface } from "../../interface/port/output-port.interface";
import type { FrameDiffService } from "../../service/render/frame-diff.service";

import type { TSpinnerStartArgumentsType } from "./type/spinner-start-arguments.type";
import type { TSpinnerStartRuntimeType } from "./type/spinner-start-runtime.type";

import { RenderFrameEntity } from "@domain/entity/render-frame.entity";
import { SpinnerStateEntity } from "@domain/entity/spinner-state.entity";

import { SPINNER_ASCII_FRAME_CONSTANT, SPINNER_UNICODE_FRAME_CONSTANT } from "../../constant/spinner";

const DEFAULT_SPINNER_INTERVAL_CONSTANT: number = 80;
let spinnerIdentifierSequence: number = 0;

const createSpinnerIdentifier = (clockPort: IClockPortInterface): string => {
	spinnerIdentifierSequence += 1;

	return `spinner-${clockPort.now()}-${String(spinnerIdentifierSequence)}`;
};

export class SpinnerStartUseCase {
	private readonly CLOCK_PORT: IClockPortInterface;

	private readonly FRAME_DIFF_SERVICE: FrameDiffService;

	private readonly OUTPUT_PORT: IOutputPortInterface;

	public constructor(input: { clockPort: IClockPortInterface; frameDiffService: FrameDiffService; outputPort: IOutputPortInterface }) {
		this.OUTPUT_PORT = input.outputPort;
		this.CLOCK_PORT = input.clockPort;
		this.FRAME_DIFF_SERVICE = input.frameDiffService;
	}

	public execute(input: TSpinnerStartArgumentsType): SpinnerStateEntity {
		const id: string = createSpinnerIdentifier(this.CLOCK_PORT);
		const intervalMs: number = input.intervalMs ?? DEFAULT_SPINNER_INTERVAL_CONSTANT;

		const frames: ReadonlyArray<string> = input.frames ?? (this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? [...SPINNER_UNICODE_FRAME_CONSTANT] : [...SPINNER_ASCII_FRAME_CONSTANT]);

		let state: SpinnerStateEntity = new SpinnerStateEntity({
			frames,
			id,
			intervalMs,
			isActive: this.OUTPUT_PORT.IS_TTY,
			text: input.text,
		});

		if (!this.OUTPUT_PORT.IS_TTY) {
			this.OUTPUT_PORT.writeLine(`- ${input.text}`);

			return state.with({ isActive: false });
		}

		this.OUTPUT_PORT.hideCursor();

		let previousFrame: null | RenderFrameEntity = null;

		const render = (currentState: SpinnerStateEntity): void => {
			const frameSymbol: string = currentState.FRAMES[currentState.FRAME_INDEX] ?? currentState.FRAMES[0] ?? "-";
			const line: string = `${frameSymbol} ${currentState.TEXT}`;
			const nextFrame: RenderFrameEntity = new RenderFrameEntity({ lines: [line] });

			if (!this.FRAME_DIFF_SERVICE.hasChanged(previousFrame, nextFrame)) {
				return;
			}
			this.OUTPUT_PORT.writeFrame(line);
			previousFrame = nextFrame;
		};

		const runtime: TSpinnerStartRuntimeType = {
			currentState: state,
			disposeExternalWriteListener: (): void => void 0,
			intervalHandle: null,
			isPendingExternalRender: false,
			isRenderScheduled: false,
			render,
			scheduledTimeoutHandle: null,
		};

		runtime.disposeExternalWriteListener = this.OUTPUT_PORT.onExternalWrite(() => {
			if (!runtime.currentState.IS_ACTIVE) {
				return;
			}
			runtime.isPendingExternalRender = true;

			if (runtime.isRenderScheduled) {
				return;
			}
			runtime.isRenderScheduled = true;
			runtime.scheduledTimeoutHandle = this.CLOCK_PORT.setTimeout(() => {
				runtime.isRenderScheduled = false;
				runtime.scheduledTimeoutHandle = null;

				if (!runtime.currentState.IS_ACTIVE) {
					return;
				}

				if (runtime.isPendingExternalRender) {
					runtime.isPendingExternalRender = false;
					runtime.render(runtime.currentState);
				}
			}, 0);
		});

		runtime.intervalHandle = this.CLOCK_PORT.setInterval(() => {
			if (!runtime.currentState.IS_ACTIVE) {
				return;
			}

			const nextFrameIndex: number = (runtime.currentState.FRAME_INDEX + 1) % Math.max(runtime.currentState.FRAMES.length, 1);
			runtime.currentState = runtime.currentState.with({ frameIndex: nextFrameIndex });
			runtime.render(runtime.currentState);
		}, intervalMs);

		state = state.with({ isActive: true, timerHandle: runtime });
		runtime.currentState = state;
		runtime.render(state);

		return state;
	}
}
