import type { TIntlSegmenterConstructorType } from "./type/intl-segmenter-constructor.type";

const BEL_CHARACTER_CODE_CONSTANT: number = 7;
const CSI_FINAL_BYTE_END_CHARACTER_CODE_CONSTANT: number = 126;
const CSI_FINAL_BYTE_START_CHARACTER_CODE_CONSTANT: number = 64;
const ESC_CHARACTER_CODE_CONSTANT: number = 27;
const ESC_SEQUENCE_PREFIX_LENGTH_CONSTANT: number = 2;
const FULLWIDTH_CODE_POINT_START_CONSTANT: number = 4352;
const FULLWIDTH_HANGUL_JAMO_END_CONSTANT: number = 4447;
const FULLWIDTH_LEFT_ANGLE_BRACKET_CONSTANT: number = 9001;
const FULLWIDTH_RIGHT_ANGLE_BRACKET_CONSTANT: number = 9002;
const FULLWIDTH_CJK_RADICALS_START_CONSTANT: number = 11_904;
const FULLWIDTH_CJK_RADICALS_END_CONSTANT: number = 12_871;
const FULLWIDTH_YI_START_CONSTANT: number = 13_056;
const FULLWIDTH_YI_END_CONSTANT: number = 19_893;
const FULLWIDTH_HANGUL_JAMO_EXT_A_START_CONSTANT: number = 43_360;
const FULLWIDTH_HANGUL_JAMO_EXT_A_END_CONSTANT: number = 43_388;
const FULLWIDTH_HANGUL_SYLLABLES_START_CONSTANT: number = 44_032;
const FULLWIDTH_HANGUL_SYLLABLES_END_CONSTANT: number = 55_203;
const FULLWIDTH_CJK_COMPATIBILITY_IDEOGRAPHS_START_CONSTANT: number = 63_744;
const FULLWIDTH_CJK_COMPATIBILITY_IDEOGRAPHS_END_CONSTANT: number = 64_255;
const FULLWIDTH_VERTICAL_FORMS_START_CONSTANT: number = 65_040;
const FULLWIDTH_VERTICAL_FORMS_END_CONSTANT: number = 65_049;
const FULLWIDTH_CJK_COMPATIBILITY_FORMS_START_CONSTANT: number = 65_072;
const FULLWIDTH_CJK_COMPATIBILITY_FORMS_END_CONSTANT: number = 65_131;
const FULLWIDTH_FULLWIDTH_FORMS_START_CONSTANT: number = 65_281;
const FULLWIDTH_FULLWIDTH_FORMS_END_CONSTANT: number = 65_376;
const FULLWIDTH_FULLWIDTH_SYMBOLS_START_CONSTANT: number = 65_504;
const FULLWIDTH_FULLWIDTH_SYMBOLS_END_CONSTANT: number = 65_510;
const FULLWIDTH_KANA_SUPPLEMENT_START_CONSTANT: number = 127_488;
const FULLWIDTH_KANA_SUPPLEMENT_END_CONSTANT: number = 127_489;
const FULLWIDTH_CJK_ENCLOSED_START_CONSTANT: number = 127_744;
const FULLWIDTH_CJK_ENCLOSED_END_CONSTANT: number = 127_985;
const FULLWIDTH_SUPPLEMENTARY_IDEOGRAPHIC_START_CONSTANT: number = 131_072;
const FULLWIDTH_SUPPLEMENTARY_IDEOGRAPHIC_END_CONSTANT: number = 262_141;
const FULLWIDTH_TERTIARY_IDEOGRAPHIC_START_CONSTANT: number = 196_608;
const FULLWIDTH_TERTIARY_IDEOGRAPHIC_END_CONSTANT: number = 262_141;
const MIN_CONTROL_CODE_POINT_CONSTANT: number = 31;
const NEXT_CHARACTER_OFFSET_CONSTANT: number = 1;
const NULL_CODE_POINT_CONSTANT: number = 0;
const MAX_BASIC_MULTILINGUAL_PLANE_CODE_POINT_CONSTANT: number = 65_535;
const MULTI_UNIT_CODE_POINT_LENGTH_CONSTANT: number = 2;
const COMBINING_DIACRITICS_START_CONSTANT: number = 768;
const COMBINING_DIACRITICS_END_CONSTANT: number = 879;
const COMBINING_EXTENDED_START_CONSTANT: number = 6832;
const COMBINING_EXTENDED_END_CONSTANT: number = 6911;
const COMBINING_SUPPLEMENT_START_CONSTANT: number = 7616;
const COMBINING_SUPPLEMENT_END_CONSTANT: number = 7679;
const COMBINING_SYMBOLS_START_CONSTANT: number = 8400;
const COMBINING_SYMBOLS_END_CONSTANT: number = 8447;
const COMBINING_HALF_MARKS_START_CONSTANT: number = 65_056;
const COMBINING_HALF_MARKS_END_CONSTANT: number = 65_071;
const VARIATION_SELECTORS_START_CONSTANT: number = 65_024;
const VARIATION_SELECTORS_END_CONSTANT: number = 65_039;
const VARIATION_SELECTORS_SUPPLEMENT_START_CONSTANT: number = 917_760;
const VARIATION_SELECTORS_SUPPLEMENT_END_CONSTANT: number = 917_999;
const ZERO_WIDTH_JOINER_CODE_POINT_CONSTANT: number = 8205;
const ZERO_WIDTH_NON_JOINER_CODE_POINT_CONSTANT: number = 8204;
const DEL_CONTROL_CODE_POINT_CONSTANT: number = 127;
const DEL_CONTROL_END_CODE_POINT_CONSTANT: number = 159;
const REGIONAL_INDICATOR_START_CONSTANT: number = 127_462;
const REGIONAL_INDICATOR_END_CONSTANT: number = 127_487;
const EMOJI_MISC_SYMBOLS_START_CONSTANT: number = 9728;
const EMOJI_MISC_SYMBOLS_END_CONSTANT: number = 9983;
const EMOJI_DINGBATS_START_CONSTANT: number = 9984;
const EMOJI_DINGBATS_END_CONSTANT: number = 10_175;
const EMOJI_SUPPLEMENTAL_START_CONSTANT: number = 127_744;
const EMOJI_SUPPLEMENTAL_END_CONSTANT: number = 129_791;
const GRAPHEME_GRANULARITY_CONSTANT: "grapheme" = "grapheme" as const;
const DOUBLE_WIDTH_CHARACTER_CONSTANT: number = 2;
const SINGLE_WIDTH_CHARACTER_CONSTANT: number = 1;
const OSC_PREFIX_CHARACTER_CONSTANT: string = "]";
const SINGLE_CHAR_ESCAPE_END_CHARACTER_CODE_CONSTANT: number = 95;
const SINGLE_CHAR_ESCAPE_START_CHARACTER_CODE_CONSTANT: number = 64;
const SLASH_CHARACTER_CONSTANT: string = "\\";
const SQUARE_BRACKET_CHARACTER_CONSTANT: string = "[";
const ZERO_WIDTH_JOINER_CHARACTER_CONSTANT: string = "\u200D";

