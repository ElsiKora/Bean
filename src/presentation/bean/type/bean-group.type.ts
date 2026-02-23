import type { TBeanGroupStepType } from "./bean-group-step.type";

export type TBeanGroupInputType = {
	onCancel?: (context: Readonly<Record<string, unknown>>) => void;
	onSubmit?: (context: Readonly<Record<string, unknown>>) => void;
	steps: ReadonlyArray<TBeanGroupStepType>;
};
