import type { IClockPortInterface } from "@application/interface/port/clock-port.interface";

import type { TBeanTaskRunnerEventType, TBeanTaskRunnerLogEntryType, TBeanTaskRunnerResultType, TBeanTaskRunnerTaskType } from "../type";
import type { TBeanTaskRunnerExecutionContextType } from "../type/bean-task-runner-execution-context.type";
import type { TBeanTaskRunnerServiceInputType } from "../type/bean-task-runner-service-input.type";

import { ETaskRunnerRendererModeEnum, ETaskRunnerStatusEnum } from "@domain/enum";

import { ONE_CONSTANT, ZERO_CONSTANT } from "../constant";

const TASK_INDENT_UNIT_CONSTANT: string = "  ";
const TASK_LOG_OUTPUT_TRUNCATED_MESSAGE_CONSTANT: string = "... additional task logs hidden.";
const TASK_PATH_SEPARATOR_CONSTANT: string = " > ";
const WHITESPACE_SEQUENCE_REGEX_CONSTANT: RegExp = /\s+/g;

export class BeanTaskRunnerService {
	private readonly CLOCK_PORT: IClockPortInterface;

	public constructor(input: { clockPort: IClockPortInterface }) {
		this.CLOCK_PORT = input.clockPort;
	}

	public run(input: TBeanTaskRunnerServiceInputType): Promise<TBeanTaskRunnerResultType> {
		const queue: Array<TBeanTaskRunnerTaskType> = [...input.tasks];
		const concurrency: number = Math.max(ONE_CONSTANT, input.concurrency ?? ONE_CONSTANT);
		const isFailFast: boolean = input.isFailFast ?? true;
		const isPersistLogs: boolean = input.isPersistLogs ?? false;
		const maxVisible: number = input.maxVisible === undefined ? Number.POSITIVE_INFINITY : Math.max(input.maxVisible, ZERO_CONSTANT);
		const persistentLogs: Array<TBeanTaskRunnerLogEntryType> = [];
		const rendererMode: ETaskRunnerRendererModeEnum = input.rendererMode ?? ETaskRunnerRendererModeEnum.DETAILED;

		const summary: TBeanTaskRunnerResultType = {
			failed: 0,
			skipped: 0,
			succeeded: 0,
		};
		let isAborted: boolean = false;
		let isLogTruncationNotified: boolean = false;
		let visibleLogCount: number = ZERO_CONSTANT;

		const emitEvent = (event: Omit<TBeanTaskRunnerEventType, "timestampMs">): void => {
			input.onEvent?.({
				...event,
				timestampMs: this.CLOCK_PORT.now(),
			});
		};

		const formatTaskLabel = (task: TBeanTaskRunnerTaskType, executionContext: TBeanTaskRunnerExecutionContextType): string => {
			const taskPathLabel: string = executionContext.taskPath.join(TASK_PATH_SEPARATOR_CONSTANT);
			const prefixedLabel: string = task.prefix === undefined ? taskPathLabel : `${task.prefix} ${taskPathLabel}`;
			const indentation: string = TASK_INDENT_UNIT_CONSTANT.repeat(executionContext.depth);

			return `${indentation}${prefixedLabel}`;
		};

		const log = (logInput: { level: "error" | "info" | "success" | "warn"; message: string; taskPath: ReadonlyArray<string> }): void => {
			const prefixedMessage: string = input.logPrefix === undefined ? logInput.message : `${input.logPrefix} ${logInput.message}`;

			const message: string = this.formatLogMessage({
				message: prefixedMessage,
				rendererMode,
			});

			if (visibleLogCount < maxVisible) {
				input.log({
					level: logInput.level,
					message,
				});
				visibleLogCount += ONE_CONSTANT;
			} else if (!isLogTruncationNotified) {
				const truncationMessage: string = this.formatLogMessage({
					message: input.logPrefix === undefined ? TASK_LOG_OUTPUT_TRUNCATED_MESSAGE_CONSTANT : `${input.logPrefix} ${TASK_LOG_OUTPUT_TRUNCATED_MESSAGE_CONSTANT}`,
					rendererMode,
				});
				input.log({
					level: "info",
					message: truncationMessage,
				});
				isLogTruncationNotified = true;
			}

			if (!isPersistLogs) {
				return;
			}

			persistentLogs.push({
				level: logInput.level,
				message,
				taskPath: [...logInput.taskPath],
				timestampMs: this.CLOCK_PORT.now(),
			});
		};

		const runTask = async (task: TBeanTaskRunnerTaskType, executionContext: TBeanTaskRunnerExecutionContextType): Promise<void> => {
			const taskLabel: string = formatTaskLabel(task, executionContext);

			if (isAborted) {
				summary.skipped += ONE_CONSTANT;
				emitEvent({
					attempt: 0,
					depth: executionContext.depth,
					status: ETaskRunnerStatusEnum.SKIPPED,
					taskPath: executionContext.taskPath,
					title: task.title,
				});

				return;
			}

			let isEnabled: boolean = true;

			if (task.when !== undefined) {
				try {
					isEnabled = await Promise.resolve(task.when());
				} catch (error) {
					summary.failed += ONE_CONSTANT;
					log({
						level: "error",
						message: `✗ ${taskLabel}: ${this.getErrorMessage(error)}`,
						taskPath: executionContext.taskPath,
					});
					emitEvent({
						attempt: 0,
						depth: executionContext.depth,
						errorMessage: this.getErrorMessage(error),
						status: ETaskRunnerStatusEnum.FAILED,
						taskPath: executionContext.taskPath,
						title: task.title,
					});

					if (isFailFast) {
						isAborted = true;
					}

					return;
				}
			}

			if (!isEnabled) {
				summary.skipped += ONE_CONSTANT;
				log({
					level: "info",
					message: `○ ${taskLabel} (skipped)`,
					taskPath: executionContext.taskPath,
				});
				emitEvent({
					attempt: 0,
					depth: executionContext.depth,
					status: ETaskRunnerStatusEnum.SKIPPED,
					taskPath: executionContext.taskPath,
					title: task.title,
				});

				return;
			}

			const retries: number = Math.max(ONE_CONSTANT, task.retries ?? ONE_CONSTANT);
			let attempt: number = 0;
			let lastError: unknown = null;

			while (attempt < retries) {
				attempt += ONE_CONSTANT;
				emitEvent({
					attempt,
					depth: executionContext.depth,
					status: ETaskRunnerStatusEnum.STARTED,
					taskPath: executionContext.taskPath,
					title: task.title,
				});

				try {
					const attemptSuffix: string = retries > ONE_CONSTANT ? ` (attempt ${String(attempt)}/${String(retries)})` : "";
					log({
						level: "info",
						message: `→ ${taskLabel}${attemptSuffix}`,
						taskPath: executionContext.taskPath,
					});
					await Promise.resolve(task.run());
					summary.succeeded += ONE_CONSTANT;
					log({
						level: "success",
						message: `✓ ${taskLabel}`,
						taskPath: executionContext.taskPath,
					});
					emitEvent({
						attempt,
						depth: executionContext.depth,
						status: ETaskRunnerStatusEnum.SUCCEEDED,
						taskPath: executionContext.taskPath,
						title: task.title,
					});

					for (const subtask of task.subtasks ?? []) {
						await runTask(subtask, {
							depth: executionContext.depth + ONE_CONSTANT,
							taskPath: [...executionContext.taskPath, subtask.title],
						});

						if (isAborted && isFailFast) {
							break;
						}
					}

					return;
				} catch (error) {
					lastError = error;

					if (attempt >= retries) {
						continue;
					}

					emitEvent({
						attempt,
						depth: executionContext.depth,
						errorMessage: this.getErrorMessage(lastError),
						status: ETaskRunnerStatusEnum.RETRYING,
						taskPath: executionContext.taskPath,
						title: task.title,
					});
					log({
						level: "warn",
						message: `↻ ${taskLabel} retrying after failure`,
						taskPath: executionContext.taskPath,
					});
				}
			}

			summary.failed += ONE_CONSTANT;
			log({
				level: "error",
				message: `✗ ${taskLabel}: ${this.getErrorMessage(lastError)}`,
				taskPath: executionContext.taskPath,
			});
			emitEvent({
				attempt,
				depth: executionContext.depth,
				errorMessage: this.getErrorMessage(lastError),
				status: ETaskRunnerStatusEnum.FAILED,
				taskPath: executionContext.taskPath,
				title: task.title,
			});

			if (task.rollback !== undefined) {
				try {
					await Promise.resolve(task.rollback());
					emitEvent({
						attempt,
						depth: executionContext.depth,
						status: ETaskRunnerStatusEnum.ROLLBACK_SUCCEEDED,
						taskPath: executionContext.taskPath,
						title: task.title,
					});
					log({
						level: "info",
						message: `↩ rollback completed for ${taskLabel}`,
						taskPath: executionContext.taskPath,
					});
				} catch (rollbackError) {
					log({
						level: "warn",
						message: `! rollback failed for ${taskLabel}: ${this.getErrorMessage(rollbackError)}`,
						taskPath: executionContext.taskPath,
					});
					emitEvent({
						attempt,
						depth: executionContext.depth,
						errorMessage: this.getErrorMessage(rollbackError),
						status: ETaskRunnerStatusEnum.ROLLBACK_FAILED,
						taskPath: executionContext.taskPath,
						title: task.title,
					});
				}
			}

			if (isFailFast) {
				isAborted = true;
			}
		};

		const runWorker = async (): Promise<void> => {
			while (queue.length > 0) {
				const task: TBeanTaskRunnerTaskType | undefined = queue.shift();

				if (task === undefined) {
					return;
				}

				await runTask(task, {
					depth: 0,
					taskPath: [task.title],
				});
			}
		};

		return Promise.all(Array.from({ length: concurrency }, (): Promise<void> => runWorker())).then((): TBeanTaskRunnerResultType => {
			if (!isPersistLogs) {
				return summary;
			}

			return {
				...summary,
				logs: persistentLogs,
			};
		});
	}

	private formatLogMessage(input: { message: string; rendererMode: ETaskRunnerRendererModeEnum }): string {
		if (input.rendererMode === ETaskRunnerRendererModeEnum.DETAILED) {
			return input.message;
		}

		return input.message.replaceAll(WHITESPACE_SEQUENCE_REGEX_CONSTANT, " ").trim();
	}

	private getErrorMessage(error: unknown): string {
		if (error instanceof Error) {
			return error.message;
		}

		return "Unknown error";
	}
}
