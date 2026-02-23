import type { AnsiTokenizerService } from "@application/service/render/ansi-tokenizer.service";

import type { TBeanTableInputType } from "../type";

import { TABLE_CELL_PADDING_CONSTANT } from "../constant";

export class BeanTableRendererService {
	private readonly ANSI_TOKENIZER_SERVICE: AnsiTokenizerService;

	public constructor(input: { ansiTokenizerService: AnsiTokenizerService }) {
		this.ANSI_TOKENIZER_SERVICE = input.ansiTokenizerService;
	}

	public render(input: TBeanTableInputType): string {
		const widths: Array<number> = input.columns.map((column: string, columnIndex: number): number => {
			return Math.max(this.ANSI_TOKENIZER_SERVICE.visibleWidth(column), ...input.rows.map((row: ReadonlyArray<string>): number => this.ANSI_TOKENIZER_SERVICE.visibleWidth(row[columnIndex] ?? "")));
		});

		const separator: string = `+${widths.map((width: number): string => "-".repeat(width + TABLE_CELL_PADDING_CONSTANT)).join("+")}+`;
		const header: string = `| ${input.columns.map((column: string, index: number): string => this.padCell(column, widths[index] ?? column.length)).join(" | ")} |`;

		const rowLines: Array<string> = input.rows.map((row: ReadonlyArray<string>): string => {
			return `| ${row.map((cell: string, index: number): string => this.padCell(cell, widths[index] ?? this.ANSI_TOKENIZER_SERVICE.visibleWidth(cell))).join(" | ")} |`;
		});

		return [separator, header, separator, ...rowLines, separator].join("\n");
	}

	private padCell(text: string, width: number): string {
		const visibleWidth: number = this.ANSI_TOKENIZER_SERVICE.visibleWidth(text);

		if (visibleWidth >= width) {
			return text;
		}

		return `${text}${" ".repeat(width - visibleWidth)}`;
	}
}
