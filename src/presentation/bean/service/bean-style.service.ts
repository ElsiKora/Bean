import type { TBeanColorType, TBeanStyleGradientInputType, TBeanStyleTextInputType } from "../type";
import type { TBeanStyleBrightColorType } from "../type/bean-style-bright-color.type";
import type { TNamedColorType } from "../type/named-color.type";

import { ColorCapabilityService } from "@application/service/render/color-capability.service";

import { BRIGHT_BLACK_CODE_CONSTANT, BRIGHT_BLUE_CODE_CONSTANT, BRIGHT_CYAN_CODE_CONSTANT, BRIGHT_GREEN_CODE_CONSTANT, BRIGHT_MAGENTA_CODE_CONSTANT, BRIGHT_RED_CODE_CONSTANT, BRIGHT_WHITE_CODE_CONSTANT, BRIGHT_YELLOW_CODE_CONSTANT, COLOR_CHANNEL_MAX_CONSTANT, COLOR_LEVEL_16M_CONSTANT, COLOR_LEVEL_256_CONSTANT, COLOR_LEVEL_BASIC_CONSTANT, COLOR_LEVEL_NONE_CONSTANT, ONE_CONSTANT, ZERO_CONSTANT } from "../constant";

import { parseHexColorFunction } from "./parse-hex-color.function";

const ANSI_CLOSE_BACKGROUND_CONSTANT: string = "49";
const ANSI_CLOSE_FOREGROUND_CONSTANT: string = "39";
const ANSI_CLOSE_BOLD_OR_DIM_CONSTANT: string = "22";
const ANSI_CLOSE_HIDDEN_CONSTANT: string = "28";
const ANSI_CLOSE_INVERSE_CONSTANT: string = "27";
const ANSI_CLOSE_ITALIC_CONSTANT: string = "23";
const ANSI_CLOSE_OVERLINE_CONSTANT: string = "55";
const ANSI_CLOSE_STRIKETHROUGH_CONSTANT: string = "29";
const ANSI_CLOSE_UNDERLINE_CONSTANT: string = "24";
const ANSI_FOREGROUND_256_PREFIX_CONSTANT: string = "38;5";
const ANSI_FOREGROUND_TRUECOLOR_PREFIX_CONSTANT: string = "38;2";
const ANSI_BACKGROUND_256_PREFIX_CONSTANT: string = "48;5";
const ANSI_BACKGROUND_TRUECOLOR_PREFIX_CONSTANT: string = "48;2";
const ANSI_256_CODE_START_CONSTANT: number = 16;
const ANSI_256_CODE_END_CONSTANT: number = 231;
const ANSI_256_GRAYSCALE_START_CONSTANT: number = 232;
const ANSI_256_GRAYSCALE_END_CONSTANT: number = 255;
const ANSI_256_GRAYSCALE_OFFSET_CONSTANT: number = 8;
const ANSI_256_GRAYSCALE_STEP_CONSTANT: number = 10;
const ANSI_256_COMPONENT_MAX_INDEX_CONSTANT: number = 5;
const ANSI_256_BLUE_MULTIPLIER_CONSTANT: number = 1;
const ANSI_256_GREEN_MULTIPLIER_CONSTANT: number = 6;
const ANSI_256_RED_MULTIPLIER_CONSTANT: number = 36;
const BASIC_FOREGROUND_OFFSET_CONSTANT: number = 30;
const BASIC_BACKGROUND_OFFSET_CONSTANT: number = 40;
const BASIC_BLACK_FOREGROUND_CODE_CONSTANT: number = 30;
const BASIC_RED_FOREGROUND_CODE_CONSTANT: number = 31;
const BASIC_GREEN_FOREGROUND_CODE_CONSTANT: number = 32;
const BASIC_YELLOW_FOREGROUND_CODE_CONSTANT: number = 33;
const BASIC_BLUE_FOREGROUND_CODE_CONSTANT: number = 34;
const BASIC_MAGENTA_FOREGROUND_CODE_CONSTANT: number = 35;
const BASIC_CYAN_FOREGROUND_CODE_CONSTANT: number = 36;
const BASIC_WHITE_FOREGROUND_CODE_CONSTANT: number = 37;
const BASIC_GRAYSCALE_DELTA_THRESHOLD_CONSTANT: number = 24;
const BASIC_LIGHTNESS_THRESHOLD_CONSTANT: number = 127;
const BRIGHT_FOREGROUND_START_CONSTANT: number = 90;
const BRIGHT_FOREGROUND_END_CONSTANT: number = 97;
const BRIGHT_BACKGROUND_OFFSET_CONSTANT: number = 10;
const COLOR_CHANNEL_MID_CONSTANT: number = 128;
const ANSI_ESCAPE_PREFIX_CONSTANT: string = "\u001B[";
const ANSI_ESCAPE_SUFFIX_CONSTANT: string = "m";
const GRADIENT_RATIO_MAX_CONSTANT: number = 1;
const GRAPHEME_SEGMENTER_CONSTANT: Intl.Segmenter | null = typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;

