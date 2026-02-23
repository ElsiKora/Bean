export type TIntlSegmenterConstructorType = new (
	locales?: ReadonlyArray<string> | string,
	options?: { granularity: "grapheme" },
) => {
	segment(input: string): Iterable<{ segment: string }>;
};
