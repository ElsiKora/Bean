import type { SelectOptionValueObject } from "@domain/value-object/select-option.value-object";

import type { IBeanMultiselectPromptInputInterface } from "../../interface";

export type TBeanPromptSchemaMultiselectItemType = {
	kind: "multiselect";
	message?: string;
	options: ReadonlyArray<SelectOptionValueObject>;
} & Omit<IBeanMultiselectPromptInputInterface, "message" | "options">;
