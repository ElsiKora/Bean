import type { WriteStream } from "node:tty";

import type { IOutputPortInterface } from "@application/interface/port/output-port.interface";
import type { AnsiTokenizerService } from "@application/service/render/ansi-tokenizer.service";
import type { TEnvironmentType } from "@application/type/environment.type";

import { clearLine, cursorTo, moveCursor } from "node:readline";

const DEFAULT_COLUMNS_CONSTANT: number = 80;
const MINIMUM_TERMINAL_COLUMNS_CONSTANT: number = 1;

export class NodeTtyOutputAdapter implements IOutputPortInterface {
	public get COLUMNS(): number {
		return this.STDOUT.columns ?? DEFAULT_COLUMNS_CONSTANT;
	}

	public get IS_TTY(): boolean {
		return this.STDOUT.isTTY;
	}

	public get IS_UNICODE_SUPPORTED(): boolean {
		if (this.ENVIRONMENT.BEAN_FORCE_ASCII === "1") {
			return false;
		}

		if (process.platform !== "win32") {
			return true;
		}

		return this.ENVIRONMENT.WT_SESSION !== undefined || this.ENVIRONMENT.TERM_PROGRAM === "vscode";
	}

	private readonly ANSI_TOKENIZER_SERVICE: AnsiTokenizerService;

	private readonly ENVIRONMENT: TEnvironmentType;

	private readonly EXTERNAL_WRITE_LISTENERS: Set<() => void>;

	private frameLineCount: number;

	private readonly STDOUT: WriteStream;

	public constructor(input: { ansiTokenizerService: AnsiTokenizerService; environment?: TEnvironmentType; stdout?: WriteStream }) {
		this.STDOUT = input.stdout ?? process.stdout;
		this.ENVIRONMENT = input.environment ?? (process.env as Record<string, string | undefined>);
		this.frameLineCount = 0;
		this.EXTERNAL_WRITE_LISTENERS = new Set<() => void>();
		this.ANSI_TOKENIZER_SERVICE = input.ansiTokenizerService;
	}

	public clearLine(): void {
		clearLine(this.STDOUT, 0);
	}

	public hideCursor(): void {
		this.STDOUT.write("\u001B[?25l");
	}

	public moveCursorToLineStart(): void {
		cursorTo(this.STDOUT, 0);
	}

	public onExternalWrite(listener: () => void): () => void {
		this.EXTERNAL_WRITE_LISTENERS.add(listener);

		return () => {
			this.EXTERNAL_WRITE_LISTENERS.delete(listener);
		};
	}

	public showCursor(): void {
		this.STDOUT.write("\u001B[?25h");
	}

	public write(text: string): void {
		this.clearFrame();
		this.STDOUT.write(text);
		this.emitExternalWrite();
	}

	public writeFrame(text: string): void {
		this.clearFrame();
		const frameLines: Array<string> = text.split("\n");
		this.STDOUT.write(text);
		this.frameLineCount = this.getVisualLineCount(frameLines);
	}

	public writeLine(text: string): void {
		this.clearFrame();
		this.STDOUT.write(`${text}\n`);
		this.emitExternalWrite();
	}

	private clearFrame(): void {
		if (this.frameLineCount === 0) {
			return;
		}

		this.moveCursorToLineStart();

		let lineIndex: number = 0;

		while (lineIndex < this.frameLineCount) {
			this.clearLine();

			if (lineIndex < this.frameLineCount - 1) {
				moveCursor(this.STDOUT, 0, -1);
			}

			lineIndex += 1;
		}
		this.moveCursorToLineStart();
		this.frameLineCount = 0;
	}

	private emitExternalWrite(): void {
		for (const listener of this.EXTERNAL_WRITE_LISTENERS) {
			listener();
		}
	}

	private getLineWrapCount(line: string): number {
		const visibleWidth: number = this.ANSI_TOKENIZER_SERVICE.visibleWidth(line);
		const columns: number = Math.max(this.COLUMNS, MINIMUM_TERMINAL_COLUMNS_CONSTANT);

		return Math.max(Math.ceil(Math.max(visibleWidth, 1) / columns), 1);
	}

	private getVisualLineCount(lines: ReadonlyArray<string>): number {
		return lines.reduce((total: number, line: string): number => total + this.getLineWrapCount(line), 0);
	}
}
