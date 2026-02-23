export type TBeanMultiProgressItemType = {
	increment(delta?: number): void;
	setLabel(label?: string): void;
	setPrefix(prefix?: string): void;
	stop(): void;
	update(current: number): void;
};