const NAMED_COLOR_FOREGROUND_CODE_RECORD: Record<TNamedColorType, number> = {
	black: BASIC_BLACK_FOREGROUND_CODE_CONSTANT,
	blue: BASIC_BLUE_FOREGROUND_CODE_CONSTANT,
	cyan: BASIC_CYAN_FOREGROUND_CODE_CONSTANT,
	gray: BRIGHT_BLACK_CODE_CONSTANT,
	green: BASIC_GREEN_FOREGROUND_CODE_CONSTANT,
	magenta: BASIC_MAGENTA_FOREGROUND_CODE_CONSTANT,
	red: BASIC_RED_FOREGROUND_CODE_CONSTANT,
	white: BASIC_WHITE_FOREGROUND_CODE_CONSTANT,
	yellow: BASIC_YELLOW_FOREGROUND_CODE_CONSTANT,
};

const NAMED_COLOR_RGB_RECORD: Record<TNamedColorType, { b: number; g: number; r: number }> = {
	black: { b: ZERO_CONSTANT, g: ZERO_CONSTANT, r: ZERO_CONSTANT },
	blue: { b: COLOR_CHANNEL_MAX_CONSTANT, g: ZERO_CONSTANT, r: ZERO_CONSTANT },
	cyan: { b: COLOR_CHANNEL_MAX_CONSTANT, g: COLOR_CHANNEL_MAX_CONSTANT, r: ZERO_CONSTANT },
	gray: { b: COLOR_CHANNEL_MID_CONSTANT, g: COLOR_CHANNEL_MID_CONSTANT, r: COLOR_CHANNEL_MID_CONSTANT },
	green: { b: ZERO_CONSTANT, g: COLOR_CHANNEL_MAX_CONSTANT, r: ZERO_CONSTANT },
	magenta: { b: COLOR_CHANNEL_MAX_CONSTANT, g: ZERO_CONSTANT, r: COLOR_CHANNEL_MAX_CONSTANT },
	red: { b: ZERO_CONSTANT, g: ZERO_CONSTANT, r: COLOR_CHANNEL_MAX_CONSTANT },
	white: { b: COLOR_CHANNEL_MAX_CONSTANT, g: COLOR_CHANNEL_MAX_CONSTANT, r: COLOR_CHANNEL_MAX_CONSTANT },
	yellow: { b: ZERO_CONSTANT, g: COLOR_CHANNEL_MAX_CONSTANT, r: COLOR_CHANNEL_MAX_CONSTANT },
};

export class BeanStyleService {
	private readonly COLOR_CAPABILITY_SERVICE: ColorCapabilityService;

	public constructor() {
		this.COLOR_CAPABILITY_SERVICE = new ColorCapabilityService();
	}

