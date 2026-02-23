import type { ETaskRunnerRendererModeEnum } from "@domain/enum";

import type { TBeanTaskRunnerEventType } from "./bean-task-runner-event.type";
import type { TBeanTaskRunnerTaskType } from "./bean-task-runner-task.type";

export type TBeanTaskRunnerInputType = {
	concurrency?: number;
	isFailFast?: boolean;
	isPersistLogs?: boolean;
	logPrefix?: string;
	maxVisible?: number;
	onEvent?: (event: TBeanTaskRunnerEventType) => void;
	rendererMode?: ETaskRunnerRendererModeEnum;
	tasks: ReadonlyArray<TBeanTaskRunnerTaskType>;
};
