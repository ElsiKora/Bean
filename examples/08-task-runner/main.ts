import { type BeanAdapter, createBeanAdapterFactory, type TBeanTaskRunnerEventType, type TBeanTaskRunnerResultType } from "@elsikora/bean";

const ZERO: number = 0;
const RETRY_ATTEMPTS_COUNT: number = 3;

const DELAY_BUILD_FAST_MS: number = 100;
const DELAY_BUILD_SLOW_MS: number = 200;
const DELAY_SHORT_MS: number = 300;
const DELAY_MEDIUM_MS: number = 400;
const DELAY_LONG_MS: number = 500;
const DELAY_LONGER_MS: number = 600;
const DELAY_VERY_LONG_MS: number = 800;
const DELAY_MAX_MS: number = 1000;

const delay = (ms: number): Promise<void> => new Promise((resolve: () => void) => setTimeout(resolve, ms));

const bean: BeanAdapter = createBeanAdapterFactory({ environment: process.env });

bean.intro({ message: "Task Runner Demo" });
bean.divider();

bean.message({ message: "1) Basic sequential tasks:" });

const basic: TBeanTaskRunnerResultType = await bean.runTasks({
	tasks: [
		{
			run: async (): Promise<void> => {
				await delay(DELAY_VERY_LONG_MS);
			},
			title: "Install dependencies",
		},
		{
			run: async (): Promise<void> => {
				await delay(DELAY_LONGER_MS);
			},
			title: "Run linter",
		},
		{
			run: async (): Promise<void> => {
				await delay(DELAY_MAX_MS);
			},
			title: "Compile TypeScript",
		},
		{
			run: async (): Promise<void> => {
				await delay(DELAY_LONG_MS);
			},
			title: "Generate declarations",
		},
	],
});

bean.log({ level: "info", message: `Result: ${String(basic.succeeded)} succeeded, ${String(basic.failed)} failed, ${String(basic.skipped)} skipped` });
bean.message({ message: "" });

bean.message({ message: "2) Tasks with subtasks:" });

const nested: TBeanTaskRunnerResultType = await bean.runTasks({
	tasks: [
		{
			run: async (): Promise<void> => {
				await delay(DELAY_BUILD_SLOW_MS);
			},
			subtasks: [
				{
					run: async (): Promise<void> => {
						await delay(DELAY_LONG_MS);
					},
					title: "ESLint",
				},
				{
					run: async (): Promise<void> => {
						await delay(DELAY_MEDIUM_MS);
					},
					title: "Prettier",
				},
				{
					run: async (): Promise<void> => {
						await delay(DELAY_SHORT_MS);
					},
					title: "TypeScript type check",
				},
			],
			title: "Lint & Format",
		},
		{
			run: async (): Promise<void> => {
				await delay(DELAY_BUILD_FAST_MS);
			},
			subtasks: [
				{
					run: async (): Promise<void> => {
						await delay(DELAY_LONGER_MS);
					},
					title: "Unit tests",
				},
				{
					run: async (): Promise<void> => {
						await delay(DELAY_VERY_LONG_MS);
					},
					title: "Integration tests",
				},
			],
			title: "Test Suite",
		},
	],
});

bean.log({ level: "info", message: `Result: ${String(nested.succeeded)} succeeded, ${String(nested.failed)} failed` });
bean.message({ message: "" });

bean.message({ message: "3) Tasks with retries (flaky task retries up to 3 times):" });

let attempt: number = ZERO;

const retried: TBeanTaskRunnerResultType = await bean.runTasks({
	tasks: [
		{
			retries: RETRY_ATTEMPTS_COUNT,
			run: async (): Promise<void> => {
				attempt += 1;

				if (attempt < RETRY_ATTEMPTS_COUNT) {
					throw new Error(`Attempt ${String(attempt)} failed — connection reset`);
				}

				await delay(DELAY_LONG_MS);
			},
			title: "Deploy to staging (flaky network)",
		},
	],
});

bean.log({ level: "info", message: `Succeeded after ${String(attempt)} attempts. Result: ${String(retried.succeeded)} succeeded` });
bean.message({ message: "" });

bean.message({ message: "4) Conditional tasks (when):" });

const IS_CI: boolean = false;

const conditional: TBeanTaskRunnerResultType = await bean.runTasks({
	tasks: [
		{
			run: async (): Promise<void> => {
				await delay(DELAY_LONG_MS);
			},
			title: "Build application",
		},
		{
			run: async (): Promise<void> => {
				await delay(DELAY_LONG_MS);
			},
			title: "Run E2E tests (CI only)",
			when: (): boolean => IS_CI,
		},
		{
			run: async (): Promise<void> => {
				await delay(DELAY_SHORT_MS);
			},
			title: "Generate changelog",
		},
	],
});

bean.log({ level: "info", message: `Result: ${String(conditional.succeeded)} succeeded, ${String(conditional.skipped)} skipped` });
bean.message({ message: "" });

bean.message({ message: "5) Tasks with rollback on failure:" });

const withRollback: TBeanTaskRunnerResultType = await bean.runTasks({
	isFailFast: true,
	tasks: [
		{
			rollback: async (): Promise<void> => {
				await delay(DELAY_SHORT_MS);
			},
			run: async (): Promise<void> => {
				await delay(DELAY_LONG_MS);
			},
			title: "Create database backup",
		},
		{
			rollback: async (): Promise<void> => {
				await delay(DELAY_SHORT_MS);
			},
			run: async (): Promise<void> => {
				await delay(DELAY_MEDIUM_MS);
			},
			title: "Run database migrations",
		},
		{
			run: async (): Promise<void> => {
				await delay(DELAY_SHORT_MS);

				throw new Error("Health check failed — service unreachable");
			},
			title: "Verify deployment health",
		},
	],
});

bean.log({ level: "info", message: `Result: ${String(withRollback.succeeded)} succeeded, ${String(withRollback.failed)} failed` });
bean.message({ message: "" });

bean.message({ message: "6) Tasks with lifecycle events:" });

const events: TBeanTaskRunnerResultType = await bean.runTasks({
	isPersistLogs: true,
	logPrefix: "[release]",
	onEvent: (event: TBeanTaskRunnerEventType): void => {
		const path: string = event.taskPath.join(" > ");
		bean.log({ level: "info", message: `Event: ${event.status} — ${path} (depth: ${String(event.depth)})` });
	},
	tasks: [
		{
			run: async (): Promise<void> => {
				await delay(DELAY_MEDIUM_MS);
			},
			title: "Bump version",
		},
		{
			run: async (): Promise<void> => {
				await delay(DELAY_LONGER_MS);
			},
			title: "Build artifacts",
		},
		{
			run: async (): Promise<void> => {
				await delay(DELAY_SHORT_MS);
			},
			title: "Publish to npm",
		},
	],
});

bean.log({ level: "info", message: `Result: ${String(events.succeeded)} succeeded` });

if (events.logs !== undefined) {
	bean.log({ level: "info", message: `Persisted ${String(events.logs.length)} log entries` });
}

bean.divider();
bean.outro({ message: "Task runner demo complete!" });
bean.dispose();
