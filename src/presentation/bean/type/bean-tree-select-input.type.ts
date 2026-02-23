import type { TBeanTreeSelectNodeType } from "./bean-tree-select-node.type";

export type TBeanTreeSelectInputType = {
	abortSignal?: AbortSignal;
	fallbackValue?: ReadonlyArray<string>;
	initialValues?: ReadonlyArray<string>;
	isRequired?: boolean;
	isSearchEnabled?: boolean;
	message: string;
	nodes: ReadonlyArray<TBeanTreeSelectNodeType>;
	onCancel?: () => void;
	onState?: (state: { cursorIndex: number; selectedValues: ReadonlyArray<string> }) => void;
	onSubmit?: (values: ReadonlyArray<string>) => void;
	pageSize?: number;
	withLoop?: boolean;
};
