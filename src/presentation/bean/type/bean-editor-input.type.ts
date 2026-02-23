export type TBeanEditorInputType = {
	defaultValue?: string;
	editorCommand?: string;
	fallbackValue?: string;
	initialValue?: string;
	isRequired?: boolean;
	message: string;
	validate?: (value: string) => null | string;
};
