export type TBeanTreeSelectNodeType = {
	children?: ReadonlyArray<TBeanTreeSelectNodeType>;
	label: string;
	value: string;
};
