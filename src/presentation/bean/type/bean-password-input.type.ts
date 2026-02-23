export type TBeanPasswordInputType = {
	defaultValue?: string;
	fallbackValue?: string;
	initialValue?: string;
	isRequired?: boolean;
	maskCharacter?: string;
	message: string;
	timeoutMs?: number;
	validate?: (value: string) => null | string;
};
