import type { TBeanImagePixelType } from "../type";

import { COLOR_CHANNEL_MAX_CONSTANT, ONE_CONSTANT, ZERO_CONSTANT } from "../constant";

const IMAGE_ASCII_PALETTE_CONSTANT: Array<string> = [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"];
const IMAGE_UNICODE_PALETTE_CONSTANT: Array<string> = [" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
const IMAGE_CHARACTER_ASPECT_RATIO_CONSTANT: number = 0.5;

export class BeanImageRendererService {
	public render(input: { isUnicodeSupported: boolean; maxWidth: number; pixels: ReadonlyArray<ReadonlyArray<TBeanImagePixelType>> }): string {
		if (input.pixels.length === ZERO_CONSTANT) {
			return "";
		}

		const sourceHeight: number = input.pixels.length;
		const sourceWidth: number = Math.max(...input.pixels.map((row: ReadonlyArray<TBeanImagePixelType>): number => row.length), ZERO_CONSTANT);

		if (sourceWidth === ZERO_CONSTANT) {
			return "";
		}

		const targetWidth: number = Math.min(Math.max(Math.floor(input.maxWidth), ONE_CONSTANT), sourceWidth);
		const targetHeight: number = Math.max(Math.round((sourceHeight / sourceWidth) * targetWidth * IMAGE_CHARACTER_ASPECT_RATIO_CONSTANT), ONE_CONSTANT);
		const palette: Array<string> = input.isUnicodeSupported ? IMAGE_UNICODE_PALETTE_CONSTANT : IMAGE_ASCII_PALETTE_CONSTANT;
		const paletteMaxIndex: number = palette.length - ONE_CONSTANT;
		const lines: Array<string> = [];

		for (let y: number = ZERO_CONSTANT; y < targetHeight; y += ONE_CONSTANT) {
			let line: string = "";

			for (let x: number = ZERO_CONSTANT; x < targetWidth; x += ONE_CONSTANT) {
				const sourceY: number = Math.min(Math.floor((y / targetHeight) * sourceHeight), sourceHeight - ONE_CONSTANT);
				const sourceX: number = Math.min(Math.floor((x / targetWidth) * sourceWidth), sourceWidth - ONE_CONSTANT);

				const pixel: TBeanImagePixelType = this.resolvePixel({
					pixels: input.pixels,
					x: sourceX,
					y: sourceY,
				});
				const luminance: number = this.toLuminance(pixel);
				const paletteIndex: number = Math.min(Math.floor(luminance * paletteMaxIndex), paletteMaxIndex);
				const character: string = palette[paletteIndex] ?? palette[paletteMaxIndex] ?? " ";

				line += character;
			}

			lines.push(line);
		}

		return lines.join("\n");
	}

	private resolvePixel(input: { pixels: ReadonlyArray<ReadonlyArray<TBeanImagePixelType>>; x: number; y: number }): TBeanImagePixelType {
		const row: ReadonlyArray<TBeanImagePixelType> = input.pixels[input.y] ?? [];

		const fallbackPixel: TBeanImagePixelType = {
			b: ZERO_CONSTANT,
			g: ZERO_CONSTANT,
			r: ZERO_CONSTANT,
		};

		return row[input.x] ?? fallbackPixel;
	}

	private toLuminance(pixel: TBeanImagePixelType): number {
		const redWeight: number = 0.299;
		const greenWeight: number = 0.587;
		const blueWeight: number = 0.114;
		const r: number = Math.min(Math.max(Math.round(pixel.r), ZERO_CONSTANT), COLOR_CHANNEL_MAX_CONSTANT);
		const g: number = Math.min(Math.max(Math.round(pixel.g), ZERO_CONSTANT), COLOR_CHANNEL_MAX_CONSTANT);
		const b: number = Math.min(Math.max(Math.round(pixel.b), ZERO_CONSTANT), COLOR_CHANNEL_MAX_CONSTANT);
		const luminance: number = (r * redWeight + g * greenWeight + b * blueWeight) / COLOR_CHANNEL_MAX_CONSTANT;

		return Math.min(Math.max(luminance, ZERO_CONSTANT), ONE_CONSTANT);
	}
}
