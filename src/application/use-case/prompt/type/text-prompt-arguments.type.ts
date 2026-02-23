export type TPromptTextArgumentsType = {
	abortSignal?: AbortSignal;
	defaultValue?: string;
	filter?: (value: string) => string;
	formatSubmittedValue?: (value: string) => string;
	initialValue?: string;
	isRequired?: boolean;
	message: string;
	onCancel?: () => void;
	onState?: (state: { cursorIndex: number; isAllSelected: boolean; validationError: null | string; value: string }) => void;
	onSubmit?: (value: string) => void;
	placeholder?: string;
	renderFrame?: (state: { cursorIndex: number; isAllSelected: boolean; message: string; validationError: null | string; value: string }) => string;
	timeoutMs?: number;
	transformer?: (value: string) => string;
	validate?: (value: string) => null | string;
};
