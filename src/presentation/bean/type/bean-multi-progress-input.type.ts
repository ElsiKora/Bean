import type { TBeanMultiProgressRenderInputType } from "./bean-multi-progress-render-input.type";

export type TBeanMultiProgressInputType = {
	isClearOnComplete?: boolean;
	onRender?: (input: TBeanMultiProgressRenderInputType) => void;
};
