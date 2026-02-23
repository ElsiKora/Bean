import type { IThemePortInterface } from "../../../src/application/interface/port/theme-port.interface";

export class IdentityThemePortFixture implements IThemePortInterface {
	public accent(text: string): string {
		return text;
	}

	public danger(text: string): string {
		return text;
	}

	public info(text: string): string {
		return text;
	}

	public muted(text: string): string {
		return text;
	}

	public strong(text: string): string {
		return text;
	}

	public success(text: string): string {
		return text;
	}
}
