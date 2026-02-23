import type { TEnvironmentType } from "../../type/environment.type";

const COLOR_LEVEL_NONE_CONSTANT: number = 0;
const COLOR_LEVEL_BASIC_CONSTANT: number = 1;
const COLOR_LEVEL_256_CONSTANT: number = 2;
const COLOR_LEVEL_16M_CONSTANT: number = 3;

const clampColorLevel = (value: number): number => {
	if (value <= COLOR_LEVEL_NONE_CONSTANT) {
		return COLOR_LEVEL_NONE_CONSTANT;
	}

	if (value >= COLOR_LEVEL_16M_CONSTANT) {
		return COLOR_LEVEL_16M_CONSTANT;
	}

	return value;
};

export class ColorCapabilityService {
	public isEnabled(input: { environment: TEnvironmentType; isTTY: boolean }): boolean {
		return this.resolveLevel(input) > COLOR_LEVEL_NONE_CONSTANT;
	}

	public resolveLevel(input: { environment: TEnvironmentType; isTTY: boolean }): number {
		if (input.environment.NO_COLOR !== undefined) {
			return COLOR_LEVEL_NONE_CONSTANT;
		}

		if (input.environment.FORCE_COLOR !== undefined) {
			if (input.environment.FORCE_COLOR === "0") {
				return COLOR_LEVEL_NONE_CONSTANT;
			}

			const parsedForceColor: number = Number.parseInt(input.environment.FORCE_COLOR, 10);

			if (Number.isNaN(parsedForceColor)) {
				return COLOR_LEVEL_BASIC_CONSTANT;
			}

			return clampColorLevel(parsedForceColor);
		}

		if (!input.isTTY || input.environment.TERM === "dumb") {
			return COLOR_LEVEL_NONE_CONSTANT;
		}

		if (input.environment.COLORTERM === "24bit" || input.environment.COLORTERM === "truecolor") {
			return COLOR_LEVEL_16M_CONSTANT;
		}

		if (input.environment.TERM?.includes("256color") ?? false) {
			return COLOR_LEVEL_256_CONSTANT;
		}

		return COLOR_LEVEL_BASIC_CONSTANT;
	}
}