	public gradient(input: { colorLevel: number } & TBeanStyleGradientInputType): string {
		if (input.colorLevel === COLOR_LEVEL_NONE_CONSTANT || input.text.length === ZERO_CONSTANT) {
			return input.text;
		}

		const fromColor: { b: number; g: number; r: number } | null = this.resolveGradientColorToRgb(input.from);
		const toColor: { b: number; g: number; r: number } | null = this.resolveGradientColorToRgb(input.to);

		if (fromColor === null || toColor === null) {
			return this.style({
				background: input.background,
				color: input.from,
				colorLevel: input.colorLevel,
				isBold: input.isBold,
				isDim: input.isDim,
				isHidden: input.isHidden,
				isInverse: input.isInverse,
				isItalic: input.isItalic,
				isOverline: input.isOverline,
				isStrikethrough: input.isStrikethrough,
				isUnderline: input.isUnderline,
				text: input.text,
			});
		}

		const graphemeSegments: Array<string> = this.splitGraphemeClusters(input.text);

		if (graphemeSegments.length <= ONE_CONSTANT) {
			return this.style({
				background: input.background,
				color: input.from,
				colorLevel: input.colorLevel,
				isBold: input.isBold,
				isDim: input.isDim,
				isHidden: input.isHidden,
				isInverse: input.isInverse,
				isItalic: input.isItalic,
				isOverline: input.isOverline,
				isStrikethrough: input.isStrikethrough,
				isUnderline: input.isUnderline,
				text: input.text,
			});
		}

		const denominator: number = graphemeSegments.length - ONE_CONSTANT;

		const renderedSegments: Array<string> = graphemeSegments.map((segment: string, index: number): string => {
			const ratio: number = Math.min(Math.max(index / denominator, ZERO_CONSTANT), GRADIENT_RATIO_MAX_CONSTANT);

			const color: { b: number; g: number; r: number } = {
				b: Math.round(fromColor.b + (toColor.b - fromColor.b) * ratio),
				g: Math.round(fromColor.g + (toColor.g - fromColor.g) * ratio),
				r: Math.round(fromColor.r + (toColor.r - fromColor.r) * ratio),
			};

			return this.style({
				background: input.background,
				color,
				colorLevel: input.colorLevel,
				isBold: input.isBold,
				isDim: input.isDim,
				isHidden: input.isHidden,
				isInverse: input.isInverse,
				isItalic: input.isItalic,
				isOverline: input.isOverline,
				isStrikethrough: input.isStrikethrough,
				isUnderline: input.isUnderline,
				text: segment,
			});
		});

		return renderedSegments.join("");
	}

	public resolveColorLevel(input: { environment: Readonly<Record<string, string | undefined>>; isTTY: boolean }): number {
		return this.COLOR_CAPABILITY_SERVICE.resolveLevel(input);
	}

	public style(input: { colorLevel: number } & TBeanStyleTextInputType): string {
		if (input.colorLevel === COLOR_LEVEL_NONE_CONSTANT) {
			return input.text;
		}

		const openTokens: Array<string> = [];
		const closeTokens: Array<string> = [];

		if (input.isBold ?? false) {
			openTokens.push("1");
			closeTokens.push(ANSI_CLOSE_BOLD_OR_DIM_CONSTANT);
		}

		if (input.isDim ?? false) {
			openTokens.push("2");
			closeTokens.push(ANSI_CLOSE_BOLD_OR_DIM_CONSTANT);
		}

		if (input.isItalic ?? false) {
			openTokens.push("3");
			closeTokens.push(ANSI_CLOSE_ITALIC_CONSTANT);
		}

		if (input.isUnderline ?? false) {
			openTokens.push("4");
			closeTokens.push(ANSI_CLOSE_UNDERLINE_CONSTANT);
		}

		if (input.isInverse ?? false) {
			openTokens.push("7");
			closeTokens.push(ANSI_CLOSE_INVERSE_CONSTANT);
		}

		if (input.isHidden ?? false) {
			openTokens.push("8");
			closeTokens.push(ANSI_CLOSE_HIDDEN_CONSTANT);
		}

		if (input.isStrikethrough ?? false) {
			openTokens.push("9");
			closeTokens.push(ANSI_CLOSE_STRIKETHROUGH_CONSTANT);
		}

		if (input.isOverline ?? false) {
			openTokens.push("53");
			closeTokens.push(ANSI_CLOSE_OVERLINE_CONSTANT);
		}

		const foregroundToken: null | string = this.resolveColorToken({
			color: input.color,
			colorLevel: input.colorLevel,
			isBackground: false,
		});

		const backgroundToken: null | string = this.resolveColorToken({
			color: input.background,
			colorLevel: input.colorLevel,
			isBackground: true,
		});

		if (foregroundToken !== null) {
			openTokens.push(foregroundToken);
			closeTokens.push(ANSI_CLOSE_FOREGROUND_CONSTANT);
		}

		if (backgroundToken !== null) {
			openTokens.push(backgroundToken);
			closeTokens.push(ANSI_CLOSE_BACKGROUND_CONSTANT);
		}

		if (openTokens.length === ZERO_CONSTANT) {
			return input.text;
		}

		const openSequence: string = this.createAnsiEscapeSequence(openTokens.join(";"));
		const closeTokensInReverseOrder: Array<string> = this.uniqueReverse(closeTokens);
		const closeSequence: string = this.createAnsiEscapeSequence(closeTokensInReverseOrder.join(";"));

		const protectedText: string = this.rehydrateNestedText({
			closeTokens: closeTokensInReverseOrder,
			openSequence,
			text: input.text,
		});

		return `${openSequence}${protectedText}${closeSequence}`;
	}

