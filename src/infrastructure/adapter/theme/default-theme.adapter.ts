import type { IThemePortInterface } from "@application/interface/port/theme-port.interface";

import type { AnsiRendererAdapter } from "../render/ansi-renderer.adapter";

import { EAnsiColorEnum } from "@domain/enum/ansi-color.enum";
import { EAnsiStyleEnum } from "@domain/enum/ansi-style.enum";

export class DefaultThemeAdapter implements IThemePortInterface {
	private readonly ANSI_RENDERER_ADAPTER: AnsiRendererAdapter;

	public constructor(input: { ansiRendererAdapter: AnsiRendererAdapter }) {
		this.ANSI_RENDERER_ADAPTER = input.ansiRendererAdapter;
	}

	public accent(text: string): string {
		return this.ANSI_RENDERER_ADAPTER.format(text, [EAnsiColorEnum.YELLOW, EAnsiStyleEnum.BOLD]);
	}

	public danger(text: string): string {
		return this.ANSI_RENDERER_ADAPTER.format(text, [EAnsiColorEnum.RED, EAnsiStyleEnum.BOLD]);
	}

	public info(text: string): string {
		return this.ANSI_RENDERER_ADAPTER.format(text, [EAnsiColorEnum.CYAN]);
	}

	public muted(text: string): string {
		return this.ANSI_RENDERER_ADAPTER.format(text, [EAnsiColorEnum.GRAY]);
	}

	public strong(text: string): string {
		return this.ANSI_RENDERER_ADAPTER.format(text, [EAnsiStyleEnum.BOLD]);
	}

	public success(text: string): string {
		return this.ANSI_RENDERER_ADAPTER.format(text, [EAnsiColorEnum.GREEN, EAnsiStyleEnum.BOLD]);
	}
}
