import { describe, expect, it } from "vitest";
import { AnsiTokenizerService } from "../../../src/application/service/render/ansi-tokenizer.service";
import { ONE_CONSTANT, ZERO_CONSTANT } from "../../../src/presentation/bean/constant";
import { BeanTableRendererService } from "../../../src/presentation/bean/service/bean-table-renderer.service";

const HEADER_LINE_INDEX_CONSTANT: number = ONE_CONSTANT;
const FIRST_ROW_INDEX_CONSTANT: number = 3;
const SECOND_ROW_INDEX_CONSTANT: number = 4;

describe("BeanTableRendererService", () => {
	it("aligns ANSI-decorated cells by visible width", () => {
		const ansiTokenizerService = new AnsiTokenizerService();
		const service = new BeanTableRendererService({
			ansiTokenizerService,
		});

		const rendered: string = service.render({
			columns: ["name", "value"],
			rows: [
				["\u001B[31mRed\u001B[39m", "1"],
				["Blue", "22"],
			],
		});
		const lines: Array<string> = rendered.split("\n");
		const firstRow: string = lines[FIRST_ROW_INDEX_CONSTANT] ?? "";
		const secondRow: string = lines[SECOND_ROW_INDEX_CONSTANT] ?? "";
		const header: string = lines[HEADER_LINE_INDEX_CONSTANT] ?? "";

		expect(lines.length).toBeGreaterThan(ZERO_CONSTANT);
		expect(header).toContain("name");
		expect(firstRow).toContain("\u001B[31mRed\u001B[39m");
		expect(ansiTokenizerService.visibleWidth(firstRow)).toBe(ansiTokenizerService.visibleWidth(secondRow));
	});
});
