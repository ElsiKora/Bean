import type { TBeanTaskRunnerLogEntryType } from "./bean-task-runner-log-entry.type";

export type TBeanTaskRunnerResultType = {
	failed: number;
	logs?: ReadonlyArray<TBeanTaskRunnerLogEntryType>;
	skipped: number;
	succeeded: number;
};
