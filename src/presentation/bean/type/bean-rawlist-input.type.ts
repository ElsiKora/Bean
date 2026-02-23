import type { SelectOptionValueObject } from "@domain/value-object/select-option.value-object";

export type TBeanRawlistInputType = {
	defaultValue?: string;
	fallbackValue?: string;
	message: string;
	options: ReadonlyArray<SelectOptionValueObject>;
	pageSize?: number;
};
