import { describe, expect, it } from "vitest";
import { ESpinnerStatusEnum } from "../../../src/domain/enum";
import { FrameDiffService } from "../../../src/application/service/render/frame-diff.service";
import { SpinnerStartUseCase } from "../../../src/application/use-case/spinner/spinner-start.use-case";
import { SpinnerStopUseCase } from "../../../src/application/use-case/spinner/spinner-stop.use-case";
import { SpinnerUpdateUseCase } from "../../../src/application/use-case/spinner/spinner-update.use-case";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";
import { IdentityPromptStylePortFixture } from "../fixtures/identity-prompt-style-port.fixture";

describe("Spinner use-cases", () => {
	it("starts, updates, rerenders after external writes and stops", () => {
		const output = new FakeOutputPortFixture({ isTTY: true, supportsUnicode: true });
		const clock = new FakeClockPortFixture();
		const startUseCase = new SpinnerStartUseCase({
			outputPort: output,
			clockPort: clock,
			frameDiffService: new FrameDiffService(),
		});
		const updateUseCase = new SpinnerUpdateUseCase();
		const stopUseCase = new SpinnerStopUseCase({
			outputPort: output,
			clockPort: clock,
			promptStylePort: new IdentityPromptStylePortFixture(),
		});

		let state = startUseCase.execute({ text: "Loading", intervalMs: 20 });
		expect(output.frames.at(-1)).toContain("Loading");

		clock.runIntervals(2);
		expect(output.frames.length).toBeGreaterThan(1);

		state = updateUseCase.execute({ state, text: "Almost done" });
		expect(output.frames.at(-1)).toContain("Almost done");

		output.writeLine("external-log");
		clock.runTimeouts();
		expect(output.frames.at(-1)).toContain("Almost done");

		state = stopUseCase.execute({ state, status: ESpinnerStatusEnum.SUCCEEDED, text: "Done" });
		expect(state.IS_ACTIVE).toBe(false);
		expect(output.frames.at(-1)).toContain("v Done");
		expect(output.cursorHidden).toBe(false);
	});

	it("falls back to static output on non-tty", () => {
		const output = new FakeOutputPortFixture({ isTTY: false });
		const clock = new FakeClockPortFixture();
		const startUseCase = new SpinnerStartUseCase({
			outputPort: output,
			clockPort: clock,
			frameDiffService: new FrameDiffService(),
		});

		const state = startUseCase.execute({ text: "Static" });
		expect(state.IS_ACTIVE).toBe(false);
		expect(output.lines.at(-1)).toContain("Static");
	});
});
