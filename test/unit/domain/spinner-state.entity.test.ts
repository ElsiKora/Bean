import { describe, expect, it } from "vitest";
import { SpinnerStateEntity } from "../../../src/domain/entity/spinner-state.entity";

describe("SpinnerStateEntity", () => {
	it("supports immutable updates", () => {
		const state = new SpinnerStateEntity({
			id: "spinner",
			text: "start",
			frames: ["-", "|"],
			intervalMs: 80,
		});

		const next = state.with({ frameIndex: 1, isActive: false, text: "next" });
		const falsyNext = next.with({ frameIndex: 0, isActive: false, text: "" });
		expect(state.TEXT).toBe("start");
		expect(next.TEXT).toBe("next");
		expect(next.FRAME_INDEX).toBe(1);
		expect(next.IS_ACTIVE).toBe(false);
		expect(falsyNext.TEXT).toBe("");
		expect(falsyNext.FRAME_INDEX).toBe(0);
		expect(falsyNext.IS_ACTIVE).toBe(false);
	});
});
