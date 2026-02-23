import type { IClockPortInterface } from "@application/interface/port/clock-port.interface";
import type { IInputPortInterface } from "@application/interface/port/input-port.interface";
import type { IOutputPortInterface } from "@application/interface/port/output-port.interface";
import type { IPromptStylePortInterface } from "@application/interface/port/prompt-style-port.interface";
import type { IThemePortInterface } from "@application/interface/port/theme-port.interface";
import type { ListViewportService } from "@application/service/prompt/list-viewport.service";
import type { PromptKeyDispatchService } from "@application/service/prompt/prompt-key-dispatch.service";
import type { PromptNavigationService } from "@application/service/prompt/prompt-navigation.service";
import type { PromptValidationService } from "@application/service/prompt/prompt-validation.service";
import type { TextBufferService } from "@application/service/prompt/text-buffer.service";

import { PromptGroupMultiselectUseCase } from "@application/use-case/prompt/prompt-group-multiselect.use-case";
import { PromptMultiselectUseCase } from "@application/use-case/prompt/prompt-multiselect.use-case";
import { PromptSelectUseCase } from "@application/use-case/prompt/prompt-select.use-case";
import { PromptTextUseCase } from "@application/use-case/prompt/prompt-text.use-case";

export class PromptRunnerFactory {
	private readonly CLOCK_PORT: IClockPortInterface;

	private readonly INPUT_PORT: IInputPortInterface;

	private readonly LIST_VIEWPORT_SERVICE: ListViewportService;

	private readonly OUTPUT_PORT: IOutputPortInterface;

	private readonly PROMPT_KEY_DISPATCH_SERVICE: PromptKeyDispatchService;

	private readonly PROMPT_NAVIGATION_SERVICE: PromptNavigationService;

	private readonly PROMPT_STYLE_PORT: IPromptStylePortInterface;

	private readonly PROMPT_VALIDATION_SERVICE: PromptValidationService;

	private readonly TEXT_BUFFER_SERVICE: TextBufferService;

	private readonly THEME_PORT: IThemePortInterface;

	public constructor(input: { clockPort: IClockPortInterface; inputPort: IInputPortInterface; listViewportService: ListViewportService; outputPort: IOutputPortInterface; promptKeyDispatchService: PromptKeyDispatchService; promptNavigationService: PromptNavigationService; promptStylePort: IPromptStylePortInterface; promptValidationService: PromptValidationService; textBufferService: TextBufferService; themePort: IThemePortInterface }) {
		this.CLOCK_PORT = input.clockPort;
		this.INPUT_PORT = input.inputPort;
		this.LIST_VIEWPORT_SERVICE = input.listViewportService;
		this.OUTPUT_PORT = input.outputPort;
		this.PROMPT_KEY_DISPATCH_SERVICE = input.promptKeyDispatchService;
		this.PROMPT_NAVIGATION_SERVICE = input.promptNavigationService;
		this.PROMPT_STYLE_PORT = input.promptStylePort;
		this.PROMPT_VALIDATION_SERVICE = input.promptValidationService;
		this.TEXT_BUFFER_SERVICE = input.textBufferService;
		this.THEME_PORT = input.themePort;
	}

	public createPromptGroupMultiselectUseCase(): PromptGroupMultiselectUseCase {
		return new PromptGroupMultiselectUseCase({
			clockPort: this.CLOCK_PORT,
			inputPort: this.INPUT_PORT,
			keyDispatchService: this.PROMPT_KEY_DISPATCH_SERVICE,
			listViewportService: this.LIST_VIEWPORT_SERVICE,
			navigationService: this.PROMPT_NAVIGATION_SERVICE,
			outputPort: this.OUTPUT_PORT,
			promptStylePort: this.PROMPT_STYLE_PORT,
			themePort: this.THEME_PORT,
			validationService: this.PROMPT_VALIDATION_SERVICE,
		});
	}

	public createPromptMultiselectUseCase(): PromptMultiselectUseCase {
		return new PromptMultiselectUseCase({
			clockPort: this.CLOCK_PORT,
			inputPort: this.INPUT_PORT,
			keyDispatchService: this.PROMPT_KEY_DISPATCH_SERVICE,
			listViewportService: this.LIST_VIEWPORT_SERVICE,
			navigationService: this.PROMPT_NAVIGATION_SERVICE,
			outputPort: this.OUTPUT_PORT,
			promptStylePort: this.PROMPT_STYLE_PORT,
			themePort: this.THEME_PORT,
			validationService: this.PROMPT_VALIDATION_SERVICE,
		});
	}

	public createPromptSelectUseCase(): PromptSelectUseCase {
		return new PromptSelectUseCase({
			clockPort: this.CLOCK_PORT,
			inputPort: this.INPUT_PORT,
			keyDispatchService: this.PROMPT_KEY_DISPATCH_SERVICE,
			listViewportService: this.LIST_VIEWPORT_SERVICE,
			navigationService: this.PROMPT_NAVIGATION_SERVICE,
			outputPort: this.OUTPUT_PORT,
			promptStylePort: this.PROMPT_STYLE_PORT,
			themePort: this.THEME_PORT,
		});
	}

	public createPromptTextUseCase(): PromptTextUseCase {
		return new PromptTextUseCase({
			clockPort: this.CLOCK_PORT,
			inputPort: this.INPUT_PORT,
			keyDispatchService: this.PROMPT_KEY_DISPATCH_SERVICE,
			outputPort: this.OUTPUT_PORT,
			promptStylePort: this.PROMPT_STYLE_PORT,
			textBufferService: this.TEXT_BUFFER_SERVICE,
			themePort: this.THEME_PORT,
			validationService: this.PROMPT_VALIDATION_SERVICE,
		});
	}
}
