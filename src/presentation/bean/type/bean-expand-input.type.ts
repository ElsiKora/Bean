import type { SelectOptionValueObject } from "@domain/value-object/select-option.value-object";

export type TBeanExpandInputType = {
	fallbackValue?: string;
	message: string;
	options: ReadonlyArray<SelectOptionValueObject>;
};
