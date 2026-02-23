import type { TGraphemeSegmentType } from "./type/grapheme-segment.type";
import type { TTextBufferStateType } from "./type/text-buffer-state.type";

const GRAPHEME_GRANULARITY_CONSTANT: Intl.SegmenterOptions["granularity"] = "grapheme";

const GRAPHEME_SEGMENTER_CONSTANT: Intl.Segmenter | null = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: GRAPHEME_GRANULARITY_CONSTANT }) : null;
const ZERO_CONSTANT: number = 0;

const clampCursor = (cursorIndex: number, value: string): number => {
	return Math.min(Math.max(cursorIndex, ZERO_CONSTANT), value.length);
};

const isWordCharacter = (character: string): boolean => {
	return /\w/u.test(character);
};

const buildGraphemeSegments = (value: string): Array<TGraphemeSegmentType> => {
	if (GRAPHEME_SEGMENTER_CONSTANT !== null) {
		const segments: Array<TGraphemeSegmentType> = [];
		const segmentedValue: ReturnType<Intl.Segmenter["segment"]> = GRAPHEME_SEGMENTER_CONSTANT.segment(value);

		for (const segment of segmentedValue) {
			segments.push({
				endIndex: segment.index + segment.segment.length,
				startIndex: segment.index,
				value: segment.segment,
			});
		}

		return segments;
	}

	const segments: Array<TGraphemeSegmentType> = [];
	let currentIndex: number = ZERO_CONSTANT;

	for (const codePoint of value) {
		segments.push({
			endIndex: currentIndex + codePoint.length,
			startIndex: currentIndex,
			value: codePoint,
		});
		currentIndex += codePoint.length;
	}

	return segments;
};

const normalizeCursorToLeftBoundary = (input: { cursorIndex: number; segments: ReadonlyArray<TGraphemeSegmentType>; value: string }): number => {
	const clampedCursor: number = clampCursor(input.cursorIndex, input.value);
	let normalizedCursor: number = ZERO_CONSTANT;

	for (const segment of input.segments) {
		if (segment.endIndex > clampedCursor) {
			break;
		}

		normalizedCursor = segment.endIndex;
	}

	return normalizedCursor;
};

const normalizeCursorToRightBoundary = (input: { cursorIndex: number; segments: ReadonlyArray<TGraphemeSegmentType>; value: string }): number => {
	const clampedCursor: number = clampCursor(input.cursorIndex, input.value);

	for (const segment of input.segments) {
		if (segment.endIndex >= clampedCursor) {
			return segment.endIndex;
		}
	}

	return input.value.length;
};

const resolveSegmentEndingAt = (input: { cursorIndex: number; segments: ReadonlyArray<TGraphemeSegmentType> }): TGraphemeSegmentType | undefined => {
	let previousSegment: TGraphemeSegmentType | undefined;

	for (const segment of input.segments) {
		if (segment.endIndex > input.cursorIndex) {
			return previousSegment;
		}

		previousSegment = segment;
	}

	return previousSegment;
};

const resolveSegmentStartingAt = (input: { cursorIndex: number; segments: ReadonlyArray<TGraphemeSegmentType> }): TGraphemeSegmentType | undefined => {
	for (const segment of input.segments) {
		if (segment.startIndex === input.cursorIndex) {
			return segment;
		}
	}

	return undefined;
};

export class TextBufferService {
	public applyBackspace(input: { cursorIndex: number; value: string }): TTextBufferStateType {
		const segments: Array<TGraphemeSegmentType> = buildGraphemeSegments(input.value);

		const cursorIndex: number = normalizeCursorToLeftBoundary({
			cursorIndex: input.cursorIndex,
			segments,
			value: input.value,
		});

		if (cursorIndex <= ZERO_CONSTANT) {
			return { cursorIndex, value: input.value };
		}

		const previousSegment: TGraphemeSegmentType | undefined = resolveSegmentEndingAt({ cursorIndex, segments });

		if (previousSegment === undefined) {
			return { cursorIndex, value: input.value };
		}

		const nextValue: string = `${input.value.slice(ZERO_CONSTANT, previousSegment.startIndex)}${input.value.slice(cursorIndex)}`;

		return { cursorIndex: previousSegment.startIndex, value: nextValue };
	}

