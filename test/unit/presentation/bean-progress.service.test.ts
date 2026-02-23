import { describe, expect, it, vi } from "vitest";
import { ONE_CONSTANT } from "../../../src/presentation/bean/constant";
import { BeanProgressService } from "../../../src/presentation/bean/service/bean-progress.service";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";
import { IdentityThemePortFixture } from "../fixtures/identity-theme-port.fixture";

const TWO_CONSTANT: number = ONE_CONSTANT + ONE_CONSTANT;

describe("BeanProgressService", () => {
	it("renders single and multi progress through writeFrame", () => {
		const output = new FakeOutputPortFixture();
		const onProgressRender = vi.fn();
		const onMultiRender = vi.fn();
		const service = new BeanProgressService({
			clockPort: new FakeClockPortFixture(),
			outputPort: output,
			themePort: new IdentityThemePortFixture(),
		});

		const progress = service.createProgress({
			initial: 0,
			label: "build",
			onRender: onProgressRender,
			prefix: "[main]",
			total: TWO_CONSTANT,
		});
		progress.increment(ONE_CONSTANT);
		expect(output.frames.at(-1)).toContain("1/2");
		expect(output.frames.at(-1)).toContain("[main]");
		expect(onProgressRender).toHaveBeenCalled();

		service.progress({
			current: ONE_CONSTANT,
			label: "quick",
			prefix: "[instant]",
			total: TWO_CONSTANT,
		});
		expect(output.lines.length).toBe(0);
		expect(output.frames.length).toBeGreaterThan(0);

		const multi = service.createMultiProgress({
			isClearOnComplete: true,
			onRender: onMultiRender,
		});
		const parent = multi.add({
			current: 0,
			id: "build",
			prefix: "[build]",
			total: TWO_CONSTANT,
		});
		const item = multi.add({
			current: 0,
			id: "lint-unit",
			label: "Lint",
			parentId: "build",
			prefix: "[unit]",
			total: TWO_CONSTANT,
		});
		parent.increment(ONE_CONSTANT);
		item.increment(ONE_CONSTANT);
		item.setLabel("Lint unit");
		item.setPrefix("[unit-tests]");
		multi.stop();
		expect(onMultiRender).toHaveBeenCalled();
		expect(output.frames.some((frame: string): boolean => frame.includes("[build] [unit-tests] Lint unit"))).toBe(true);
		expect(output.frames.at(-1)).toBe("");
	});
});
