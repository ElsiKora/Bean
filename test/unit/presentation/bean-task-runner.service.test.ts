import { describe, expect, it } from "vitest";
import { ETaskRunnerRendererModeEnum, ETaskRunnerStatusEnum } from "../../../src/domain/enum";
import type { TBeanTaskRunnerEventType } from "../../../src/presentation/bean/type";
import { ONE_CONSTANT } from "../../../src/presentation/bean/constant";
import { BeanTaskRunnerService } from "../../../src/presentation/bean/service/bean-task-runner.service";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";

const TWO_CONSTANT: number = ONE_CONSTANT + ONE_CONSTANT;

describe("BeanTaskRunnerService", () => {
	it("handles skip, retries, rollback failures and non-fail-fast mode", async () => {
		const service = new BeanTaskRunnerService({
			clockPort: new FakeClockPortFixture(),
		});
		const logs: Array<{ level: "error" | "info" | "success" | "warn"; message: string }> = [];
		let retryAttemptCount: number = 0;

		const result = await service.run({
			concurrency: ONE_CONSTANT,
			isFailFast: false,
			log: (entry: { level: "error" | "info" | "success" | "warn"; message: string }): void => {
				logs.push(entry);
			},
			tasks: [
				{
					run: async (): Promise<void> => Promise.resolve(),
					title: "skipped",
					when: (): boolean => false,
				},
				{
					retries: TWO_CONSTANT,
					run: async (): Promise<void> => {
						retryAttemptCount += ONE_CONSTANT;

						if (retryAttemptCount === ONE_CONSTANT) {
							throw new Error("first attempt failed");
						}
					},
					title: "retry-success",
				},
				{
					rollback: async (): Promise<void> => {
						throw new Error("rollback failed");
					},
					run: async (): Promise<void> => {
						throw new Error("hard failure");
					},
					title: "hard-failure",
				},
				{
					run: async (): Promise<void> => Promise.resolve(),
					title: "post-failure-success",
				},
			],
		});

		expect(result).toEqual({
			failed: ONE_CONSTANT,
			skipped: ONE_CONSTANT,
			succeeded: TWO_CONSTANT,
		});
		expect(retryAttemptCount).toBe(TWO_CONSTANT);
		expect(logs.some((entry): boolean => entry.level === "warn" && entry.message.includes("rollback failed for hard-failure"))).toBe(true);
	});

	it("supports nested subtasks with observability and persisted logs", async () => {
		const service = new BeanTaskRunnerService({
			clockPort: new FakeClockPortFixture(),
		});
		const events: Array<{ status: string; taskPath: ReadonlyArray<string> }> = [];
		const logs: Array<{ level: "error" | "info" | "success" | "warn"; message: string }> = [];
		let subtaskAttempts: number = 0;

		const result = await service.run({
			concurrency: ONE_CONSTANT,
			isPersistLogs: true,
			log: (entry: { level: "error" | "info" | "success" | "warn"; message: string }): void => {
				logs.push(entry);
			},
			logPrefix: "[runtime]",
			onEvent: (event: TBeanTaskRunnerEventType): void => {
				events.push({
					status: event.status,
					taskPath: event.taskPath,
				});
			},
			tasks: [
				{
					prefix: "[core]",
					run: (): void => {},
					subtasks: [
						{
							run: (): void => {},
							title: "lint",
						},
						{
							retries: TWO_CONSTANT,
							run: (): void => {
								subtaskAttempts += ONE_CONSTANT;

								if (subtaskAttempts === ONE_CONSTANT) {
									throw new Error("retry me");
								}
							},
							title: "unit",
						},
						{
							run: (): void => {},
							title: "optional",
							when: (): boolean => false,
						},
					],
					title: "build",
				},
				{
					run: (): void => {},
					title: "deploy",
				},
			],
		});

		expect(result).toMatchObject({
			failed: 0,
			skipped: ONE_CONSTANT,
			succeeded: 4,
		});
		expect(subtaskAttempts).toBe(TWO_CONSTANT);
		expect(result.logs?.length).toBeGreaterThan(0);
		expect(result.logs?.every((entry): boolean => entry.message.startsWith("[runtime]"))).toBe(true);
		expect(logs.some((entry): boolean => entry.message.includes("build > unit"))).toBe(true);
		expect(events.some((event): boolean => event.status === ETaskRunnerStatusEnum.RETRYING && event.taskPath.join(">") === "build>unit")).toBe(true);
	});

	it("supports compact renderer mode with max visible log cap", async () => {
		const service = new BeanTaskRunnerService({
			clockPort: new FakeClockPortFixture(),
		});
		const logs: Array<{ level: "error" | "info" | "success" | "warn"; message: string }> = [];

		await expect(
			service.run({
				log: (entry: { level: "error" | "info" | "success" | "warn"; message: string }): void => {
					logs.push(entry);
				},
				maxVisible: ONE_CONSTANT,
				rendererMode: ETaskRunnerRendererModeEnum.COMPACT,
				tasks: [
					{
						run: (): void => {},
						title: "build",
					},
					{
						run: (): void => {},
						title: "test",
					},
				],
			}),
		).resolves.toEqual({
			failed: 0,
			skipped: 0,
			succeeded: TWO_CONSTANT,
		});
		expect(logs.length).toBe(TWO_CONSTANT);
		expect(logs.at(-1)?.message).toContain("additional task logs hidden");
		expect(logs[0]?.message.includes("  ")).toBe(false);
	});
});
