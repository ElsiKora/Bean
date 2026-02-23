import { describe, expect, it } from "vitest";
import { FrameDiffService } from "../../../src/application/service/render/frame-diff.service";
import { RenderFrameEntity } from "../../../src/domain/entity/render-frame.entity";

describe("FrameDiffService", () => {
	it("detects changed and unchanged frames", () => {
		const service = new FrameDiffService();
		const previous = new RenderFrameEntity({ lines: ["a"] });
		const same = new RenderFrameEntity({ lines: ["a"] });
		const changed = new RenderFrameEntity({ lines: ["b"] });
		const cursorChanged = new RenderFrameEntity({
			cursor: previous.CURSOR.withColumn(1),
			lines: ["a"],
		});

		expect(service.hasChanged(null, previous)).toBe(true);
		expect(service.hasChanged(previous, same)).toBe(false);
		expect(service.hasChanged(previous, changed)).toBe(true);
		expect(service.hasChanged(previous, cursorChanged)).toBe(true);
	});
});