const isInRange = (input: { end: number; start: number; value: number }): boolean => {
	return input.value >= input.start && input.value <= input.end;
};

const resolveCodeUnitLength = (codePoint: number): number => {
	return codePoint > MAX_BASIC_MULTILINGUAL_PLANE_CODE_POINT_CONSTANT ? MULTI_UNIT_CODE_POINT_LENGTH_CONSTANT : NEXT_CHARACTER_OFFSET_CONSTANT;
};

const isCombiningCodePoint = (codePoint: number): boolean => {
	return (
		isInRange({
			end: COMBINING_DIACRITICS_END_CONSTANT,
			start: COMBINING_DIACRITICS_START_CONSTANT,
			value: codePoint,
		}) ||
		isInRange({
			end: COMBINING_EXTENDED_END_CONSTANT,
			start: COMBINING_EXTENDED_START_CONSTANT,
			value: codePoint,
		}) ||
		isInRange({
			end: COMBINING_SUPPLEMENT_END_CONSTANT,
			start: COMBINING_SUPPLEMENT_START_CONSTANT,
			value: codePoint,
		}) ||
		isInRange({
			end: COMBINING_SYMBOLS_END_CONSTANT,
			start: COMBINING_SYMBOLS_START_CONSTANT,
			value: codePoint,
		}) ||
		isInRange({
			end: COMBINING_HALF_MARKS_END_CONSTANT,
			start: COMBINING_HALF_MARKS_START_CONSTANT,
			value: codePoint,
		}) ||
		isInRange({
			end: VARIATION_SELECTORS_END_CONSTANT,
			start: VARIATION_SELECTORS_START_CONSTANT,
			value: codePoint,
		}) ||
		isInRange({
			end: VARIATION_SELECTORS_SUPPLEMENT_END_CONSTANT,
			start: VARIATION_SELECTORS_SUPPLEMENT_START_CONSTANT,
			value: codePoint,
		}) ||
		codePoint === ZERO_WIDTH_JOINER_CODE_POINT_CONSTANT ||
		codePoint === ZERO_WIDTH_NON_JOINER_CODE_POINT_CONSTANT
	);
};

