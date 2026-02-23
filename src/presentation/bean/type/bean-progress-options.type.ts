import type { TBeanProgressRenderInputType } from "./bean-progress-render-input.type";

export type TBeanProgressOptionsType = {
	chars?: { complete: string; incomplete: string };
	format?: string;
	initial?: number;
	isClearOnComplete?: boolean;
	label?: string;
	onRender?: (input: TBeanProgressRenderInputType) => void;
	prefix?: string;
	total: number;
};
