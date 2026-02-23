import { describe, expect, it } from "vitest";
import { SpinnerStateEntity } from "../../../src/domain/entity/spinner-state.entity";
import { ESpinnerStatusEnum } from "../../../src/domain/enum";
import { SpinnerStopUseCase } from "../../../src/application/use-case/spinner/spinner-stop.use-case";
import { SpinnerUpdateUseCase } from "../../../src/application/use-case/spinner/spinner-update.use-case";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";
import { IdentityPromptStylePortFixture } from "../fixtures/identity-prompt-style-port.fixture";

describe("Spinner branch handling", () => {
	it("covers update/stop behavior for inactive states", () => {
		const baseState = new SpinnerStateEntity({
			id: "inactive",
			text: "start",
			frames: ["-"],
			intervalMs: 80,
			isActive: false,
		});

		const updateUseCase = new SpinnerUpdateUseCase();
		const updated = updateUseCase.execute({ state: baseState, text: "next" });
		expect(updated.TEXT).toBe("next");

		const stopUseCase = new SpinnerStopUseCase({
			outputPort: new FakeOutputPortFixture({ supportsUnicode: false }),
			clockPort: new FakeClockPortFixture(),
			promptStylePort: new IdentityPromptStylePortFixture(),
		});
		const stopped = stopUseCase.execute({ state: updated, status: ESpinnerStatusEnum.FAILED });
		expect(stopped.IS_ACTIVE).toBe(false);
	});
});
