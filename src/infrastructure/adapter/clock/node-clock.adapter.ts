import type { IClockPortInterface } from "@application/interface/port/clock-port.interface";
import type { TClockHandleType } from "@application/interface/port/type/clock-handle.type";

export class NodeClockAdapter implements IClockPortInterface {
	public clearInterval(handle: TClockHandleType): void {
		clearInterval(handle);
	}

	public clearTimeout(handle: TClockHandleType): void {
		clearTimeout(handle);
	}

	public now(): number {
		return Date.now();
	}

	public setInterval(callback: () => void, intervalMs: number): TClockHandleType {
		return setInterval(callback, intervalMs);
	}

	public setTimeout(callback: () => void, timeoutMs: number): TClockHandleType {
		return setTimeout(callback, timeoutMs);
	}
}
