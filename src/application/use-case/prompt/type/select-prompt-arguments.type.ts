import type { SelectOptionValueObject } from "@domain/value-object/select-option.value-object";

export type TPromptSelectArgumentsType = {
	abortSignal?: AbortSignal;
	defaultValue?: string;
	initialIndex?: number;
	isSearchEnabled?: boolean;
	message: string;
	onCancel?: () => void;
	onState?: (state: { cursorIndex: number; selectedOption: null | string }) => void;
	onSubmit?: (value: string) => void;
	options: ReadonlyArray<SelectOptionValueObject>;
	pageSize?: number;
	renderFrame?: (state: { cursorIndex: number; message: string; options: ReadonlyArray<SelectOptionValueObject>; query: string }) => string;
	timeoutMs?: number;
	withLoop?: boolean;
};
