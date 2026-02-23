import type { IClockPortInterface } from "@application/interface/port/clock-port.interface";
import type { IOutputPortInterface } from "@application/interface/port/output-port.interface";
import type { IThemePortInterface } from "@application/interface/port/theme-port.interface";

import type { TBeanMultiProgressInputType, TBeanMultiProgressItemInputType, TBeanMultiProgressItemType, TBeanProgressInputType, TBeanProgressLineInputType, TBeanProgressOptionsType, TBeanProgressType } from "../type";

import { MILLISECONDS_IN_SECOND_CONSTANT, MIN_ELAPSED_SECONDS_CONSTANT, ONE_CONSTANT, PROGRESS_BAR_MAX_WIDTH_CONSTANT, PROGRESS_BAR_MIN_WIDTH_CONSTANT, PROGRESS_LABEL_RESERVED_WIDTH_CONSTANT, PROGRESS_PERCENT_MAX_CONSTANT, PROGRESS_PERCENT_PADDING_CONSTANT, PROGRESS_PRECISION_CONSTANT, ZERO_CONSTANT } from "../constant";

const MIN_PROGRESS_TOTAL_CONSTANT: number = 1;

export class BeanProgressService {
	private readonly CLOCK_PORT: IClockPortInterface;

	private readonly OUTPUT_PORT: IOutputPortInterface;

	private readonly THEME_PORT: IThemePortInterface;

	public constructor(input: { clockPort: IClockPortInterface; outputPort: IOutputPortInterface; themePort: IThemePortInterface }) {
		this.CLOCK_PORT = input.clockPort;
		this.OUTPUT_PORT = input.outputPort;
		this.THEME_PORT = input.themePort;
	}

	public createMultiProgress(input: TBeanMultiProgressInputType = {}): {
		add(input: TBeanMultiProgressItemInputType): TBeanMultiProgressItemType;
		stop(): void;
	} {
		const progressMap: Map<string, { current: number; id: string; label?: string; parentId?: string; prefix?: string; startAtMs: number; total: number }> = new Map<string, { current: number; id: string; label?: string; parentId?: string; prefix?: string; startAtMs: number; total: number }>();

		const render = (): void => {
			const lines: Array<string> = [...progressMap.values()].map((item: { current: number; id: string; label?: string; parentId?: string; prefix?: string; startAtMs: number; total: number }): string => {
				const hierarchyPrefix: string = this.resolveHierarchyPrefix({
					itemId: item.id,
					progressMap,
				});
				const combinedPrefix: string = [hierarchyPrefix, item.prefix].filter((value: string | undefined): value is string => value !== undefined && value.length > ZERO_CONSTANT).join(" ");

				return this.renderProgressLine({
					...item,
					prefix: combinedPrefix.length === ZERO_CONSTANT ? undefined : combinedPrefix,
				});
			});

			if (lines.length === ZERO_CONSTANT) {
				this.OUTPUT_PORT.writeFrame("");

				return;
			}

			this.OUTPUT_PORT.writeFrame(lines.join("\n"));
			input.onRender?.({ lines });
		};

		const stop = (): void => {
			progressMap.clear();

			if (input.isClearOnComplete ?? false) {
				this.OUTPUT_PORT.writeFrame("");
			}
		};

		return {
			add: (barInput: TBeanMultiProgressItemInputType): TBeanMultiProgressItemType => {
				if (barInput.total < MIN_PROGRESS_TOTAL_CONSTANT) {
					throw new Error(`Progress item total must be >= ${String(MIN_PROGRESS_TOTAL_CONSTANT)}.`);
				}

				progressMap.set(barInput.id, {
					current: barInput.current ?? ZERO_CONSTANT,
					id: barInput.id,
					label: barInput.label,
					parentId: barInput.parentId,
					prefix: barInput.prefix,
					startAtMs: this.CLOCK_PORT.now(),
					total: barInput.total,
				});
				render();

				return {
					increment: (delta: number = ONE_CONSTANT): void => {
						const currentProgress: { current: number; id: string; label?: string; parentId?: string; prefix?: string; startAtMs: number; total: number } | undefined = progressMap.get(barInput.id);

						if (currentProgress === undefined) {
							return;
						}

						currentProgress.current += delta;
						render();
					},
					setLabel: (label?: string): void => {
						const currentProgress: { current: number; id: string; label?: string; parentId?: string; prefix?: string; startAtMs: number; total: number } | undefined = progressMap.get(barInput.id);

						if (currentProgress === undefined) {
							return;
						}

						currentProgress.label = label;
						render();
					},
					setPrefix: (prefix?: string): void => {
						const currentProgress: { current: number; id: string; label?: string; parentId?: string; prefix?: string; startAtMs: number; total: number } | undefined = progressMap.get(barInput.id);

						if (currentProgress === undefined) {
							return;
						}

						currentProgress.prefix = prefix;
						render();
					},
					stop: (): void => {
						progressMap.delete(barInput.id);
						render();
					},
					update: (current: number): void => {
						const currentProgress: { current: number; id: string; label?: string; parentId?: string; prefix?: string; startAtMs: number; total: number } | undefined = progressMap.get(barInput.id);

						if (currentProgress === undefined) {
							return;
						}

						currentProgress.current = current;
						render();
					},
				};
			},
			stop,
		};
	}

