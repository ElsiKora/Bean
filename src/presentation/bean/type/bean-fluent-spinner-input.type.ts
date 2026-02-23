import type { IBeanSpinnerHandleInterface } from "../../interface";

import type { TBeanSpinnerInputType } from "./bean-spinner.type";

export type TBeanFluentSpinnerInputType = {
	task?: (spinnerHandle: IBeanSpinnerHandleInterface) => Promise<void> | void;
} & TBeanSpinnerInputType;
