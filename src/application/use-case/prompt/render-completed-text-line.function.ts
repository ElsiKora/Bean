import type { IPromptStylePortInterface } from "../../interface/port/prompt-style-port.interface";
import type { IThemePortInterface } from "../../interface/port/theme-port.interface";

export const renderCompletedTextLineFunction = (renderArguments: { isUnicodeSupported: boolean; message: string; promptStylePort: IPromptStylePortInterface; themePort: IThemePortInterface; value: string }): string => {
	const completedMark: string = renderArguments.isUnicodeSupported ? renderArguments.promptStylePort.COMPLETED_MARK_UNICODE : renderArguments.promptStylePort.COMPLETED_MARK_ASCII;

	return `${renderArguments.themePort.success(completedMark)} ${renderArguments.themePort.strong(renderArguments.message)}: ${renderArguments.value}`;
};
