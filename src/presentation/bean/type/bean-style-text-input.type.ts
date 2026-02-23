import type { TBeanColorType } from "./bean-color.type";

export type TBeanStyleTextInputType = {
	background?: TBeanColorType;
	color?: TBeanColorType;
	isBold?: boolean;
	isDim?: boolean;
	isHidden?: boolean;
	isInverse?: boolean;
	isItalic?: boolean;
	isOverline?: boolean;
	isStrikethrough?: boolean;
	isUnderline?: boolean;
	text: string;
};
