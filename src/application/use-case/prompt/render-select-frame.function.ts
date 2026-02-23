import type { SelectOptionValueObject } from "@domain/value-object/select-option.value-object";

import type { IPromptStylePortInterface } from "../../interface/port/prompt-style-port.interface";
import type { IThemePortInterface } from "../../interface/port/theme-port.interface";

const SEPARATOR_REPEAT_COUNT_CONSTANT: number = 3;
const START_INDEX_OFFSET_CONSTANT: number = 1;

export const renderSelectFrameFunction = (renderArguments: { cursorIndex: number; isUnicodeSupported: boolean; message: string; options: ReadonlyArray<SelectOptionValueObject>; pageEndIndex: number; pageStartIndex: number; promptStylePort: IPromptStylePortInterface; query?: string; themePort: IThemePortInterface }): string => {
	const questionPrefix: string = renderArguments.themePort.info(renderArguments.promptStylePort.QUESTION_PREFIX_SYMBOL);
	const questionLine: string = `${questionPrefix} ${renderArguments.themePort.strong(renderArguments.message)}`;
	const lines: Array<string> = [questionLine];
	const pointer: string = renderArguments.isUnicodeSupported ? renderArguments.promptStylePort.ACTIVE_POINTER_UNICODE : renderArguments.promptStylePort.ACTIVE_POINTER_ASCII;

	if (renderArguments.promptStylePort.IS_BLANK_LINE_AFTER_QUESTION_ENABLED) {
		lines.push("");
	}

	if ((renderArguments.query ?? "").length > 0) {
		lines.push(renderArguments.themePort.muted(`/${renderArguments.query}`));
	}

	for (let index: number = renderArguments.pageStartIndex; index < renderArguments.pageEndIndex; index += 1) {
		const option: SelectOptionValueObject | undefined = renderArguments.options[index];
		const cursor: string = index === renderArguments.cursorIndex ? renderArguments.themePort.info(pointer) : " ";
		const label: string = option?.label ?? "";

		if (option?.isSeparator) {
			lines.push(renderArguments.themePort.muted(`${renderArguments.promptStylePort.SEPARATOR_SYMBOL.repeat(SEPARATOR_REPEAT_COUNT_CONSTANT)} ${label}`));

			continue;
		}

		if (option?.isDisabled) {
			const disabledLabel: string = `${label}${renderArguments.promptStylePort.DISABLED_LABEL_SUFFIX}`;
			lines.push(`${cursor} ${renderArguments.themePort.muted(disabledLabel)}`);

			continue;
		}

		const highlightedLabel: string = index === renderArguments.cursorIndex ? renderArguments.themePort.info(label) : label;
		const hint: null | string = option?.hint ?? null;
		const hintSuffix: string = hint === null ? "" : renderArguments.themePort.muted(`${renderArguments.promptStylePort.HINT_PREFIX}${hint}`);
		lines.push(`${cursor} ${highlightedLabel}${hintSuffix}`);

		if (index === renderArguments.cursorIndex) {
			const description: null | string = option?.description ?? null;

			if (description !== null) {
				lines.push(`${renderArguments.promptStylePort.DESCRIPTION_INDENT_PREFIX}${renderArguments.themePort.muted(description)}`);
			}
		}
	}

	if (renderArguments.pageStartIndex > 0 || renderArguments.pageEndIndex < renderArguments.options.length) {
		lines.push(renderArguments.themePort.muted(`(${String(renderArguments.pageStartIndex + START_INDEX_OFFSET_CONSTANT)}-${String(renderArguments.pageEndIndex)}/${String(renderArguments.options.length)})`));
	}

	return lines.join("\n");
};
