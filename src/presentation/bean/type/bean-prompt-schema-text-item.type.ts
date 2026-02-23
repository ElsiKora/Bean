import type { IBeanTextPromptInputInterface } from "../../interface";

export type TBeanPromptSchemaTextItemType = {
	kind: "text";
	message?: string;
} & Omit<IBeanTextPromptInputInterface, "message">;
