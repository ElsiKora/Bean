import type { IPromptStylePortInterface } from "../../interface/port/prompt-style-port.interface";
import type { IThemePortInterface } from "../../interface/port/theme-port.interface";

export const renderCompletedGroupMultiselectLineFunction = (renderArguments: { isUnicodeSupported: boolean; message: string; promptStylePort: IPromptStylePortInterface; selectedLabels: ReadonlyArray<string>; themePort: IThemePortInterface }): string => {
	const completedMark: string = renderArguments.isUnicodeSupported ? renderArguments.promptStylePort.COMPLETED_MARK_UNICODE : renderArguments.promptStylePort.COMPLETED_MARK_ASCII;
	const labelsText: string = renderArguments.selectedLabels.join(", ");
	const answerSuffix: string = labelsText === "" ? "" : `: ${labelsText}`;

	return `${renderArguments.themePort.success(completedMark)} ${renderArguments.themePort.strong(renderArguments.message)}${answerSuffix}`;
};
