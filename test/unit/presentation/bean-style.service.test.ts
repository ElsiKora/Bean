import { describe, expect, it } from "vitest";
import { BRIGHT_RED_CODE_CONSTANT, COLOR_CHANNEL_MAX_CONSTANT, COLOR_LEVEL_16M_CONSTANT, COLOR_LEVEL_256_CONSTANT, COLOR_LEVEL_BASIC_CONSTANT, COLOR_LEVEL_NONE_CONSTANT, ONE_CONSTANT } from "../../../src/presentation/bean/constant";
import { BeanStyleService } from "../../../src/presentation/bean/service/bean-style.service";

describe("BeanStyleService", () => {
	it("resolves color level from environment capabilities", () => {
		const service = new BeanStyleService();

		expect(
			service.resolveColorLevel({
				environment: { NO_COLOR: "1" },
				isTTY: true,
			}),
		).toBe(COLOR_LEVEL_NONE_CONSTANT);
		expect(
			service.resolveColorLevel({
				environment: { TERM: "xterm-256color" },
				isTTY: true,
			}),
		).toBe(COLOR_LEVEL_256_CONSTANT);
		expect(
			service.resolveColorLevel({
				environment: { COLORTERM: "truecolor" },
				isTTY: true,
			}),
		).toBe(COLOR_LEVEL_16M_CONSTANT);
	});

	it("returns plain text when colors are disabled", () => {
		const service = new BeanStyleService();

		expect(
			service.style({
				color: "#ff0000",
				colorLevel: COLOR_LEVEL_NONE_CONSTANT,
				isBold: true,
				text: "plain",
			}),
		).toBe("plain");
	});

	it("renders advanced style tokens with non-reset closes", () => {
		const service = new BeanStyleService();
		const rendered: string = service.style({
			background: COLOR_CHANNEL_MAX_CONSTANT,
			color: "#f0a",
			colorLevel: COLOR_LEVEL_16M_CONSTANT,
			isBold: true,
			isDim: true,
			isHidden: true,
			isInverse: true,
			isItalic: true,
			isOverline: true,
			isStrikethrough: true,
			isUnderline: true,
			text: "styled",
		});

		expect(rendered).toContain("38;2;255;0;170");
		expect(rendered).toContain(`48;5;${String(COLOR_CHANNEL_MAX_CONSTANT)}`);
		expect(rendered).not.toContain("\u001B[0m");
		expect((rendered.match(/22/g) ?? []).length).toBe(ONE_CONSTANT);
	});

	it("gates bright styling by color level", () => {
		const service = new BeanStyleService();

		expect(
			service.styleBright({
				color: "red",
				colorLevel: COLOR_LEVEL_NONE_CONSTANT,
				text: "x",
			}),
		).toBe("x");

		expect(
			service.styleBright({
				color: "red",
				colorLevel: COLOR_LEVEL_BASIC_CONSTANT,
				text: "x",
			}),
		).toContain(`[${String(BRIGHT_RED_CODE_CONSTANT)}m`);
	});

	it("downgrades truecolor input to 256/basic levels", () => {
		const service = new BeanStyleService();
		const colorHex = "#f0a";
		const downgradedTo256: string = service.style({
			color: colorHex,
			colorLevel: COLOR_LEVEL_256_CONSTANT,
			text: "value",
		});
		const downgradedToBasic: string = service.style({
			color: colorHex,
			colorLevel: COLOR_LEVEL_BASIC_CONSTANT,
			text: "value",
		});
		const namedBasic: string = service.style({
			color: "red",
			colorLevel: COLOR_LEVEL_BASIC_CONSTANT,
			text: "value",
		});

		expect(downgradedTo256).toContain("38;5;");
		expect(downgradedTo256).not.toContain("38;2;");
		expect(downgradedToBasic).not.toContain("38;2;");
		expect(downgradedToBasic).not.toContain("38;5;");
		expect(namedBasic).toContain("[31m");
	});

	it("reopens styles when nested text contains close tokens", () => {
		const service = new BeanStyleService();
		const nestedText: string = `first\u001B[39msecond`;
		const rendered: string = service.style({
			color: "red",
			colorLevel: COLOR_LEVEL_BASIC_CONSTANT,
			text: nestedText,
		});

		expect(rendered).toContain("\u001B[39m\u001B[31m");
	});

	it("renders grapheme-safe gradient output", () => {
		const service = new BeanStyleService();
		const rendered: string = service.gradient({
			colorLevel: COLOR_LEVEL_16M_CONSTANT,
			from: "#000000",
			text: "A🙂",
			to: "#ffffff",
		});

		expect(rendered).toContain("\u001B[38;2;0;0;0mA");
		expect(rendered).toContain("\u001B[38;2;255;255;255m🙂");
	});
});
