import type { TBeanMultiProgressItemInputType } from "./bean-multi-progress-item-input.type";
import type { TBeanMultiProgressItemType } from "./bean-multi-progress-item.type";

export type TBeanMultiProgressHandleType = {
	add(input: TBeanMultiProgressItemInputType): TBeanMultiProgressItemType;
	stop(): void;
};
