import type { TClockHandleType } from "@application/interface/port/type/clock-handle.type";

export type TSpinnerStopRuntimeType = {
	disposeExternalWriteListener: () => void;
	intervalHandle: null | TClockHandleType;
	scheduledTimeoutHandle?: null | TClockHandleType;
};
