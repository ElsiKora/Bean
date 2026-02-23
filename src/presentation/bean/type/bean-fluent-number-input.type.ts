import type { TBeanNumberInputType } from "./bean-number-input.type";

export type TBeanFluentNumberInputType = {
	onResolved?: (value: null | number) => void;
} & TBeanNumberInputType;
