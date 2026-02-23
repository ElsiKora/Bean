import type { IClockPortInterface } from "@application/interface/port/clock-port.interface";
import type { IOutputPortInterface } from "@application/interface/port/output-port.interface";
import type { IPromptStylePortInterface } from "@application/interface/port/prompt-style-port.interface";
import type { IThemePortInterface } from "@application/interface/port/theme-port.interface";
import type { TClockHandleType } from "@application/interface/port/type/clock-handle.type";

import type { IBeanSpinnerHandleInterface } from "../../interface";
import type { TBeanSpinnerManagerCreateInputType, TBeanSpinnerManagerHandleType, TSpinnerManagerStateType } from "../type";

import { ESpinnerStatusEnum } from "@domain/enum";

import { ASCII_SPINNER_FRAMES_CONSTANT, ONE_CONSTANT, SPINNER_MANAGER_INTERVAL_MS_CONSTANT, UNICODE_SPINNER_FRAMES_CONSTANT } from "../constant";

const MIN_SPINNER_INTERVAL_MS_CONSTANT: number = 1;

export class BeanSpinnerManagerService {
	private readonly ACTIVE_STOP_ALL_CALLBACKS: Set<() => void> = new Set<() => void>();

	private readonly CLOCK_PORT: IClockPortInterface;

	private readonly OUTPUT_PORT: IOutputPortInterface;

	private readonly PROMPT_STYLE_PORT: IPromptStylePortInterface;

	private readonly THEME_PORT: IThemePortInterface;

	public constructor(input: { clockPort: IClockPortInterface; outputPort: IOutputPortInterface; promptStylePort: IPromptStylePortInterface; themePort: IThemePortInterface }) {
		this.CLOCK_PORT = input.clockPort;
		this.OUTPUT_PORT = input.outputPort;
		this.PROMPT_STYLE_PORT = input.promptStylePort;
		this.THEME_PORT = input.themePort;
	}

