import { CursorPositionValueObject } from "../value-object/cursor-position.value-object";

export class RenderFrameEntity {
	public readonly CURSOR: CursorPositionValueObject;

	public readonly LINES: ReadonlyArray<string>;

	public constructor(input: { cursor?: CursorPositionValueObject; lines: ReadonlyArray<string> }) {
		this.LINES = input.lines;
		this.CURSOR = input.cursor ?? new CursorPositionValueObject(0, 0);
	}

	public toText(): string {
		return this.LINES.join("\n");
	}
}
