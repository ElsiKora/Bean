export interface IOutputPortInterface {
	clearLine(): void;
	COLUMNS: number;
	hideCursor(): void;

	IS_TTY: boolean;

	IS_UNICODE_SUPPORTED: boolean;

	moveCursorToLineStart(): void;

	onExternalWrite(listener: () => void): () => void;

	showCursor(): void;

	write(text: string): void;

	writeFrame(text: string): void;

	writeLine(text: string): void;
}
