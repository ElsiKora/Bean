import type { TBeanEditorInputType } from "./bean-editor-input.type";

export type TBeanFluentEditorInputType = {
	onResolved?: (value: null | string) => void;
} & TBeanEditorInputType;
