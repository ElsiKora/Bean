import { type BeanAdapter, createBeanAdapterFactory, type TBeanProgressRenderInputType } from "@elsikora/bean";

const ZERO: number = 0;
const ONE: number = 1;
const TWO: number = 2;
const THREE: number = 3;

const PERCENT_BASE: number = 100;
const QUARTER_PERCENT: number = 25;
const HALF_PERCENT: number = 50;
const THREE_QUARTERS_PERCENT: number = 75;

const DOWNLOAD_TOTAL: number = 50;
const DOWNLOAD_DELAY_MS: number = 60;
const PROCESS_TOTAL: number = 30;
const PROCESS_DELAY_MS: number = 80;
const BUILD_TOTAL: number = 40;
const BUILD_DELAY_MS: number = 50;

const FILE_ONE_TOTAL: number = 40;
const FILE_TWO_TOTAL: number = 60;
const FILE_THREE_TOTAL: number = 30;
const MULTI_TICK_DELAY_MS: number = 80;

const STEP_SEQUENCE: ReadonlyArray<number> = [ONE, TWO, THREE];

const DEPLOY_TOTAL: number = 100;
const DEPLOY_STEP_ONE_TOTAL: number = 30;
const DEPLOY_STEP_TWO_TOTAL: number = 40;
const DEPLOY_STEP_THREE_TOTAL: number = 30;
const DEPLOY_STEP_ONE_OFFSET: number = 30;
const DEPLOY_STEP_TWO_OFFSET: number = 70;
const DEPLOY_TICK_DELAY_MS: number = 40;

const delay = (ms: number): Promise<void> => new Promise((resolve: () => void) => setTimeout(resolve, ms));

const bean: BeanAdapter = createBeanAdapterFactory({ environment: process.env });

type TMultiProgressItem = {
	bar: ReturnType<ReturnType<BeanAdapter["createMultiProgress"]>["add"]>;
	remaining: number;
};

bean.intro({ message: "Progress Bars Demo" });
bean.divider();

bean.message({ message: "1) Static progress snapshots:" });
bean.progress({ current: ZERO, label: "Starting...", total: PERCENT_BASE });
bean.progress({ current: QUARTER_PERCENT, label: "Downloading", total: PERCENT_BASE });
bean.progress({ current: HALF_PERCENT, label: "Halfway", total: PERCENT_BASE });
bean.progress({ current: THREE_QUARTERS_PERCENT, label: "Almost done", total: PERCENT_BASE });
bean.progress({ current: PERCENT_BASE, label: "Complete!", total: PERCENT_BASE });

bean.message({ message: "" });

bean.message({ message: "2) Animated progress bar:" });

const bar: ReturnType<BeanAdapter["createProgress"]> = bean.createProgress({
	label: "Downloading",
	prefix: "[npm]",
	total: DOWNLOAD_TOTAL,
});

for (let index: number = ZERO; index < DOWNLOAD_TOTAL; index++) {
	await delay(DOWNLOAD_DELAY_MS);
	bar.increment();
}

bar.stop();
bean.log({ level: "success", message: "Download complete" });

bean.message({ message: "" });

bean.message({ message: "3) Custom bar characters:" });

const custom: ReturnType<BeanAdapter["createProgress"]> = bean.createProgress({
	chars: { complete: "█", incomplete: "░" },
	label: "Processing",
	total: PROCESS_TOTAL,
});

for (let index: number = ZERO; index < PROCESS_TOTAL; index++) {
	await delay(PROCESS_DELAY_MS);
	custom.increment();
}

custom.stop();
bean.log({ level: "success", message: "Processing complete" });

bean.message({ message: "" });

bean.message({ message: "4) Progress with render callback:" });

let lastMilestone: number = ZERO;

const tracked: ReturnType<BeanAdapter["createProgress"]> = bean.createProgress({
	label: "Building",
	onRender: (state: TBeanProgressRenderInputType): void => {
		const percent: number = Math.floor((state.current / state.total) * PERCENT_BASE);
		const milestone: number = Math.floor(percent / QUARTER_PERCENT) * QUARTER_PERCENT;

		if (milestone > lastMilestone) {
			lastMilestone = milestone;
		}
	},
	total: BUILD_TOTAL,
});

for (let index: number = ZERO; index < BUILD_TOTAL; index++) {
	await delay(BUILD_DELAY_MS);
	tracked.increment();
}

