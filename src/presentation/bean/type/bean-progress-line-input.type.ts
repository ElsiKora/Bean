export type TBeanProgressLineInputType = {
	chars?: { complete: string; incomplete: string };
	current: number;
	format?: string;
	label?: string;
	prefix?: string;
	startAtMs: number;
	total: number;
};
