export type TBeanTaskRunnerTaskType = {
	prefix?: string;
	retries?: number;
	rollback?: () => Promise<void> | void;
	run: () => Promise<void> | void;
	subtasks?: ReadonlyArray<TBeanTaskRunnerTaskType>;
	title: string;
	when?: () => boolean | Promise<boolean>;
};
