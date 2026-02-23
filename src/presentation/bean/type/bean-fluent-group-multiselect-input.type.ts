import type { IBeanMultiselectPromptInputInterface } from "../../interface";

export type TBeanFluentGroupMultiselectInputType = {
	fallbackValue?: ReadonlyArray<string>;
	onResolved?: (value: null | ReadonlyArray<string>) => void;
} & IBeanMultiselectPromptInputInterface;
