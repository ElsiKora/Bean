import type { SelectOptionValueObject } from "@domain/value-object/select-option.value-object";

export type TPromptMultiselectArgumentsType = {
	abortSignal?: AbortSignal;
	initialValues?: ReadonlyArray<string>;
	isRequired?: boolean;
	isSearchEnabled?: boolean;
	message: string;
	onCancel?: () => void;
	onState?: (state: { cursorIndex: number; selectedValues: ReadonlyArray<string> }) => void;
	onSubmit?: (values: ReadonlyArray<string>) => void;
	options: ReadonlyArray<SelectOptionValueObject>;
	pageSize?: number;
	renderFrame?: (state: { cursorIndex: number; message: string; options: ReadonlyArray<SelectOptionValueObject>; query: string; selectedValues: ReadonlyArray<string> }) => string;
	timeoutMs?: number;
	withLoop?: boolean;
};
