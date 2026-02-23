import type { IPromptStylePortInterface } from "../../interface/port/prompt-style-port.interface";
import type { IThemePortInterface } from "../../interface/port/theme-port.interface";

export const renderCompletedSelectLineFunction = (renderArguments: { isUnicodeSupported: boolean; message: string; promptStylePort: IPromptStylePortInterface; selectedLabel: string; themePort: IThemePortInterface }): string => {
	const completedMark: string = renderArguments.isUnicodeSupported ? renderArguments.promptStylePort.COMPLETED_MARK_UNICODE : renderArguments.promptStylePort.COMPLETED_MARK_ASCII;

	return `${renderArguments.themePort.success(completedMark)} ${renderArguments.themePort.strong(renderArguments.message)}: ${renderArguments.selectedLabel}`;
};
