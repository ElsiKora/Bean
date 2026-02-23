export type TBeanFluentPasswordInputType = {
	defaultValue?: string;
	fallbackValue?: string;
	initialValue?: string;
	isRequired?: boolean;
	maskCharacter?: string;
	message: string;
	onResolved?: (value: null | string) => void;
	timeoutMs?: number;
	validate?: (value: string) => null | string;
};