const isControlCodePoint = (codePoint: number): boolean => {
	return (codePoint >= NULL_CODE_POINT_CONSTANT && codePoint <= MIN_CONTROL_CODE_POINT_CONSTANT) || (codePoint >= DEL_CONTROL_CODE_POINT_CONSTANT && codePoint <= DEL_CONTROL_END_CODE_POINT_CONSTANT);
};

const isEmojiCodePoint = (codePoint: number): boolean => {
	return (
		isInRange({
			end: EMOJI_MISC_SYMBOLS_END_CONSTANT,
			start: EMOJI_MISC_SYMBOLS_START_CONSTANT,
			value: codePoint,
		}) ||
		isInRange({
			end: EMOJI_DINGBATS_END_CONSTANT,
			start: EMOJI_DINGBATS_START_CONSTANT,
			value: codePoint,
		}) ||
		isInRange({
			end: EMOJI_SUPPLEMENTAL_END_CONSTANT,
			start: EMOJI_SUPPLEMENTAL_START_CONSTANT,
			value: codePoint,
		}) ||
		isInRange({
			end: REGIONAL_INDICATOR_END_CONSTANT,
			start: REGIONAL_INDICATOR_START_CONSTANT,
			value: codePoint,
		})
	);
};

const isFullWidthCodePoint = (codePoint: number): boolean => {
	return (
		codePoint >= FULLWIDTH_CODE_POINT_START_CONSTANT &&
		(codePoint <= FULLWIDTH_HANGUL_JAMO_END_CONSTANT ||
			codePoint === FULLWIDTH_LEFT_ANGLE_BRACKET_CONSTANT ||
			codePoint === FULLWIDTH_RIGHT_ANGLE_BRACKET_CONSTANT ||
			isInRange({
				end: FULLWIDTH_CJK_RADICALS_END_CONSTANT,
				start: FULLWIDTH_CJK_RADICALS_START_CONSTANT,
				value: codePoint,
			}) ||
			isInRange({
				end: FULLWIDTH_YI_END_CONSTANT,
				start: FULLWIDTH_YI_START_CONSTANT,
				value: codePoint,
			}) ||
			isInRange({
				end: FULLWIDTH_HANGUL_JAMO_EXT_A_END_CONSTANT,
				start: FULLWIDTH_HANGUL_JAMO_EXT_A_START_CONSTANT,
				value: codePoint,
			}) ||
			isInRange({
				end: FULLWIDTH_HANGUL_SYLLABLES_END_CONSTANT,
				start: FULLWIDTH_HANGUL_SYLLABLES_START_CONSTANT,
				value: codePoint,
			}) ||
			isInRange({
				end: FULLWIDTH_CJK_COMPATIBILITY_IDEOGRAPHS_END_CONSTANT,
				start: FULLWIDTH_CJK_COMPATIBILITY_IDEOGRAPHS_START_CONSTANT,
				value: codePoint,
			}) ||
			isInRange({
				end: FULLWIDTH_VERTICAL_FORMS_END_CONSTANT,
				start: FULLWIDTH_VERTICAL_FORMS_START_CONSTANT,
				value: codePoint,
			}) ||
			isInRange({
				end: FULLWIDTH_CJK_COMPATIBILITY_FORMS_END_CONSTANT,
				start: FULLWIDTH_CJK_COMPATIBILITY_FORMS_START_CONSTANT,
				value: codePoint,
			}) ||
			isInRange({
				end: FULLWIDTH_FULLWIDTH_FORMS_END_CONSTANT,
				start: FULLWIDTH_FULLWIDTH_FORMS_START_CONSTANT,
				value: codePoint,
			}) ||
			isInRange({
				end: FULLWIDTH_FULLWIDTH_SYMBOLS_END_CONSTANT,
				start: FULLWIDTH_FULLWIDTH_SYMBOLS_START_CONSTANT,
				value: codePoint,
			}) ||
			isInRange({
				end: FULLWIDTH_KANA_SUPPLEMENT_END_CONSTANT,
				start: FULLWIDTH_KANA_SUPPLEMENT_START_CONSTANT,
				value: codePoint,
			}) ||
			isInRange({
				end: FULLWIDTH_CJK_ENCLOSED_END_CONSTANT,
				start: FULLWIDTH_CJK_ENCLOSED_START_CONSTANT,
				value: codePoint,
			}) ||
			isInRange({
				end: FULLWIDTH_SUPPLEMENTARY_IDEOGRAPHIC_END_CONSTANT,
				start: FULLWIDTH_SUPPLEMENTARY_IDEOGRAPHIC_START_CONSTANT,
				value: codePoint,
			}) ||
			isInRange({
				end: FULLWIDTH_TERTIARY_IDEOGRAPHIC_END_CONSTANT,
				start: FULLWIDTH_TERTIARY_IDEOGRAPHIC_START_CONSTANT,
				value: codePoint,
			}))
	);
};

