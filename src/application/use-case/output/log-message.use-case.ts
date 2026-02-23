import type { IOutputPortInterface } from "../../interface/port/output-port.interface";
import type { IThemePortInterface } from "../../interface/port/theme-port.interface";

export class LogMessageUseCase {
	private readonly OUTPUT_PORT: IOutputPortInterface;

	private readonly THEME_PORT: IThemePortInterface;

	public constructor(input: { outputPort: IOutputPortInterface; themePort: IThemePortInterface }) {
		this.OUTPUT_PORT = input.outputPort;
		this.THEME_PORT = input.themePort;
	}

	public execute(input: { level: "error" | "info" | "success" | "warn"; message: string }): void {
		let formatted: string = input.message;

		switch (input.level) {
			case "error": {
				formatted = this.THEME_PORT.danger(input.message);

				break;
			}

			case "info": {
				formatted = this.THEME_PORT.info(input.message);

				break;
			}

			case "success": {
				formatted = this.THEME_PORT.success(input.message);

				break;
			}

			case "warn": {
				formatted = this.THEME_PORT.accent(input.message);

				break;
			}
			// No default
		}

		this.OUTPUT_PORT.writeLine(formatted);
	}
}