	public applyDeleteForward(input: { cursorIndex: number; value: string }): TTextBufferStateType {
		const segments: Array<TGraphemeSegmentType> = buildGraphemeSegments(input.value);

		const cursorIndex: number = normalizeCursorToLeftBoundary({
			cursorIndex: input.cursorIndex,
			segments,
			value: input.value,
		});
		const currentSegment: TGraphemeSegmentType | undefined = resolveSegmentStartingAt({ cursorIndex, segments });

		if (currentSegment === undefined) {
			return { cursorIndex, value: input.value };
		}

		const nextValue: string = `${input.value.slice(ZERO_CONSTANT, cursorIndex)}${input.value.slice(currentSegment.endIndex)}`;

		return { cursorIndex, value: nextValue };
	}

	public applyInsert(input: { cursorIndex: number; value: string; valueToInsert: string }): TTextBufferStateType {
		const segments: Array<TGraphemeSegmentType> = buildGraphemeSegments(input.value);

		const cursorIndex: number = normalizeCursorToLeftBoundary({
			cursorIndex: input.cursorIndex,
			segments,
			value: input.value,
		});
		const nextValue: string = `${input.value.slice(ZERO_CONSTANT, cursorIndex)}${input.valueToInsert}${input.value.slice(cursorIndex)}`;
		const nextSegments: Array<TGraphemeSegmentType> = buildGraphemeSegments(nextValue);

		const nextCursorIndex: number = normalizeCursorToRightBoundary({
			cursorIndex: cursorIndex + input.valueToInsert.length,
			segments: nextSegments,
			value: nextValue,
		});

		return { cursorIndex: nextCursorIndex, value: nextValue };
	}

	public deleteWordBackward(input: { cursorIndex: number; value: string }): TTextBufferStateType {
		const segments: Array<TGraphemeSegmentType> = buildGraphemeSegments(input.value);

		const cursorIndex: number = normalizeCursorToLeftBoundary({
			cursorIndex: input.cursorIndex,
			segments,
			value: input.value,
		});

		if (cursorIndex <= ZERO_CONSTANT) {
			return { cursorIndex, value: input.value };
		}

		let removeStartIndex: number = cursorIndex;

		while (removeStartIndex > ZERO_CONSTANT) {
			const previousSegment: TGraphemeSegmentType | undefined = resolveSegmentEndingAt({
				cursorIndex: removeStartIndex,
				segments,
			});

			if (previousSegment?.value !== " ") {
				break;
			}

			removeStartIndex = previousSegment.startIndex;
		}

		while (removeStartIndex > ZERO_CONSTANT) {
			const previousSegment: TGraphemeSegmentType | undefined = resolveSegmentEndingAt({
				cursorIndex: removeStartIndex,
				segments,
			});

			if (previousSegment === undefined || !isWordCharacter(previousSegment.value)) {
				break;
			}

			removeStartIndex = previousSegment.startIndex;
		}

		const nextValue: string = `${input.value.slice(ZERO_CONSTANT, removeStartIndex)}${input.value.slice(cursorIndex)}`;

		return { cursorIndex: removeStartIndex, value: nextValue };
	}

	public killToEnd(input: { cursorIndex: number; value: string }): TTextBufferStateType {
		const segments: Array<TGraphemeSegmentType> = buildGraphemeSegments(input.value);

		const cursorIndex: number = normalizeCursorToLeftBoundary({
			cursorIndex: input.cursorIndex,
			segments,
			value: input.value,
		});

		return {
			cursorIndex,
			value: input.value.slice(ZERO_CONSTANT, cursorIndex),
		};
	}

