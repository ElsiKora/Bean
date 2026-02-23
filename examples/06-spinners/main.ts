import { type BeanAdapter, createBeanAdapterFactory, ESpinnerStatusEnum, type TBeanSpinnerStateChangeType } from "@elsikora/bean";

const STATE_CHANGE_DELAY_MS: number = 1500;
const STANDARD_DELAY_MS: number = 1000;
const SHORT_DELAY_MS: number = 800;
const LONG_DELAY_MS: number = 1200;
const VERY_LONG_DELAY_MS: number = 2000;
const FINAL_DELAY_MS: number = 500;
const MANAGER_INTERVAL_MS: number = 80;

const delay = (ms: number): Promise<void> => new Promise((resolve: () => void) => setTimeout(resolve, ms));

const bean: BeanAdapter = createBeanAdapterFactory({ environment: process.env });

bean.intro({ message: "Spinners Demo" });
bean.divider();

bean.message({ message: "1) Manual spinner control:" });

const spinner: ReturnType<BeanAdapter["spinner"]> = bean.spinner({ text: "Compiling TypeScript..." });
await delay(STATE_CHANGE_DELAY_MS);
spinner.update("Running type checks...");
await delay(STATE_CHANGE_DELAY_MS);
spinner.update("Generating declarations...");
await delay(STANDARD_DELAY_MS);
spinner.succeed("Compilation complete");

bean.message({ message: "" });

bean.message({ message: "2) Spinner stop states:" });

const s1: ReturnType<BeanAdapter["spinner"]> = bean.spinner({ text: "Checking formatting..." });
await delay(STANDARD_DELAY_MS);
s1.succeed("Formatting OK");

const s2: ReturnType<BeanAdapter["spinner"]> = bean.spinner({ text: "Running linter..." });
await delay(STANDARD_DELAY_MS);
s2.warn("3 warnings found");

const s3: ReturnType<BeanAdapter["spinner"]> = bean.spinner({ text: "Validating schema..." });
await delay(STANDARD_DELAY_MS);
s3.info("Schema validation skipped (no changes)");

const s4: ReturnType<BeanAdapter["spinner"]> = bean.spinner({ text: "Connecting to remote API..." });
await delay(STANDARD_DELAY_MS);
s4.fail("Connection timeout after 30s");

const s5: ReturnType<BeanAdapter["spinner"]> = bean.spinner({ text: "Cleaning up temp files..." });
await delay(STANDARD_DELAY_MS);
s5.stop("Cleanup finished (neutral)");

bean.message({ message: "" });

bean.message({ message: "3) Spinner with state tracking:" });

const tracked: ReturnType<BeanAdapter["spinner"]> = bean.spinner({
	onStateChange: (state: TBeanSpinnerStateChangeType): void => {
		if (state.status !== ESpinnerStatusEnum.RUNNING) {
			bean.log({ level: "info", message: `State changed: ${state.status} — "${state.text}"` });
		}
	},
	text: "Processing data...",
});

await delay(STATE_CHANGE_DELAY_MS);
tracked.succeed("Data processed successfully");

bean.message({ message: "" });

bean.message({ message: "4) Spinner with prefix:" });

const prefixed: ReturnType<BeanAdapter["spinner"]> = bean.spinner({
	prefix: "[build]",
	text: "Bundling application...",
});

await delay(STATE_CHANGE_DELAY_MS);
prefixed.succeed("Bundle ready (245 kB)");

bean.message({ message: "" });

bean.message({ message: "5) Auto-managed spinner (spinnerPromise):" });

const result: string = await bean.spinnerPromise({
	failText: "Download failed",
	successText: "Dependencies installed (142 packages)",
	task: async (): Promise<string> => {
		await delay(VERY_LONG_DELAY_MS);

		return "done";
	},
	text: "Installing dependencies...",
});

bean.log({ level: "info", message: `Task returned: "${result}"` });

bean.message({ message: "" });

bean.message({ message: "6) Spinner manager (concurrent spinners):" });

const manager: ReturnType<BeanAdapter["spinnerManager"]> = bean.spinnerManager({ intervalMs: MANAGER_INTERVAL_MS });

const api: ReturnType<ReturnType<BeanAdapter["spinnerManager"]>["create"]> = manager.create({ id: "api", text: "Starting API server..." });
const database: ReturnType<ReturnType<BeanAdapter["spinnerManager"]>["create"]> = manager.create({ id: "db", text: "Connecting to database..." });
const cache: ReturnType<ReturnType<BeanAdapter["spinnerManager"]>["create"]> = manager.create({ id: "cache", text: "Warming up cache..." });

await delay(LONG_DELAY_MS);
database.succeed("Database connected (PostgreSQL 16)");

await delay(SHORT_DELAY_MS);
cache.succeed("Cache warmed (1,247 entries)");

await delay(STANDARD_DELAY_MS);
api.succeed("API server listening on :3000");

bean.message({ message: "" });

bean.message({ message: "7) Hierarchical spinner manager:" });

const manager2: ReturnType<BeanAdapter["spinnerManager"]> = bean.spinnerManager({ intervalMs: MANAGER_INTERVAL_MS });

const build: ReturnType<ReturnType<BeanAdapter["spinnerManager"]>["create"]> = manager2.create({ id: "build", text: "Building project..." });
const lint: ReturnType<ReturnType<BeanAdapter["spinnerManager"]>["create"]> = manager2.create({ id: "lint", parentId: "build", text: "Linting source files..." });
const compile: ReturnType<ReturnType<BeanAdapter["spinnerManager"]>["create"]> = manager2.create({ id: "compile", parentId: "build", text: "Compiling TypeScript..." });
const test: ReturnType<ReturnType<BeanAdapter["spinnerManager"]>["create"]> = manager2.create({ id: "test", parentId: "build", text: "Running tests..." });

await delay(STANDARD_DELAY_MS);
lint.succeed("No lint errors");

await delay(LONG_DELAY_MS);
compile.succeed("Compiled successfully");

await delay(STATE_CHANGE_DELAY_MS);
test.succeed("42 tests passed");

await delay(FINAL_DELAY_MS);
build.succeed("Build complete");

bean.divider();
bean.outro({ message: "Spinners demo complete!" });
bean.dispose();
