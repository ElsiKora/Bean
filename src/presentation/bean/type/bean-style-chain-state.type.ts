import type { TBeanStyleBrightColorType } from "./bean-style-bright-color.type";
import type { TBeanStyleTextInputType } from "./bean-style-text-input.type";

export type TBeanStyleChainStateType = {
	brightColor?: TBeanStyleBrightColorType;
} & Omit<TBeanStyleTextInputType, "text">;
