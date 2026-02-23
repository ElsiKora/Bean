export class CursorPositionValueObject {
	public get column(): number {
		return this.COLUMN;
	}

	public get row(): number {
		return this.ROW;
	}

	private readonly COLUMN: number;

	private readonly ROW: number;

	public constructor(row: number, column: number) {
		this.ROW = row;
		this.COLUMN = column;
	}

	public withColumn(column: number): CursorPositionValueObject {
		return new CursorPositionValueObject(this.ROW, column);
	}

	public withRow(row: number): CursorPositionValueObject {
		return new CursorPositionValueObject(row, this.COLUMN);
	}
}
