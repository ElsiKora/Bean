import { describe, expect, it } from "vitest";
import { EAnsiColorEnum } from "../../../src/domain/enum/ansi-color.enum";
import { EAnsiStyleEnum } from "../../../src/domain/enum/ansi-style.enum";
import { AnsiRendererAdapter } from "../../../src/infrastructure/adapter/render/ansi-renderer.adapter";

describe("AnsiRendererAdapter", () => {
	it("reopens outer token when close token appears inside text", () => {
		const renderer = new AnsiRendererAdapter({
			isTTY: true,
			environment: {},
		});

		const result = renderer.format(`A\u001B[39mB`, [EAnsiColorEnum.RED]);
		expect(result).toContain("\u001B[31mA\u001B[39m\u001B[31mB\u001B[39m");
	});

	it("respects NO_COLOR gate", () => {
		const renderer = new AnsiRendererAdapter({
			isTTY: true,
			environment: { NO_COLOR: "1" },
		});

		const result = renderer.format("text", [EAnsiStyleEnum.BOLD, EAnsiColorEnum.GREEN]);
		expect(result).toBe("text");
	});

	it("enables with FORCE_COLOR even when TERM is dumb", () => {
		const renderer = new AnsiRendererAdapter({
			isTTY: false,
			environment: { FORCE_COLOR: "1", TERM: "dumb" },
		});

		const result = renderer.format("forced", [EAnsiColorEnum.GREEN]);
		expect(result).toContain("\u001B[32m");
	});
});
