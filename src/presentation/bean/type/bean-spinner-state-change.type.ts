import type { ESpinnerStatusEnum } from "@domain/enum";

export type TBeanSpinnerStateChangeType = {
	status: ESpinnerStatusEnum;
	text: string;
};
