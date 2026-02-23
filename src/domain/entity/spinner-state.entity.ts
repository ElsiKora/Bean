export class SpinnerStateEntity {
	public readonly FRAME_INDEX: number;

	public readonly FRAMES: ReadonlyArray<string>;

	public readonly ID: string;

	public readonly INTERVAL_MS: number;

	public readonly IS_ACTIVE: boolean;

	public readonly TEXT: string;

	public readonly TIMER_HANDLE: unknown;

	public constructor(input: { frameIndex?: number; frames: ReadonlyArray<string>; id: string; intervalMs: number; isActive?: boolean; text: string; timerHandle?: unknown }) {
		this.ID = input.id;
		this.TEXT = input.text;
		this.FRAMES = input.frames;
		this.INTERVAL_MS = input.intervalMs;
		this.FRAME_INDEX = input.frameIndex ?? 0;
		this.IS_ACTIVE = input.isActive ?? true;
		this.TIMER_HANDLE = input.timerHandle ?? null;
	}

	public with(input: Partial<{ frameIndex?: number; frames: ReadonlyArray<string>; id: string; intervalMs: number; isActive?: boolean; text: string; timerHandle?: unknown }>): SpinnerStateEntity {
		const hasTimerHandle: boolean = "timerHandle" in input;

		return new SpinnerStateEntity({
			frameIndex: input.frameIndex ?? this.FRAME_INDEX,
			frames: input.frames ?? this.FRAMES,
			id: input.id ?? this.ID,
			intervalMs: input.intervalMs ?? this.INTERVAL_MS,
			isActive: input.isActive ?? this.IS_ACTIVE,
			text: input.text ?? this.TEXT,
			timerHandle: hasTimerHandle ? input.timerHandle : this.TIMER_HANDLE,
		});
	}
}
