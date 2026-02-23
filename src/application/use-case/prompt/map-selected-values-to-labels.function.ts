import type { SelectOptionValueObject } from "@domain/value-object/select-option.value-object";

export const mapSelectedValuesToLabelsFunction = (input: { options: ReadonlyArray<SelectOptionValueObject>; values: ReadonlyArray<string> }): Array<string> => {
	return input.values.map((value: string): string => input.options.find((option: SelectOptionValueObject): boolean => option.value === value)?.label ?? value);
};
