import type { ESpinnerStatusEnum } from "@domain/enum";

export type TBeanSpinnerManagerEventType = {
	id: string;
	parentId?: string;
	prefix?: string;
	status: ESpinnerStatusEnum;
	text: string;
};
