import type { TBeanSpinnerManagerEventType } from "./bean-spinner-manager-event.type";

export type TBeanSpinnerManagerCreateInputType = {
	id: string;
	onStateChange?: (input: TBeanSpinnerManagerEventType) => void;
	parentId?: string;
	prefix?: string;
	text: string;
};
