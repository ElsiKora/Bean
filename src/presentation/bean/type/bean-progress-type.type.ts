export type TBeanProgressType = {
	increment(delta?: number): void;
	stop(): void;
	update(current: number): void;
};
