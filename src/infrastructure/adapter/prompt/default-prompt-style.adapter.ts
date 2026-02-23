import type { IPromptStylePortInterface } from "@application/interface/port/prompt-style-port.interface";

export class DefaultPromptStyleAdapter implements IPromptStylePortInterface {
	public readonly ACTIVE_POINTER_ASCII: string = ">";

	public readonly ACTIVE_POINTER_UNICODE: string = "❯";

	public readonly COMPLETED_MARK_ASCII: string = "v";

	public readonly COMPLETED_MARK_UNICODE: string = "✔";

	public readonly DESCRIPTION_INDENT_PREFIX: string = "    ";

	public readonly DISABLED_LABEL_SUFFIX: string = " (disabled)";

	public readonly ERROR_PREFIX: string = "!";

	public readonly FAILED_MARK_ASCII: string = "x";

	public readonly FAILED_MARK_UNICODE: string = "✖";

	public readonly GROUP_INDENT_PREFIX: string = "  ";

	public readonly HINT_PREFIX: string = " - ";

	public readonly IS_BLANK_LINE_AFTER_QUESTION_ENABLED: boolean = true;

	public readonly NEUTRAL_MARK_ASCII: string = "-";

	public readonly NEUTRAL_MARK_UNICODE: string = "•";

	public readonly PLACEHOLDER_PREFIX: string = "› ";

	public readonly QUESTION_PREFIX_SYMBOL: string = "?";

	public readonly SELECTED_MARK_ASCII: string = "[x]";

	public readonly SELECTED_MARK_UNICODE: string = "◉";

	public readonly SEPARATOR_SYMBOL: string = "─";

	public readonly TOGGLE_FALSE_LABEL: string = "Off";

	public readonly TOGGLE_TRUE_LABEL: string = "On";

	public readonly UNSELECTED_MARK_ASCII: string = "[ ]";

	public readonly UNSELECTED_MARK_UNICODE: string = "◯";
}