	public createProgress(input: TBeanProgressOptionsType): TBeanProgressType {
		if (input.total < MIN_PROGRESS_TOTAL_CONSTANT) {
			throw new Error(`Progress total must be >= ${String(MIN_PROGRESS_TOTAL_CONSTANT)}.`);
		}

		const state: { current: number; startAtMs: number } = {
			current: input.initial ?? ZERO_CONSTANT,
			startAtMs: this.CLOCK_PORT.now(),
		};

		const render = (): void => {
			const line: string = this.renderProgressLine({
				chars: input.chars,
				current: state.current,
				format: input.format,
				label: input.label,
				prefix: input.prefix,
				startAtMs: state.startAtMs,
				total: input.total,
			});

			this.OUTPUT_PORT.writeFrame(line);
			input.onRender?.({
				current: state.current,
				line,
				total: input.total,
			});
		};

		render();

		return {
			increment: (delta: number = ONE_CONSTANT): void => {
				state.current += delta;
				render();
			},
			stop: (): void => {
				if (input.isClearOnComplete ?? false) {
					this.OUTPUT_PORT.writeFrame("");
				}
			},
			update: (current: number): void => {
				state.current = current;
				render();
			},
		};
	}

	public progress(input: TBeanProgressInputType): void {
		if (input.total < MIN_PROGRESS_TOTAL_CONSTANT) {
			throw new Error(`Progress total must be >= ${String(MIN_PROGRESS_TOTAL_CONSTANT)}.`);
		}

		const line: string = this.renderProgressLine({
			current: input.current,
			label: input.label,
			prefix: input.prefix,
			startAtMs: this.CLOCK_PORT.now(),
			total: input.total,
		});

		this.OUTPUT_PORT.writeFrame(line);
	}

	private renderProgressLine(input: TBeanProgressLineInputType): string {
		const total: number = Math.max(input.total, ONE_CONSTANT);
		const current: number = Math.min(Math.max(input.current, ZERO_CONSTANT), total);
		const ratio: number = current / total;
		const width: number = Math.min(Math.max(this.OUTPUT_PORT.COLUMNS - PROGRESS_LABEL_RESERVED_WIDTH_CONSTANT, PROGRESS_BAR_MIN_WIDTH_CONSTANT), PROGRESS_BAR_MAX_WIDTH_CONSTANT);
		const done: number = Math.round(ratio * width);
		const completeChar: string = (input.chars?.complete ?? "=").slice(ZERO_CONSTANT, ONE_CONSTANT);
		const incompleteChar: string = (input.chars?.incomplete ?? " ").slice(ZERO_CONSTANT, ONE_CONSTANT);
		const bar: string = `${completeChar.repeat(done)}${incompleteChar.repeat(width - done)}`;

		const percent: string = Math.round(ratio * PROGRESS_PERCENT_MAX_CONSTANT)
			.toString()
			.padStart(PROGRESS_PERCENT_PADDING_CONSTANT, " ");
		const elapsedSeconds: number = Math.max((this.CLOCK_PORT.now() - input.startAtMs) / MILLISECONDS_IN_SECOND_CONSTANT, MIN_ELAPSED_SECONDS_CONSTANT);
		const speed: number = current / elapsedSeconds;
		const remaining: number = Math.max(total - current, ZERO_CONSTANT);
		const etaSeconds: number = speed <= ZERO_CONSTANT ? ZERO_CONSTANT : remaining / speed;
		const labelPrefix: string = input.label === undefined ? "" : `${input.label} `;
		const prefixText: string = input.prefix === undefined ? "" : `${input.prefix} `;
		const defaultFormat: string = `${prefixText}${labelPrefix}[{bar}] {percent}% ({current}/{total}) eta:{eta}s speed:{speed}/s`;
		const format: string = input.format ?? defaultFormat;

		return this.THEME_PORT.info(format.replace("{bar}", bar).replace("{percent}", percent).replace("{current}", String(current)).replace("{total}", String(total)).replace("{elapsed}", elapsedSeconds.toFixed(ONE_CONSTANT)).replace("{eta}", etaSeconds.toFixed(ONE_CONSTANT)).replace("{speed}", speed.toFixed(PROGRESS_PRECISION_CONSTANT)));
	}

	private resolveHierarchyPrefix(input: { itemId: string; progressMap: ReadonlyMap<string, { current: number; id: string; label?: string; parentId?: string; prefix?: string; startAtMs: number; total: number }> }): string {
		const segments: Array<string> = [];
		let currentParentId: string | undefined = input.progressMap.get(input.itemId)?.parentId;
		const visitedIds: Set<string> = new Set<string>([input.itemId]);

		while (currentParentId !== undefined) {
			if (visitedIds.has(currentParentId)) {
				break;
			}

			visitedIds.add(currentParentId);
			const parentItem: { current: number; id: string; label?: string; parentId?: string; prefix?: string; startAtMs: number; total: number } | undefined = input.progressMap.get(currentParentId);

			if (parentItem === undefined) {
				break;
			}

			const segment: string = parentItem.prefix ?? parentItem.id;
			segments.unshift(segment);
			currentParentId = parentItem.parentId;
		}

		return segments.join(" ");
	}
}
