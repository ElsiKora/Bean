export type TBeanGroupStepType = {
	key: string;
	run: (context: Readonly<Record<string, unknown>>) => Promise<unknown>;
	when?: (context: Readonly<Record<string, unknown>>) => boolean | Promise<boolean>;
};
