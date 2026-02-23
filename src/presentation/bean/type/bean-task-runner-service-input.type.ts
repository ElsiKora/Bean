import type { TBeanTaskRunnerLogMessageType } from "./bean-task-runner-log-message.type";
import type { TBeanTaskRunnerInputType } from "./bean-task-runner.type";

export type TBeanTaskRunnerServiceInputType = {
	log: (input: TBeanTaskRunnerLogMessageType) => void;
} & TBeanTaskRunnerInputType;
