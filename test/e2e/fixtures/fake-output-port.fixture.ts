import type { IOutputPortInterface } from "../../../src/application/interface/port/output-port.interface";

type TFakeOutputPortFixtureArgsType = {
	isTTY?: boolean;
	columns?: number;
	supportsUnicode?: boolean;
};

export class FakeOutputPortFixture implements IOutputPortInterface {
	public get COLUMNS(): number {
		return this.columns;
	}

	public get IS_TTY(): boolean {
		return this.isTTY;
	}

	public get IS_UNICODE_SUPPORTED(): boolean {
		return this.supportsUnicode;
	}

	public readonly isTTY: boolean;

	public readonly columns: number;

	public readonly supportsUnicode: boolean;

	public readonly writes: string[];

	public readonly lines: string[];

	public readonly frames: string[];

	public cursorHidden: boolean;

	private readonly listeners: Set<() => void>;

	public constructor(args: TFakeOutputPortFixtureArgsType = {}) {
		this.isTTY = args.isTTY ?? true;
		this.columns = args.columns ?? 80;
		this.supportsUnicode = args.supportsUnicode ?? true;
		this.writes = [];
		this.lines = [];
		this.frames = [];
		this.cursorHidden = false;
		this.listeners = new Set<() => void>();
	}

	public write(text: string): void {
		this.writes.push(text);
		this.emitExternalWrite();
	}

	public writeLine(text: string): void {
		this.lines.push(text);
		this.emitExternalWrite();
	}

	public writeFrame(text: string): void {
		this.frames.push(text);
	}

	public clearLine(): void {
		this.writes.push("[clear-line]");
	}

	public moveCursorToLineStart(): void {
		this.writes.push("[cursor-start]");
	}

	public hideCursor(): void {
		this.cursorHidden = true;
	}

	public showCursor(): void {
		this.cursorHidden = false;
	}

	public onExternalWrite(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private emitExternalWrite(): void {
		for (const listener of this.listeners) {
			listener();
		}
	}
}
