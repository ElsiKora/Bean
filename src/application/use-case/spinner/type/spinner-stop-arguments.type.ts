import type { SpinnerStateEntity } from "@domain/entity/spinner-state.entity";
import type { ESpinnerStatusEnum } from "@domain/enum";

export type TSpinnerStopArgumentsType = {
	state: SpinnerStateEntity;
	status: ESpinnerStatusEnum;
	text?: string;
};
