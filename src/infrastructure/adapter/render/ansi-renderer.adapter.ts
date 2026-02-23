import type { TEnvironmentType } from "@application/type/environment.type";
import type { TRenderTokenType } from "@domain/type/render-token.type";

import { ColorCapabilityService } from "@application/service/render/color-capability.service";
import { EAnsiColorEnum } from "@domain/enum/ansi-color.enum";
import { EAnsiStyleEnum } from "@domain/enum/ansi-style.enum";

const ANSI_RESET: string = "\u001B[0m";

const createClosePattern = (closeSequence: string): RegExp => {
	const escapedCloseSequence: string = closeSequence.replaceAll("[", String.raw`\[`).replaceAll("]", String.raw`\]`);

	return new RegExp(escapedCloseSequence, "g");
};

const COLOR_TOKEN_RECORD: Record<EAnsiColorEnum, TRenderTokenType> = {
	[EAnsiColorEnum.BLACK]: { CLOSE: "\u001B[39m", OPEN: "\u001B[30m", REGEX_CLOSE: createClosePattern("\u001B[39m") },
	[EAnsiColorEnum.BLUE]: { CLOSE: "\u001B[39m", OPEN: "\u001B[34m", REGEX_CLOSE: createClosePattern("\u001B[39m") },
	[EAnsiColorEnum.CYAN]: { CLOSE: "\u001B[39m", OPEN: "\u001B[36m", REGEX_CLOSE: createClosePattern("\u001B[39m") },
	[EAnsiColorEnum.GRAY]: { CLOSE: "\u001B[39m", OPEN: "\u001B[90m", REGEX_CLOSE: createClosePattern("\u001B[39m") },
	[EAnsiColorEnum.GREEN]: { CLOSE: "\u001B[39m", OPEN: "\u001B[32m", REGEX_CLOSE: createClosePattern("\u001B[39m") },
	[EAnsiColorEnum.MAGENTA]: { CLOSE: "\u001B[39m", OPEN: "\u001B[35m", REGEX_CLOSE: createClosePattern("\u001B[39m") },
	[EAnsiColorEnum.RED]: { CLOSE: "\u001B[39m", OPEN: "\u001B[31m", REGEX_CLOSE: createClosePattern("\u001B[39m") },
	[EAnsiColorEnum.WHITE]: { CLOSE: "\u001B[39m", OPEN: "\u001B[37m", REGEX_CLOSE: createClosePattern("\u001B[39m") },
	[EAnsiColorEnum.YELLOW]: { CLOSE: "\u001B[39m", OPEN: "\u001B[33m", REGEX_CLOSE: createClosePattern("\u001B[39m") },
};

const STYLE_TOKEN_RECORD: Record<EAnsiStyleEnum, TRenderTokenType> = {
	[EAnsiStyleEnum.BOLD]: { CLOSE: "\u001B[22m", OPEN: "\u001B[1m", REGEX_CLOSE: createClosePattern("\u001B[22m") },
	[EAnsiStyleEnum.DIM]: { CLOSE: "\u001B[22m", OPEN: "\u001B[2m", REGEX_CLOSE: createClosePattern("\u001B[22m") },
	[EAnsiStyleEnum.HIDDEN]: { CLOSE: "\u001B[28m", OPEN: "\u001B[8m", REGEX_CLOSE: createClosePattern("\u001B[28m") },
	[EAnsiStyleEnum.INVERSE]: { CLOSE: "\u001B[27m", OPEN: "\u001B[7m", REGEX_CLOSE: createClosePattern("\u001B[27m") },
	[EAnsiStyleEnum.ITALIC]: { CLOSE: "\u001B[23m", OPEN: "\u001B[3m", REGEX_CLOSE: createClosePattern("\u001B[23m") },
	[EAnsiStyleEnum.OVERLINE]: { CLOSE: "\u001B[55m", OPEN: "\u001B[53m", REGEX_CLOSE: createClosePattern("\u001B[55m") },
	[EAnsiStyleEnum.STRIKETHROUGH]: { CLOSE: "\u001B[29m", OPEN: "\u001B[9m", REGEX_CLOSE: createClosePattern("\u001B[29m") },
	[EAnsiStyleEnum.UNDERLINE]: { CLOSE: "\u001B[24m", OPEN: "\u001B[4m", REGEX_CLOSE: createClosePattern("\u001B[24m") },
};

export class AnsiRendererAdapter {
	private readonly COLOR_CAPABILITY_SERVICE: ColorCapabilityService;

	private readonly ENVIRONMENT: TEnvironmentType;

	private readonly IS_TTY: boolean;

	public constructor(input: { environment?: TEnvironmentType; isTTY: boolean }) {
		this.IS_TTY = input.isTTY;
		this.ENVIRONMENT = input.environment ?? (process.env as Record<string, string | undefined>);
		this.COLOR_CAPABILITY_SERVICE = new ColorCapabilityService();
	}

	public enabled(): boolean {
		return this.COLOR_CAPABILITY_SERVICE.isEnabled({
			environment: this.ENVIRONMENT,
			isTTY: this.IS_TTY,
		});
	}

	public format(text: string, tokens: ReadonlyArray<EAnsiColorEnum | EAnsiStyleEnum>): string {
		if (!this.enabled() || tokens.length === 0) {
			return text;
		}

		const renderTokens: Array<TRenderTokenType> = tokens.map((style: EAnsiColorEnum | EAnsiStyleEnum): TRenderTokenType => this.getToken(style));
		let current: string = text;
		const closeMap: Map<string, TRenderTokenType> = new Map<string, TRenderTokenType>();
		const reopenMap: Map<string, Array<string>> = new Map<string, Array<string>>();

		for (const renderToken of renderTokens) {
			closeMap.set(renderToken.CLOSE, renderToken);
			const reopenTokens: Array<string> = reopenMap.get(renderToken.CLOSE) ?? [];
			reopenTokens.push(renderToken.OPEN);
			reopenMap.set(renderToken.CLOSE, reopenTokens);
		}

		for (const [closeSequence, reopenTokens] of reopenMap.entries()) {
			const renderEntry: TRenderTokenType | undefined = closeMap.get(closeSequence);

			if (renderEntry === undefined) {
				continue;
			}

			current = current.replace(renderEntry.REGEX_CLOSE, `${closeSequence}${reopenTokens.join("")}`);
		}

		const openSequence: string = renderTokens.map((renderEntry: TRenderTokenType): string => renderEntry.OPEN).join("");
		const closeSequence: string = [...new Set(renderTokens.map((renderEntry: TRenderTokenType): string => renderEntry.CLOSE))].reverse().join("");

		return `${openSequence}${current}${closeSequence}`;
	}

	public reset(text: string): string {
		if (!this.enabled()) {
			return text;
		}

		return `${text}${ANSI_RESET}`;
	}

	private getToken(styleId: EAnsiColorEnum | EAnsiStyleEnum): TRenderTokenType {
		if (styleId in COLOR_TOKEN_RECORD) {
			return COLOR_TOKEN_RECORD[styleId as EAnsiColorEnum];
		}

		return STYLE_TOKEN_RECORD[styleId as EAnsiStyleEnum];
	}
}