const resolveSegmenterConstructor = (): null | TIntlSegmenterConstructorType => {
	const maybeIntl: { Segmenter?: TIntlSegmenterConstructorType } = Intl as unknown as { Segmenter?: TIntlSegmenterConstructorType };

	return maybeIntl.Segmenter ?? null;
};

export class AnsiTokenizerService {
	public strip(text: string): string {
		let result: string = "";
		let index: number = 0;

		while (index < text.length) {
			const characterCode: number = text.codePointAt(index) ?? NULL_CODE_POINT_CONSTANT;

			if (characterCode !== ESC_CHARACTER_CODE_CONSTANT) {
				result += String.fromCodePoint(characterCode);
				index += resolveCodeUnitLength(characterCode);

				continue;
			}

			const nextCharacter: string = text[index + NEXT_CHARACTER_OFFSET_CONSTANT] ?? "";

			if (nextCharacter === SQUARE_BRACKET_CHARACTER_CONSTANT) {
				index += ESC_SEQUENCE_PREFIX_LENGTH_CONSTANT;

				while (index < text.length) {
					const codePoint: number = text.codePointAt(index) ?? NULL_CODE_POINT_CONSTANT;
					index += resolveCodeUnitLength(codePoint);

					if (codePoint >= CSI_FINAL_BYTE_START_CHARACTER_CODE_CONSTANT && codePoint <= CSI_FINAL_BYTE_END_CHARACTER_CODE_CONSTANT) {
						break;
					}
				}

				continue;
			}

			if (nextCharacter === OSC_PREFIX_CHARACTER_CONSTANT) {
				index += ESC_SEQUENCE_PREFIX_LENGTH_CONSTANT;

				while (index < text.length) {
					const codePoint: number = text.codePointAt(index) ?? NULL_CODE_POINT_CONSTANT;

					if (codePoint === BEL_CHARACTER_CODE_CONSTANT) {
						index += NEXT_CHARACTER_OFFSET_CONSTANT;

						break;
					}

					if (codePoint === ESC_CHARACTER_CODE_CONSTANT && (text[index + NEXT_CHARACTER_OFFSET_CONSTANT] ?? "") === SLASH_CHARACTER_CONSTANT) {
						index += ESC_SEQUENCE_PREFIX_LENGTH_CONSTANT;

						break;
					}

					index += resolveCodeUnitLength(codePoint);
				}

				continue;
			}

			if (nextCharacter.length > 0) {
				const codePoint: number = nextCharacter.codePointAt(0) ?? NULL_CODE_POINT_CONSTANT;

				if (codePoint >= SINGLE_CHAR_ESCAPE_START_CHARACTER_CODE_CONSTANT && codePoint <= SINGLE_CHAR_ESCAPE_END_CHARACTER_CODE_CONSTANT) {
					index += ESC_SEQUENCE_PREFIX_LENGTH_CONSTANT;

					continue;
				}
			}

			index += NEXT_CHARACTER_OFFSET_CONSTANT;
		}

		return result;
	}

