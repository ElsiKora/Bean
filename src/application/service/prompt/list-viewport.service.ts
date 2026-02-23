const HALF_WINDOW_DIVISOR_CONSTANT: number = 2;

export class ListViewportService {
	public getWindow(input: { cursorIndex: number; optionCount: number; pageSize: number }): { endIndex: number; startIndex: number } {
		if (input.optionCount <= 0) {
			return { endIndex: 0, startIndex: 0 };
		}

		const safePageSize: number = Math.max(input.pageSize, 1);
		const safeCursorIndex: number = Math.min(Math.max(input.cursorIndex, 0), Math.max(input.optionCount - 1, 0));

		if (input.optionCount <= safePageSize) {
			return { endIndex: input.optionCount, startIndex: 0 };
		}

		const halfWindowSize: number = Math.floor(safePageSize / HALF_WINDOW_DIVISOR_CONSTANT);
		let pageStartIndex: number = Math.max(safeCursorIndex - halfWindowSize, 0);
		let pageEndIndex: number = pageStartIndex + safePageSize;

		if (pageEndIndex > input.optionCount) {
			pageEndIndex = input.optionCount;
			pageStartIndex = Math.max(pageEndIndex - safePageSize, 0);
		}

		return { endIndex: pageEndIndex, startIndex: pageStartIndex };
	}
}
