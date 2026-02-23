import type { IBeanSpinnerHandleInterface } from "../../interface";

import type { TBeanSpinnerManagerCreateInputType } from "./bean-spinner-manager-create-input.type";

export type TBeanSpinnerManagerHandleType = {
	create(input: TBeanSpinnerManagerCreateInputType): IBeanSpinnerHandleInterface;
	stopAll(): void;
};