	public visibleWidth(text: string): number {
		const strippedText: string = this.strip(text);
		const graphemeSegments: ReadonlyArray<string> = this.segmentGraphemes(strippedText);

		return graphemeSegments.reduce((width: number, grapheme: string): number => {
			return width + this.resolveGraphemeWidth(grapheme);
		}, 0);
	}

	private resolveGraphemeWidth(grapheme: string): number {
		if (grapheme.length === 0) {
			return 0;
		}

		let hasVisibleCodePoint: boolean = false;
		let hasWideCodePoint: boolean = false;
		let hasEmojiCodePoint: boolean = false;
		let hasRegionalIndicator: boolean = false;

		for (const character of grapheme) {
			const codePoint: number = character.codePointAt(0) ?? NULL_CODE_POINT_CONSTANT;

			if (isControlCodePoint(codePoint) || isCombiningCodePoint(codePoint)) {
				continue;
			}

			hasVisibleCodePoint = true;
			hasWideCodePoint = hasWideCodePoint || isFullWidthCodePoint(codePoint);
			hasEmojiCodePoint = hasEmojiCodePoint || isEmojiCodePoint(codePoint);
			hasRegionalIndicator =
				hasRegionalIndicator ||
				isInRange({
					end: REGIONAL_INDICATOR_END_CONSTANT,
					start: REGIONAL_INDICATOR_START_CONSTANT,
					value: codePoint,
				});
		}

		if (!hasVisibleCodePoint) {
			return 0;
		}

		if (hasEmojiCodePoint || hasRegionalIndicator || grapheme.includes(ZERO_WIDTH_JOINER_CHARACTER_CONSTANT)) {
			return DOUBLE_WIDTH_CHARACTER_CONSTANT;
		}

		return hasWideCodePoint ? DOUBLE_WIDTH_CHARACTER_CONSTANT : SINGLE_WIDTH_CHARACTER_CONSTANT;
	}

	private segmentGraphemes(input: string): ReadonlyArray<string> {
		const segmenterConstructor: null | TIntlSegmenterConstructorType = resolveSegmenterConstructor();

		if (segmenterConstructor === null) {
			const fallbackSegments: Array<string> = [];

			for (const character of input) {
				fallbackSegments.push(character);
			}

			return fallbackSegments;
		}

		const segmenter: { segment(input: string): Iterable<{ segment: string }> } = new segmenterConstructor(undefined, {
			granularity: GRAPHEME_GRANULARITY_CONSTANT,
		});
		const segments: Array<string> = [];

		for (const segment of segmenter.segment(input)) {
			segments.push(segment.segment);
		}

		return segments;
	}
}
