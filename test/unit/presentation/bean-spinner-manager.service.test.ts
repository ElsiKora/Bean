import { describe, expect, it } from "vitest";
import { ESpinnerStatusEnum } from "../../../src/domain/enum";
import type { TBeanSpinnerManagerEventType } from "../../../src/presentation/bean/type";
import { ONE_CONSTANT } from "../../../src/presentation/bean/constant";
import { BeanSpinnerManagerService } from "../../../src/presentation/bean/service/bean-spinner-manager.service";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";
import { IdentityThemePortFixture } from "../fixtures/identity-theme-port.fixture";

describe("BeanSpinnerManagerService", () => {
	it("uses configurable status marks and restores cursor on stopAll", () => {
		const output = new FakeOutputPortFixture({ supportsUnicode: false });
		const clock = new FakeClockPortFixture();
		const stateChanges: Array<{ id: string; status: ESpinnerStatusEnum }> = [];
		const service = new BeanSpinnerManagerService({
			clockPort: clock,
			outputPort: output,
			promptStylePort: {
				ACTIVE_POINTER_ASCII: ">",
				ACTIVE_POINTER_UNICODE: ">",
				COMPLETED_MARK_ASCII: "OK",
				COMPLETED_MARK_UNICODE: "OK",
				DESCRIPTION_INDENT_PREFIX: "  ",
				DISABLED_LABEL_SUFFIX: " (disabled)",
				ERROR_PREFIX: "!",
				FAILED_MARK_ASCII: "FAIL",
				FAILED_MARK_UNICODE: "FAIL",
				GROUP_INDENT_PREFIX: "  ",
				HINT_PREFIX: " - ",
				IS_BLANK_LINE_AFTER_QUESTION_ENABLED: true,
				NEUTRAL_MARK_ASCII: "NEUT",
				NEUTRAL_MARK_UNICODE: "NEUT",
				PLACEHOLDER_PREFIX: "› ",
				QUESTION_PREFIX_SYMBOL: "?",
				SELECTED_MARK_ASCII: "[x]",
				SELECTED_MARK_UNICODE: "[x]",
				SEPARATOR_SYMBOL: "-",
				TOGGLE_FALSE_LABEL: "off",
				TOGGLE_TRUE_LABEL: "on",
				UNSELECTED_MARK_ASCII: "[ ]",
				UNSELECTED_MARK_UNICODE: "[ ]",
			},
			themePort: new IdentityThemePortFixture(),
		});

		const manager = service.create({
			frames: [".", "o"],
			intervalMs: ONE_CONSTANT,
		});
		const first = manager.create({ id: "build", prefix: "core", text: "running" });
		const second = manager.create({
			id: "unit",
			onStateChange: (input: TBeanSpinnerManagerEventType): void => {
				stateChanges.push({
					id: input.id,
					status: input.status,
				});
			},
			parentId: "build",
			prefix: "lint",
			text: "running",
		});
		const third = manager.create({ id: "docs", text: "running" });

		expect(output.cursorHidden).toBe(true);
		clock.runIntervals(ONE_CONSTANT);
		first.succeed("done");
		second.fail("failed");
		third.stop("stopped");
		expect(output.frames.some((line: string): boolean => line.includes("OK core/build: done"))).toBe(true);
		expect(output.frames.some((line: string): boolean => line.includes("FAIL core/lint/unit: failed"))).toBe(true);
		expect(output.frames.some((line: string): boolean => line.includes("NEUT docs: stopped"))).toBe(true);
		expect(stateChanges.some((change): boolean => change.id === "unit" && change.status === ESpinnerStatusEnum.RUNNING)).toBe(true);
		expect(stateChanges.some((change): boolean => change.id === "unit" && change.status === ESpinnerStatusEnum.FAILED)).toBe(true);

		manager.stopAll();
		expect(output.cursorHidden).toBe(false);
	});
});
