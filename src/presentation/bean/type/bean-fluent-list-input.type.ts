import type { TBeanListInputType } from "./bean-list-input.type";

export type TBeanFluentListInputType = {
	onResolved?: (value: null | ReadonlyArray<string>) => void;
} & TBeanListInputType;
