import type { ETaskRunnerStatusEnum } from "@domain/enum";

export type TBeanTaskRunnerEventType = {
	attempt: number;
	depth: number;
	errorMessage?: string;
	status: ETaskRunnerStatusEnum;
	taskPath: ReadonlyArray<string>;
	timestampMs: number;
	title: string;
};
