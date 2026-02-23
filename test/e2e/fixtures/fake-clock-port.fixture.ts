import type { IClockPortInterface } from "../../../src/application/interface/port/clock-port.interface";
import type { TClockHandleType } from "../../../src/application/interface/port/type/clock-handle.type";

type TIntervalRecordType = {
	callback: () => void;
	active: boolean;
};

type TTimeoutRecordType = {
	callback: () => void;
};

export class FakeClockPortFixture implements IClockPortInterface {
	private nextHandleId: number;

	private readonly intervalMap: Map<number, TIntervalRecordType>;

	private readonly timeoutMap: Map<number, TTimeoutRecordType>;

	public constructor() {
		this.nextHandleId = 1;
		this.intervalMap = new Map<number, TIntervalRecordType>();
		this.timeoutMap = new Map<number, TTimeoutRecordType>();
	}

	public now(): number {
		return 1_700_000_000_000;
	}

	public setInterval(callback: () => void, _intervalMs: number): TClockHandleType {
		const id = this.nextHandleId;
		this.nextHandleId += 1;
		this.intervalMap.set(id, { callback, active: true });
		return id as unknown as TClockHandleType;
	}

	public clearInterval(handle: TClockHandleType): void {
		const id = Number(handle);
		const interval = this.intervalMap.get(id);
		if (interval !== undefined) {
			interval.active = false;
			this.intervalMap.set(id, interval);
		}
	}

	public clearTimeout(handle: TClockHandleType): void {
		const id = Number(handle);
		this.timeoutMap.delete(id);
	}

	public setTimeout(callback: () => void, _timeoutMs: number): TClockHandleType {
		const id = this.nextHandleId;
		this.nextHandleId += 1;
		this.timeoutMap.set(id, { callback });
		return id as unknown as TClockHandleType;
	}

	public runIntervals(cycles: number = 1): void {
		for (let iteration = 0; iteration < cycles; iteration += 1) {
			for (const record of this.intervalMap.values()) {
				if (record.active) {
					record.callback();
				}
			}
			this.runTimeouts();
		}
	}

	public runTimeouts(): void {
		const pending = [...this.timeoutMap.entries()];
		this.timeoutMap.clear();
		for (const [, timeout] of pending) {
			timeout.callback();
		}
	}
}
