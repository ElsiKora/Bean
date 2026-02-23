import { HEX_BLUE_INDEX_CONSTANT, HEX_END_INDEX_CONSTANT, HEX_GREEN_INDEX_CONSTANT, HEX_RADIX_CONSTANT, ZERO_CONSTANT } from "../constant";

const SHORT_HEX_LENGTH_CONSTANT: number = 3;
const SHORT_HEX_MIDDLE_INDEX_CONSTANT: number = 1;
const SHORT_HEX_LAST_INDEX_CONSTANT: number = 2;

export const parseHexColorFunction = (value: string): { b: number; g: number; r: number } | null => {
	const rawValue: string = value.startsWith("#") ? value.slice(1) : value;

	const normalizedValue: string = rawValue.length === SHORT_HEX_LENGTH_CONSTANT ? `${rawValue[ZERO_CONSTANT]}${rawValue[ZERO_CONSTANT]}${rawValue[SHORT_HEX_MIDDLE_INDEX_CONSTANT]}${rawValue[SHORT_HEX_MIDDLE_INDEX_CONSTANT]}${rawValue[SHORT_HEX_LAST_INDEX_CONSTANT]}${rawValue[SHORT_HEX_LAST_INDEX_CONSTANT]}` : rawValue;

	if (!/^[A-F0-9]{6}$/i.test(normalizedValue)) {
		return null;
	}

	return {
		b: Number.parseInt(normalizedValue.slice(HEX_BLUE_INDEX_CONSTANT, HEX_END_INDEX_CONSTANT), HEX_RADIX_CONSTANT),
		g: Number.parseInt(normalizedValue.slice(HEX_GREEN_INDEX_CONSTANT, HEX_BLUE_INDEX_CONSTANT), HEX_RADIX_CONSTANT),
		r: Number.parseInt(normalizedValue.slice(ZERO_CONSTANT, HEX_GREEN_INDEX_CONSTANT), HEX_RADIX_CONSTANT),
	};
};
