import type { TClockHandleType } from "@application/interface/port/type/clock-handle.type";
import type { SpinnerStateEntity } from "@domain/entity/spinner-state.entity";

export type TSpinnerStartRuntimeType = {
	currentState: SpinnerStateEntity;
	disposeExternalWriteListener: () => void;
	intervalHandle: null | TClockHandleType;
	isPendingExternalRender: boolean;
	isRenderScheduled: boolean;
	render: (state: SpinnerStateEntity) => void;
	scheduledTimeoutHandle: null | TClockHandleType;
};
