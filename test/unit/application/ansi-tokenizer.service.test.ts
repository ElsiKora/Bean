import { describe, expect, it } from "vitest";
import { AnsiTokenizerService } from "../../../src/application/service/render/ansi-tokenizer.service";

describe("AnsiTokenizerService", () => {
	it("strips CSI/OSC ansi sequences and calculates width", () => {
		const service = new AnsiTokenizerService();
		const ansiText = "\u001B[31mhello\u001B[39m";
		const withOscLink = "\u001B]8;;https://example.com\u0007link\u001B]8;;\u0007";

		expect(service.strip(ansiText)).toBe("hello");
		expect(service.visibleWidth(ansiText)).toBe(5);
		expect(service.strip(withOscLink)).toBe("link");
		expect(service.visibleWidth(withOscLink)).toBe(4);
	});
});