	public styleBright(input: { color: TBeanStyleBrightColorType; colorLevel: number; text: string }): string {
		if (input.colorLevel < COLOR_LEVEL_BASIC_CONSTANT) {
			return input.text;
		}

		const brightColorCodeRecord: Record<TBeanStyleBrightColorType, number> = {
			black: BRIGHT_BLACK_CODE_CONSTANT,
			blue: BRIGHT_BLUE_CODE_CONSTANT,
			cyan: BRIGHT_CYAN_CODE_CONSTANT,
			green: BRIGHT_GREEN_CODE_CONSTANT,
			magenta: BRIGHT_MAGENTA_CODE_CONSTANT,
			red: BRIGHT_RED_CODE_CONSTANT,
			white: BRIGHT_WHITE_CODE_CONSTANT,
			yellow: BRIGHT_YELLOW_CODE_CONSTANT,
		};
		const openSequence: string = this.createAnsiEscapeSequence(String(brightColorCodeRecord[input.color]));
		const closeSequence: string = this.createAnsiEscapeSequence(ANSI_CLOSE_FOREGROUND_CONSTANT);

		const protectedText: string = this.rehydrateNestedText({
			closeTokens: [ANSI_CLOSE_FOREGROUND_CONSTANT],
			openSequence,
			text: input.text,
		});

		return `${openSequence}${protectedText}${closeSequence}`;
	}

	private ansi256ToRgb(code: number): { b: number; g: number; r: number } {
		if (code >= ANSI_256_GRAYSCALE_START_CONSTANT && code <= ANSI_256_GRAYSCALE_END_CONSTANT) {
			const shade: number = ANSI_256_GRAYSCALE_OFFSET_CONSTANT + (code - ANSI_256_GRAYSCALE_START_CONSTANT) * ANSI_256_GRAYSCALE_STEP_CONSTANT;

			return {
				b: shade,
				g: shade,
				r: shade,
			};
		}

		if (code >= ANSI_256_CODE_START_CONSTANT && code <= ANSI_256_CODE_END_CONSTANT) {
			const baseCode: number = code - ANSI_256_CODE_START_CONSTANT;
			const redIndex: number = Math.floor(baseCode / ANSI_256_RED_MULTIPLIER_CONSTANT);
			const greenIndex: number = Math.floor((baseCode % ANSI_256_RED_MULTIPLIER_CONSTANT) / ANSI_256_GREEN_MULTIPLIER_CONSTANT);
			const blueIndex: number = baseCode % ANSI_256_GREEN_MULTIPLIER_CONSTANT;

			return {
				b: Math.round((blueIndex / ANSI_256_COMPONENT_MAX_INDEX_CONSTANT) * COLOR_CHANNEL_MAX_CONSTANT),
				g: Math.round((greenIndex / ANSI_256_COMPONENT_MAX_INDEX_CONSTANT) * COLOR_CHANNEL_MAX_CONSTANT),
				r: Math.round((redIndex / ANSI_256_COMPONENT_MAX_INDEX_CONSTANT) * COLOR_CHANNEL_MAX_CONSTANT),
			};
		}

		return { b: ZERO_CONSTANT, g: ZERO_CONSTANT, r: ZERO_CONSTANT };
	}

	private createAnsiEscapeSequence(token: string): string {
		return `${ANSI_ESCAPE_PREFIX_CONSTANT}${token}${ANSI_ESCAPE_SUFFIX_CONSTANT}`;
	}

	private rehydrateNestedText(input: { closeTokens: ReadonlyArray<string>; openSequence: string; text: string }): string {
		let protectedText: string = input.text;

		for (const closeToken of input.closeTokens) {
			const closeSequence: string = this.createAnsiEscapeSequence(closeToken);
			protectedText = protectedText.replaceAll(closeSequence, `${closeSequence}${input.openSequence}`);
		}

		return protectedText;
	}