tracked.stop();
bean.log({ level: "success", message: "Build complete" });

bean.message({ message: "" });

bean.message({ message: "5) Multi-progress (concurrent downloads):" });

const multi: ReturnType<BeanAdapter["createMultiProgress"]> = bean.createMultiProgress();

const file1: ReturnType<ReturnType<BeanAdapter["createMultiProgress"]>["add"]> = multi.add({
	id: "file1",
	label: "package-lock.json",
	total: FILE_ONE_TOTAL,
});

const file2: ReturnType<ReturnType<BeanAdapter["createMultiProgress"]>["add"]> = multi.add({
	id: "file2",
	label: "node_modules.tar",
	total: FILE_TWO_TOTAL,
});

const file3: ReturnType<ReturnType<BeanAdapter["createMultiProgress"]>["add"]> = multi.add({
	id: "file3",
	label: "dist.zip",
	total: FILE_THREE_TOTAL,
});

const tick = async (): Promise<void> => {
	const items: Array<TMultiProgressItem> = [
		{ bar: file1, remaining: FILE_ONE_TOTAL },
		{ bar: file2, remaining: FILE_TWO_TOTAL },
		{ bar: file3, remaining: FILE_THREE_TOTAL },
	];

	let maxRemaining: number = Math.max(...items.map((item: TMultiProgressItem): number => item.remaining));
	let stepPointer: number = ZERO;

	while (maxRemaining > ZERO) {
		await delay(MULTI_TICK_DELAY_MS);

		for (const item of items) {
			if (item.remaining > ZERO) {
				const stepCandidate: number = STEP_SEQUENCE[stepPointer % STEP_SEQUENCE.length] ?? ONE;
				const step: number = Math.min(stepCandidate, item.remaining);
				item.bar.increment(step);
				item.remaining -= step;
				stepPointer += ONE;

				if (item.remaining <= ZERO) {
					item.bar.stop();
				}
			}
		}

		maxRemaining = Math.max(...items.map((item: TMultiProgressItem): number => item.remaining));
	}
};

await tick();
multi.stop();
bean.log({ level: "success", message: "All downloads complete" });

bean.message({ message: "" });

bean.message({ message: "6) Hierarchical multi-progress:" });

const deploy: ReturnType<BeanAdapter["createMultiProgress"]> = bean.createMultiProgress();

const parent: ReturnType<ReturnType<BeanAdapter["createMultiProgress"]>["add"]> = deploy.add({
	id: "deploy",
	label: "Deployment",
	total: DEPLOY_TOTAL,
});

const step1: ReturnType<ReturnType<BeanAdapter["createMultiProgress"]>["add"]> = deploy.add({
	id: "step1",
	label: "Build assets",
	parentId: "deploy",
	total: DEPLOY_STEP_ONE_TOTAL,
});

const step2: ReturnType<ReturnType<BeanAdapter["createMultiProgress"]>["add"]> = deploy.add({
	id: "step2",
	label: "Upload to CDN",
	parentId: "deploy",
	total: DEPLOY_STEP_TWO_TOTAL,
});

const step3: ReturnType<ReturnType<BeanAdapter["createMultiProgress"]>["add"]> = deploy.add({
	id: "step3",
	label: "Invalidate cache",
	parentId: "deploy",
	total: DEPLOY_STEP_THREE_TOTAL,
});

for (let index: number = ZERO; index < DEPLOY_STEP_ONE_TOTAL; index++) {
	await delay(DEPLOY_TICK_DELAY_MS);
	step1.increment();
	parent.update(index);
}

step1.stop();

for (let index: number = ZERO; index < DEPLOY_STEP_TWO_TOTAL; index++) {
	await delay(DEPLOY_TICK_DELAY_MS);
	step2.increment();
	parent.update(DEPLOY_STEP_ONE_OFFSET + index);
}

step2.stop();

for (let index: number = ZERO; index < DEPLOY_STEP_THREE_TOTAL; index++) {
	await delay(DEPLOY_TICK_DELAY_MS);
	step3.increment();
	parent.update(DEPLOY_STEP_TWO_OFFSET + index);
}

step3.stop();
parent.update(DEPLOY_TOTAL);
parent.stop();
deploy.stop();

bean.log({ level: "success", message: "Deployment complete" });

bean.divider();
bean.outro({ message: "Progress bars demo complete!" });
bean.dispose();
