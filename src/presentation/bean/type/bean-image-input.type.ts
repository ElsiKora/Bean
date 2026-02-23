import type { TBeanImagePixelType } from "./bean-image-pixel.type";

export type TBeanImageInputType = {
	alt?: string;
	maxWidth?: number;
	pixels: ReadonlyArray<ReadonlyArray<TBeanImagePixelType>>;
};
