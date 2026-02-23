import type { IBeanTextPromptInputInterface } from "../../interface";

export type TBeanFluentTextInputType = {
	fallbackValue?: string;
	onResolved?: (value: null | string) => void;
	timeoutMs?: number;
} & IBeanTextPromptInputInterface;
