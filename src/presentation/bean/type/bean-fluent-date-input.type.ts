import type { TBeanDateInputType } from "./bean-date-input.type";

export type TBeanFluentDateInputType = {
	onResolved?: (value: Date | null) => void;
} & TBeanDateInputType;