	public killToStart(input: { cursorIndex: number; value: string }): TTextBufferStateType {
		const segments: Array<TGraphemeSegmentType> = buildGraphemeSegments(input.value);

		const cursorIndex: number = normalizeCursorToLeftBoundary({
			cursorIndex: input.cursorIndex,
			segments,
			value: input.value,
		});

		return {
			cursorIndex: ZERO_CONSTANT,
			value: input.value.slice(cursorIndex),
		};
	}

	public moveEnd(input: { value: string }): number {
		return input.value.length;
	}

	public moveHome(): number {
		return ZERO_CONSTANT;
	}

	public moveLeft(input: { cursorIndex: number; value: string }): number {
		const segments: Array<TGraphemeSegmentType> = buildGraphemeSegments(input.value);

		const cursorIndex: number = normalizeCursorToLeftBoundary({
			cursorIndex: input.cursorIndex,
			segments,
			value: input.value,
		});
		const previousSegment: TGraphemeSegmentType | undefined = resolveSegmentEndingAt({ cursorIndex, segments });

		return previousSegment?.startIndex ?? ZERO_CONSTANT;
	}

	public moveRight(input: { cursorIndex: number; value: string }): number {
		const segments: Array<TGraphemeSegmentType> = buildGraphemeSegments(input.value);

		const cursorIndex: number = normalizeCursorToLeftBoundary({
			cursorIndex: input.cursorIndex,
			segments,
			value: input.value,
		});
		const currentSegment: TGraphemeSegmentType | undefined = resolveSegmentStartingAt({ cursorIndex, segments });

		return currentSegment?.endIndex ?? input.value.length;
	}

	public moveWordLeft(input: { cursorIndex: number; value: string }): number {
		const segments: Array<TGraphemeSegmentType> = buildGraphemeSegments(input.value);

		const cursorIndex: number = normalizeCursorToLeftBoundary({
			cursorIndex: input.cursorIndex,
			segments,
			value: input.value,
		});

		if (cursorIndex === ZERO_CONSTANT) {
			return ZERO_CONSTANT;
		}

		let index: number = cursorIndex;

		while (index > ZERO_CONSTANT) {
			const previousSegment: TGraphemeSegmentType | undefined = resolveSegmentEndingAt({
				cursorIndex: index,
				segments,
			});

			if (previousSegment?.value !== " ") {
				break;
			}

			index = previousSegment.startIndex;
		}

		while (index > ZERO_CONSTANT) {
			const previousSegment: TGraphemeSegmentType | undefined = resolveSegmentEndingAt({
				cursorIndex: index,
				segments,
			});

			if (previousSegment === undefined || !isWordCharacter(previousSegment.value)) {
				break;
			}

			index = previousSegment.startIndex;
		}

		return index;
	}

	public moveWordRight(input: { cursorIndex: number; value: string }): number {
		const segments: Array<TGraphemeSegmentType> = buildGraphemeSegments(input.value);

		const cursorIndex: number = normalizeCursorToLeftBoundary({
			cursorIndex: input.cursorIndex,
			segments,
			value: input.value,
		});

		if (cursorIndex >= input.value.length) {
			return input.value.length;
		}

		let index: number = cursorIndex;

		while (index < input.value.length) {
			const currentSegment: TGraphemeSegmentType | undefined = resolveSegmentStartingAt({
				cursorIndex: index,
				segments,
			});

			if (currentSegment?.value !== " ") {
				break;
			}

			index = currentSegment.endIndex;
		}

		while (index < input.value.length) {
			const currentSegment: TGraphemeSegmentType | undefined = resolveSegmentStartingAt({
				cursorIndex: index,
				segments,
			});

			if (currentSegment === undefined || !isWordCharacter(currentSegment.value)) {
				break;
			}

			index = currentSegment.endIndex;
		}

		return index;
	}
}
