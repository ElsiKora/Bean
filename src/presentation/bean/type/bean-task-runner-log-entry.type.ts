export type TBeanTaskRunnerLogEntryType = {
	level: "error" | "info" | "success" | "warn";
	message: string;
	taskPath: ReadonlyArray<string>;
	timestampMs: number;
};
