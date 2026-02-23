import type { IOutputPortInterface } from "../../interface/port/output-port.interface";
import type { IThemePortInterface } from "../../interface/port/theme-port.interface";
import type { AnsiTokenizerService } from "../../service/render/ansi-tokenizer.service";

const NOTE_SIDE_PADDING_CONSTANT: number = 2;

export class ShowNoteUseCase {
	private readonly ANSI_TOKENIZER_SERVICE: AnsiTokenizerService;

	private readonly OUTPUT_PORT: IOutputPortInterface;

	private readonly THEME_PORT: IThemePortInterface;

	public constructor(input: { ansiTokenizerService: AnsiTokenizerService; outputPort: IOutputPortInterface; themePort: IThemePortInterface }) {
		this.ANSI_TOKENIZER_SERVICE = input.ansiTokenizerService;
		this.OUTPUT_PORT = input.outputPort;
		this.THEME_PORT = input.themePort;
	}

	public execute(input: { message: string; title: string }): void {
		const lines: Array<string> = input.message.split("\n");
		const contentWidth: number = Math.max(this.ANSI_TOKENIZER_SERVICE.visibleWidth(input.title), ...lines.map((line: string): number => this.ANSI_TOKENIZER_SERVICE.visibleWidth(line)));
		const horizontal: string = "─".repeat(contentWidth + NOTE_SIDE_PADDING_CONSTANT);
		const paddedTitle: string = this.padByVisibleWidth(input.title, contentWidth);

		this.OUTPUT_PORT.writeLine(this.THEME_PORT.muted(`┌${horizontal}┐`));
		this.OUTPUT_PORT.writeLine(`${this.THEME_PORT.muted("│")} ${this.THEME_PORT.accent(paddedTitle)} ${this.THEME_PORT.muted("│")}`);
		this.OUTPUT_PORT.writeLine(this.THEME_PORT.muted(`├${horizontal}┤`));

		for (const line of lines) {
			const paddedLine: string = this.padByVisibleWidth(line, contentWidth);
			this.OUTPUT_PORT.writeLine(`${this.THEME_PORT.muted("│")} ${paddedLine} ${this.THEME_PORT.muted("│")}`);
		}
		this.OUTPUT_PORT.writeLine(this.THEME_PORT.muted(`└${horizontal}┘`));
	}

	private padByVisibleWidth(value: string, targetWidth: number): string {
		const width: number = this.ANSI_TOKENIZER_SERVICE.visibleWidth(value);
		const paddingLength: number = Math.max(targetWidth - width, 0);

		return `${value}${" ".repeat(paddingLength)}`;
	}
}