	public create(input: { frames?: ReadonlyArray<string>; intervalMs?: number } = {}): TBeanSpinnerManagerHandleType {
		if (input.intervalMs !== undefined && input.intervalMs < MIN_SPINNER_INTERVAL_MS_CONSTANT) {
			throw new Error(`Spinner manager intervalMs must be >= ${String(MIN_SPINNER_INTERVAL_MS_CONSTANT)}.`);
		}

		if (input.frames?.length === 0) {
			throw new Error("Spinner manager frames must not be empty.");
		}

		const spinnerStates: Map<string, TSpinnerManagerStateType> = new Map<string, TSpinnerManagerStateType>();
		const frames: ReadonlyArray<string> = input.frames ?? (this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? UNICODE_SPINNER_FRAMES_CONSTANT : ASCII_SPINNER_FRAMES_CONSTANT);
		const intervalMs: number = input.intervalMs ?? SPINNER_MANAGER_INTERVAL_MS_CONSTANT;
		let frameIndex: number = 0;
		let timerHandle: null | TClockHandleType = null;

		const notifyStateChange = (state: TSpinnerManagerStateType): void => {
			state.onStateChange?.({
				id: state.id,
				parentId: state.parentId,
				prefix: state.prefix,
				status: state.status,
				text: state.text,
			});
		};

		const getStatePrefix = (state: TSpinnerManagerStateType): string => {
			if (state.status === ESpinnerStatusEnum.SUCCEEDED) {
				return this.THEME_PORT.success(this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? this.PROMPT_STYLE_PORT.COMPLETED_MARK_UNICODE : this.PROMPT_STYLE_PORT.COMPLETED_MARK_ASCII);
			}

			if (state.status === ESpinnerStatusEnum.FAILED) {
				return this.THEME_PORT.danger(this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? this.PROMPT_STYLE_PORT.FAILED_MARK_UNICODE : this.PROMPT_STYLE_PORT.FAILED_MARK_ASCII);
			}

			if (state.status === ESpinnerStatusEnum.NEUTRAL) {
				return this.THEME_PORT.muted(this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? this.PROMPT_STYLE_PORT.NEUTRAL_MARK_UNICODE : this.PROMPT_STYLE_PORT.NEUTRAL_MARK_ASCII);
			}

			if (state.status === ESpinnerStatusEnum.INFO) {
				return this.THEME_PORT.info(this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? this.PROMPT_STYLE_PORT.NEUTRAL_MARK_UNICODE : this.PROMPT_STYLE_PORT.NEUTRAL_MARK_ASCII);
			}

			if (state.status === ESpinnerStatusEnum.WARNING) {
				return this.THEME_PORT.accent(this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? this.PROMPT_STYLE_PORT.NEUTRAL_MARK_UNICODE : this.PROMPT_STYLE_PORT.NEUTRAL_MARK_ASCII);
			}

			return this.THEME_PORT.info(frames[frameIndex % frames.length] ?? "-");
		};

		const render = (): void => {
			if (spinnerStates.size === 0) {
				this.OUTPUT_PORT.writeFrame("");

				return;
			}

			const lines: Array<string> = [...spinnerStates.entries()].map(([id, state]: [string, TSpinnerManagerStateType]): string => {
				const hierarchyPrefix: string = this.resolveHierarchyPrefix({
					id,
					spinnerStates,
				});
				const labelSegments: Array<string> = [hierarchyPrefix, state.prefix, id].filter((segment: string | undefined): segment is string => segment !== undefined && segment.length > 0);
				const label: string = labelSegments.join("/");

				return `${getStatePrefix(state)} ${label}: ${state.text}`;
			});
			this.OUTPUT_PORT.writeFrame(lines.join("\n"));
		};

		const maybeStopLoop = (): void => {
			const hasRunningState: boolean = [...spinnerStates.values()].some((state: TSpinnerManagerStateType): boolean => state.status === ESpinnerStatusEnum.RUNNING);

			if (!hasRunningState && timerHandle !== null) {
				this.CLOCK_PORT.clearInterval(timerHandle);
				timerHandle = null;
				this.OUTPUT_PORT.showCursor();
			}
		};

		const ensureLoop = (): void => {
			if (timerHandle !== null) {
				return;
			}

			this.OUTPUT_PORT.hideCursor();
			timerHandle = this.CLOCK_PORT.setInterval((): void => {
				frameIndex += ONE_CONSTANT;
				render();
			}, intervalMs);
		};

		const stopAll = (): void => {
			if (timerHandle !== null) {
				this.CLOCK_PORT.clearInterval(timerHandle);
				timerHandle = null;
			}

			for (const state of spinnerStates.values()) {
				state.status = ESpinnerStatusEnum.NEUTRAL;
				notifyStateChange(state);
			}

			render();
			this.OUTPUT_PORT.showCursor();
			this.ACTIVE_STOP_ALL_CALLBACKS.delete(stopAll);
		};

		const handle: TBeanSpinnerManagerHandleType = {
			create: (createInput: TBeanSpinnerManagerCreateInputType): IBeanSpinnerHandleInterface => {
				const initialState: TSpinnerManagerStateType = {
					id: createInput.id,
					onStateChange: createInput.onStateChange,
					parentId: createInput.parentId,
					prefix: createInput.prefix,
					status: ESpinnerStatusEnum.RUNNING,
					text: createInput.text,
				};
				spinnerStates.set(createInput.id, initialState);
				ensureLoop();
				notifyStateChange(initialState);
				render();

				const setStatus = (status: ESpinnerStatusEnum, text?: string): void => {
					const state: TSpinnerManagerStateType | undefined = spinnerStates.get(createInput.id);

					if (state === undefined) {
						return;
					}

					state.status = status;
					state.text = text ?? state.text;
					notifyStateChange(state);
					render();
					maybeStopLoop();
				};

				return {
					fail: (text?: string): void => {
						setStatus(ESpinnerStatusEnum.FAILED, text);
					},
					info: (text?: string): void => {
						setStatus(ESpinnerStatusEnum.INFO, this.THEME_PORT.info(text ?? spinnerStates.get(createInput.id)?.text ?? ""));
					},
					get isSpinning(): boolean {
						return spinnerStates.get(createInput.id)?.status === ESpinnerStatusEnum.RUNNING;
					},
					stop: (text?: string): void => {
						setStatus(ESpinnerStatusEnum.NEUTRAL, text);
					},
					succeed: (text?: string): void => {
						setStatus(ESpinnerStatusEnum.SUCCEEDED, text);
					},
					update: (text: string): void => {
						const state: TSpinnerManagerStateType | undefined = spinnerStates.get(createInput.id);

						if (state === undefined) {
							return;
						}

						state.text = text;
						notifyStateChange(state);
						render();
					},
					warn: (text?: string): void => {
						setStatus(ESpinnerStatusEnum.WARNING, this.THEME_PORT.accent(text ?? spinnerStates.get(createInput.id)?.text ?? ""));
					},
				};
			},
			stopAll,
		};
		this.ACTIVE_STOP_ALL_CALLBACKS.add(stopAll);

		return handle;
	}

	public dispose(): void {
		for (const stopAll of this.ACTIVE_STOP_ALL_CALLBACKS.values()) {
			stopAll();
		}
	}

	private resolveHierarchyPrefix(input: { id: string; spinnerStates: ReadonlyMap<string, TSpinnerManagerStateType> }): string {
		const segments: Array<string> = [];
		let currentParentId: string | undefined = input.spinnerStates.get(input.id)?.parentId;
		const visitedIds: Set<string> = new Set<string>([input.id]);

		while (currentParentId !== undefined) {
			if (visitedIds.has(currentParentId)) {
				break;
			}

			visitedIds.add(currentParentId);
			const parentState: TSpinnerManagerStateType | undefined = input.spinnerStates.get(currentParentId);

			if (parentState === undefined) {
				break;
			}

			const segment: string = parentState.prefix ?? parentState.id;
			segments.unshift(segment);
			currentParentId = parentState.parentId;
		}

		return segments.join("/");
	}
}