	private resolveBasicColorToken(input: { b: number; g: number; isBackground: boolean; r: number }): string {
		const maxChannel: number = Math.max(input.r, input.g, input.b);
		const minChannel: number = Math.min(input.r, input.g, input.b);

		if (maxChannel - minChannel <= BASIC_GRAYSCALE_DELTA_THRESHOLD_CONSTANT) {
			const grayCode: number = maxChannel >= BASIC_LIGHTNESS_THRESHOLD_CONSTANT ? BASIC_WHITE_FOREGROUND_CODE_CONSTANT : BASIC_BLACK_FOREGROUND_CODE_CONSTANT;

			return String(this.toBackgroundCode(grayCode, input.isBackground));
		}

		const isRedDominant: boolean = input.r >= input.g && input.r >= input.b;
		const isGreenDominant: boolean = input.g >= input.r && input.g >= input.b;
		const isBlueDominant: boolean = input.b >= input.r && input.b >= input.g;
		let basicCode: number = BASIC_WHITE_FOREGROUND_CODE_CONSTANT;

		if (isRedDominant && isGreenDominant) {
			basicCode = BASIC_YELLOW_FOREGROUND_CODE_CONSTANT;
		} else if (isRedDominant && isBlueDominant) {
			basicCode = BASIC_MAGENTA_FOREGROUND_CODE_CONSTANT;
		} else if (isGreenDominant && isBlueDominant) {
			basicCode = BASIC_CYAN_FOREGROUND_CODE_CONSTANT;
		} else if (isRedDominant) {
			basicCode = BASIC_RED_FOREGROUND_CODE_CONSTANT;
		} else if (isGreenDominant) {
			basicCode = BASIC_GREEN_FOREGROUND_CODE_CONSTANT;
		} else if (isBlueDominant) {
			basicCode = BASIC_BLUE_FOREGROUND_CODE_CONSTANT;
		}

		return String(this.toBackgroundCode(basicCode, input.isBackground));
	}

	private resolveColorToken(input: { color: TBeanColorType | undefined; colorLevel: number; isBackground: boolean }): null | string {
		if (input.color === undefined) {
			return null;
		}

		if (typeof input.color === "number") {
			const colorCode: number = Math.min(Math.max(Math.round(input.color), ZERO_CONSTANT), COLOR_CHANNEL_MAX_CONSTANT);

			if (input.colorLevel >= COLOR_LEVEL_256_CONSTANT) {
				return `${input.isBackground ? ANSI_BACKGROUND_256_PREFIX_CONSTANT : ANSI_FOREGROUND_256_PREFIX_CONSTANT};${String(colorCode)}`;
			}

			if (input.colorLevel < COLOR_LEVEL_BASIC_CONSTANT) {
				return null;
			}

			const rgbColor: { b: number; g: number; r: number } = this.ansi256ToRgb(colorCode);

			return this.resolveBasicColorToken({
				...rgbColor,
				isBackground: input.isBackground,
			});
		}

		if (typeof input.color === "string") {
			const parsedColor: { b: number; g: number; r: number } | null = parseHexColorFunction(input.color);

			if (parsedColor !== null) {
				return this.resolveRgbColorToken({
					...parsedColor,
					colorLevel: input.colorLevel,
					isBackground: input.isBackground,
				});
			}

			if (!(input.color in NAMED_COLOR_FOREGROUND_CODE_RECORD) || input.colorLevel < COLOR_LEVEL_BASIC_CONSTANT) {
				return null;
			}

			const foregroundCode: number = NAMED_COLOR_FOREGROUND_CODE_RECORD[input.color as TNamedColorType];

			return String(this.toBackgroundCode(foregroundCode, input.isBackground));
		}

		const r: number = Math.min(Math.max(Math.round(input.color.r), ZERO_CONSTANT), COLOR_CHANNEL_MAX_CONSTANT);
		const g: number = Math.min(Math.max(Math.round(input.color.g), ZERO_CONSTANT), COLOR_CHANNEL_MAX_CONSTANT);
		const b: number = Math.min(Math.max(Math.round(input.color.b), ZERO_CONSTANT), COLOR_CHANNEL_MAX_CONSTANT);

		return this.resolveRgbColorToken({
			b,
			colorLevel: input.colorLevel,
			g,
			isBackground: input.isBackground,
			r,
		});
	}

	private resolveGradientColorToRgb(color: TBeanColorType): { b: number; g: number; r: number } | null {
		if (typeof color === "number") {
			const clampedColorCode: number = Math.min(Math.max(Math.round(color), ZERO_CONSTANT), COLOR_CHANNEL_MAX_CONSTANT);

			return this.ansi256ToRgb(clampedColorCode);
		}

		if (typeof color === "string") {
			const parsedColor: { b: number; g: number; r: number } | null = parseHexColorFunction(color);

			if (parsedColor !== null) {
				return parsedColor;
			}

			if (!(color in NAMED_COLOR_RGB_RECORD)) {
				return null;
			}

			return NAMED_COLOR_RGB_RECORD[color as TNamedColorType];
		}

		return {
			b: Math.min(Math.max(Math.round(color.b), ZERO_CONSTANT), COLOR_CHANNEL_MAX_CONSTANT),
			g: Math.min(Math.max(Math.round(color.g), ZERO_CONSTANT), COLOR_CHANNEL_MAX_CONSTANT),
			r: Math.min(Math.max(Math.round(color.r), ZERO_CONSTANT), COLOR_CHANNEL_MAX_CONSTANT),
		};
	}

