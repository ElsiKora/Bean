import { describe, expect, it } from "vitest";

import { BeanImageRendererService } from "../../../src/presentation/bean/service/bean-image-renderer.service";

describe("BeanImageRendererService", () => {
	it("returns empty text for empty image input", () => {
		const service: BeanImageRendererService = new BeanImageRendererService();

		expect(
			service.render({
				isUnicodeSupported: true,
				maxWidth: 10,
				pixels: [],
			}),
		).toBe("");
	});

	it("renders unicode and ascii fallback rasters", () => {
		const service: BeanImageRendererService = new BeanImageRendererService();
		const pixels: Array<Array<{ b: number; g: number; r: number }>> = [
			[
				{ b: 255, g: 255, r: 255 },
				{ b: 255, g: 255, r: 255 },
				{ b: 255, g: 255, r: 255 },
				{ b: 255, g: 255, r: 255 },
			],
			[
				{ b: 255, g: 255, r: 255 },
				{ b: 255, g: 255, r: 255 },
				{ b: 255, g: 255, r: 255 },
				{ b: 255, g: 255, r: 255 },
			],
			[
				{ b: 255, g: 255, r: 255 },
				{ b: 255, g: 255, r: 255 },
				{ b: 255, g: 255, r: 255 },
				{ b: 255, g: 255, r: 255 },
			],
			[
				{ b: 255, g: 255, r: 255 },
				{ b: 255, g: 255, r: 255 },
				{ b: 255, g: 255, r: 255 },
				{ b: 255, g: 255, r: 255 },
			],
		];

		const unicodeRendered: string = service.render({
			isUnicodeSupported: true,
			maxWidth: 4,
			pixels,
		});
		const asciiRendered: string = service.render({
			isUnicodeSupported: false,
			maxWidth: 4,
			pixels,
		});

		expect(unicodeRendered).toBe("████\n████");
		expect(asciiRendered).toBe("@@@@\n@@@@");
	});
});
