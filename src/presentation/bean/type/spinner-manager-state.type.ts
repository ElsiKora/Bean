import type { ESpinnerStatusEnum } from "@domain/enum";

import type { TBeanSpinnerManagerEventType } from "./bean-spinner-manager-event.type";

export type TSpinnerManagerStateType = {
	id: string;
	onStateChange?: (input: TBeanSpinnerManagerEventType) => void;
	parentId?: string;
	prefix?: string;
	status: ESpinnerStatusEnum;
	text: string;
};