	private resolveRgbColorToken(input: { b: number; colorLevel: number; g: number; isBackground: boolean; r: number }): null | string {
		if (input.colorLevel >= COLOR_LEVEL_16M_CONSTANT) {
			return `${input.isBackground ? ANSI_BACKGROUND_TRUECOLOR_PREFIX_CONSTANT : ANSI_FOREGROUND_TRUECOLOR_PREFIX_CONSTANT};${String(input.r)};${String(input.g)};${String(input.b)}`;
		}

		if (input.colorLevel >= COLOR_LEVEL_256_CONSTANT) {
			const ansi256Code: number = this.rgbToAnsi256(input.r, input.g, input.b);

			return `${input.isBackground ? ANSI_BACKGROUND_256_PREFIX_CONSTANT : ANSI_FOREGROUND_256_PREFIX_CONSTANT};${String(ansi256Code)}`;
		}

		if (input.colorLevel >= COLOR_LEVEL_BASIC_CONSTANT) {
			return this.resolveBasicColorToken({
				b: input.b,
				g: input.g,
				isBackground: input.isBackground,
				r: input.r,
			});
		}

		return null;
	}

	private rgbToAnsi256(r: number, g: number, b: number): number {
		if (r === g && g === b) {
			if (r < ANSI_256_GRAYSCALE_OFFSET_CONSTANT) {
				return ANSI_256_CODE_START_CONSTANT;
			}

			if (r > COLOR_CHANNEL_MAX_CONSTANT - ANSI_256_GRAYSCALE_STEP_CONSTANT) {
				return ANSI_256_GRAYSCALE_END_CONSTANT;
			}

			return Math.round((r - ANSI_256_GRAYSCALE_OFFSET_CONSTANT) / ANSI_256_GRAYSCALE_STEP_CONSTANT) + ANSI_256_GRAYSCALE_START_CONSTANT;
		}

		const redIndex: number = Math.round((r / COLOR_CHANNEL_MAX_CONSTANT) * ANSI_256_COMPONENT_MAX_INDEX_CONSTANT);
		const greenIndex: number = Math.round((g / COLOR_CHANNEL_MAX_CONSTANT) * ANSI_256_COMPONENT_MAX_INDEX_CONSTANT);
		const blueIndex: number = Math.round((b / COLOR_CHANNEL_MAX_CONSTANT) * ANSI_256_COMPONENT_MAX_INDEX_CONSTANT);

		return ANSI_256_CODE_START_CONSTANT + redIndex * ANSI_256_RED_MULTIPLIER_CONSTANT + greenIndex * ANSI_256_GREEN_MULTIPLIER_CONSTANT + blueIndex * ANSI_256_BLUE_MULTIPLIER_CONSTANT;
	}

	private splitGraphemeClusters(value: string): Array<string> {
		if (GRAPHEME_SEGMENTER_CONSTANT === null) {
			const fallbackSegments: Array<string> = [];

			for (const character of value) {
				fallbackSegments.push(character);
			}

			return fallbackSegments;
		}

		const graphemeSegments: Array<string> = [];

		for (const segment of GRAPHEME_SEGMENTER_CONSTANT.segment(value)) {
			graphemeSegments.push(segment.segment);
		}

		return graphemeSegments;
	}

	private toBackgroundCode(code: number, isBackground: boolean): number {
		if (!isBackground) {
			return code;
		}

		if (code >= BRIGHT_FOREGROUND_START_CONSTANT && code <= BRIGHT_FOREGROUND_END_CONSTANT) {
			return code + BRIGHT_BACKGROUND_OFFSET_CONSTANT;
		}

		if (code >= BASIC_FOREGROUND_OFFSET_CONSTANT && code < BRIGHT_FOREGROUND_START_CONSTANT) {
			return code + BASIC_BACKGROUND_OFFSET_CONSTANT - BASIC_FOREGROUND_OFFSET_CONSTANT;
		}

		return code;
	}

	private uniqueReverse(values: ReadonlyArray<string>): Array<string> {
		const uniqueValues: Set<string> = new Set<string>(values);

		return [...uniqueValues].reverse();
	}
}
