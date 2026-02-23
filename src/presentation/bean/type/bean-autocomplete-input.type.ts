import type { SelectOptionValueObject } from "@domain/value-object/select-option.value-object";

export type TAutocompleteInputType = {
	fallbackValue?: string;
	initialQuery?: string;
	message: string;
	queryMessage?: string;
	source: (query: string) => Promise<ReadonlyArray<SelectOptionValueObject>> | ReadonlyArray<SelectOptionValueObject>;
};
