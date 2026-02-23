import type { IClockPortInterface } from "@application/interface/port/clock-port.interface";
import type { IEditorPortInterface } from "@application/interface/port/editor-port.interface";
import type { IInputPortInterface } from "@application/interface/port/input-port.interface";
import type { IOutputPortInterface } from "@application/interface/port/output-port.interface";
import type { IPromptStylePortInterface } from "@application/interface/port/prompt-style-port.interface";
import type { IThemePortInterface } from "@application/interface/port/theme-port.interface";

export interface IBeanOptionsInterface {
	clockPort?: IClockPortInterface;
	editorPort?: IEditorPortInterface;
	environment?: Readonly<Record<string, string | undefined>>;
	inputPort?: IInputPortInterface;
	isDebugEnabled?: boolean;
	isSignalHandlingEnabled?: boolean;
	isSilent?: boolean;
	outputPort?: IOutputPortInterface;
	promptStylePort?: IPromptStylePortInterface;
	themePort?: IThemePortInterface;
}
