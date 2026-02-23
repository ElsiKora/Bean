import type { IBeanMultiselectPromptInputInterface } from "../../interface";

export type TBeanFluentMultiselectInputType = {
	fallbackValue?: ReadonlyArray<string>;
	onResolved?: (value: null | ReadonlyArray<string>) => void;
} & IBeanMultiselectPromptInputInterface;
