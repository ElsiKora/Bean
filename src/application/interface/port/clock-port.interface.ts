import type { TClockHandleType } from "./type/clock-handle.type";

export interface IClockPortInterface {
	clearInterval(handle: TClockHandleType): void;
	clearTimeout(handle: TClockHandleType): void;
	now(): number;
	setInterval(callback: () => void, intervalMs: number): TClockHandleType;
	setTimeout(callback: () => void, timeoutMs: number): TClockHandleType;
}
