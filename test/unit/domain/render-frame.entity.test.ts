import { describe, expect, it } from "vitest";
import { RenderFrameEntity } from "../../../src/domain/entity/render-frame.entity";

describe("RenderFrameEntity", () => {
	it("converts lines to text", () => {
		const frame = new RenderFrameEntity({ lines: ["a", "b"] });
		expect(frame.toText()).toBe("a\nb");
	});
});
