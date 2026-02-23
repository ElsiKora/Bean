import type { SelectOptionValueObject } from "@domain/value-object/select-option.value-object";

import type { IBeanSelectPromptInputInterface } from "../../interface";

export type TBeanPromptSchemaSelectItemType = {
	kind: "select";
	message?: string;
	options: ReadonlyArray<SelectOptionValueObject>;
} & Omit<IBeanSelectPromptInputInterface, "message" | "options">;
