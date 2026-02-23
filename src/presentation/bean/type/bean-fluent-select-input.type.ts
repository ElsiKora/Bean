import type { IBeanSelectPromptInputInterface } from "../../interface";

export type TBeanFluentSelectInputType = {
	defaultValue?: string;
	fallbackValue?: string;
	onResolved?: (value: null | string) => void;
} & IBeanSelectPromptInputInterface;
