import type { ReadStream, WriteStream } from "node:tty";

import type { IClockPortInterface } from "@application/interface/port/clock-port.interface";
import type { IEditorPortInterface } from "@application/interface/port/editor-port.interface";
import type { IInputPortInterface } from "@application/interface/port/input-port.interface";
import type { IOutputPortInterface } from "@application/interface/port/output-port.interface";
import type { IPromptStylePortInterface } from "@application/interface/port/prompt-style-port.interface";
import type { IThemePortInterface } from "@application/interface/port/theme-port.interface";
import type { TEnvironmentType } from "@application/type/environment.type";
import type { PromptGroupMultiselectUseCase } from "@application/use-case/prompt/prompt-group-multiselect.use-case";
import type { PromptMultiselectUseCase } from "@application/use-case/prompt/prompt-multiselect.use-case";
import type { PromptSelectUseCase } from "@application/use-case/prompt/prompt-select.use-case";
import type { PromptTextUseCase } from "@application/use-case/prompt/prompt-text.use-case";

import type { IBeanFactoryOptionsInterface } from "../interface/bean-factory-options.interface";

import { ListViewportService } from "@application/service/prompt/list-viewport.service";
import { PromptKeyDispatchService } from "@application/service/prompt/prompt-key-dispatch.service";
import { PromptNavigationService } from "@application/service/prompt/prompt-navigation.service";
import { PromptValidationService } from "@application/service/prompt/prompt-validation.service";
import { TextBufferService } from "@application/service/prompt/text-buffer.service";
import { AnsiTokenizerService } from "@application/service/render/ansi-tokenizer.service";
import { FrameDiffService } from "@application/service/render/frame-diff.service";
import { TextDiffService } from "@application/service/render/text-diff.service";
import { LogMessageUseCase } from "@application/use-case/output/log-message.use-case";
import { ShowNoteUseCase } from "@application/use-case/output/show-note.use-case";
import { SpinnerStartUseCase } from "@application/use-case/spinner/spinner-start.use-case";
import { SpinnerStopUseCase } from "@application/use-case/spinner/spinner-stop.use-case";
import { SpinnerUpdateUseCase } from "@application/use-case/spinner/spinner-update.use-case";
import { BeanAdapter } from "@presentation/bean/adapter";
import { BeanImageRendererService } from "@presentation/bean/service/bean-image-renderer.service";
import { BeanProgressService } from "@presentation/bean/service/bean-progress.service";
import { BeanPromptService } from "@presentation/bean/service/bean-prompt.service";
import { BeanSpinnerManagerService } from "@presentation/bean/service/bean-spinner-manager.service";
import { BeanSpinnerService } from "@presentation/bean/service/bean-spinner.service";
import { BeanStyleService } from "@presentation/bean/service/bean-style.service";
import { BeanTableRendererService } from "@presentation/bean/service/bean-table-renderer.service";
import { BeanTaskRunnerService } from "@presentation/bean/service/bean-task-runner.service";
import { BeanTreeRendererService } from "@presentation/bean/service/bean-tree-renderer.service";

import { NodeClockAdapter } from "../../adapter/clock/node-clock.adapter";
import { NodeEditorAdapter } from "../../adapter/editor/node-editor.adapter";
import { NodeReadlineInputAdapter } from "../../adapter/input/node-readline-input.adapter";
import { NodeTtyOutputAdapter } from "../../adapter/output/node-tty-output.adapter";
import { DefaultPromptStyleAdapter } from "../../adapter/prompt/default-prompt-style.adapter";
import { AnsiRendererAdapter } from "../../adapter/render/ansi-renderer.adapter";
import { DefaultThemeAdapter } from "../../adapter/theme/default-theme.adapter";

import { PromptRunnerFactory } from "./prompt-runner.factory";

const signalCleanupHandlers: Set<() => void> = new Set<() => void>();
let isSignalCleanupRegistered: boolean = false;
const SIGNAL_INTERRUPT_EVENT_CONSTANT: "SIGINT" | "SIGTERM" = "SIGINT";
const SIGNAL_TERMINATE_EVENT_CONSTANT: "SIGINT" | "SIGTERM" = "SIGTERM";

const toError = (reason: unknown): Error => {
	if (reason instanceof Error) {
		return reason;
	}

	return new Error(String(reason));
};

const handleBeforeExit = (): void => {
	runSignalCleanupHandlers();
};

const handleSigint = (): void => {
	runSignalCleanupHandlers();

	process.kill(process.pid, SIGNAL_INTERRUPT_EVENT_CONSTANT);
};

const handleSigterm = (): void => {
	runSignalCleanupHandlers();

	process.kill(process.pid, SIGNAL_TERMINATE_EVENT_CONSTANT);
};

const handleUncaughtException = (error: Error): void => {
	runSignalCleanupHandlers();

	throw error;
};

const handleUnhandledRejection = (reason: unknown): void => {
	runSignalCleanupHandlers();

	throw toError(reason);
};

const registerSignalCleanupHandlers = (): void => {
	process.once("beforeExit", handleBeforeExit);
	process.once("SIGINT", handleSigint);
	process.once("SIGTERM", handleSigterm);
	process.once("uncaughtException", handleUncaughtException);
	process.once("unhandledRejection", handleUnhandledRejection);

	isSignalCleanupRegistered = true;
};

const unregisterSignalCleanupHandlers = (): void => {
	process.off("beforeExit", handleBeforeExit);
	process.off("SIGINT", handleSigint);
	process.off("SIGTERM", handleSigterm);
	process.off("uncaughtException", handleUncaughtException);
	process.off("unhandledRejection", handleUnhandledRejection);

	isSignalCleanupRegistered = false;
};

const runSignalCleanupHandlers = (): void => {
	const cleanupErrors: Array<Error> = [];

	for (const handler of signalCleanupHandlers.values()) {
		try {
			handler();
		} catch (error) {
			cleanupErrors.push(toError(error));
		}
	}
	signalCleanupHandlers.clear();
	unregisterSignalCleanupHandlers();

	if (cleanupErrors.length > 0) {
		const firstCleanupError: Error | undefined = cleanupErrors[0];

		if (firstCleanupError !== undefined) {
			throw firstCleanupError;
		}
	}
};

const setupSignalCleanup = (input: { inputPort: IInputPortInterface; outputPort: IOutputPortInterface; spinnerManagerService: BeanSpinnerManagerService }): (() => void) => {
	const cleanup = (): void => {
		input.spinnerManagerService.dispose();
		input.inputPort.disableRawMode();
		input.outputPort.showCursor();
	};
	signalCleanupHandlers.add(cleanup);

	if (!isSignalCleanupRegistered) {
		registerSignalCleanupHandlers();
	}

	return () => {
		signalCleanupHandlers.delete(cleanup);

		if (signalCleanupHandlers.size === 0 && isSignalCleanupRegistered) {
			unregisterSignalCleanupHandlers();
		}
	};
};

export const createBeanAdapterFactory = (options: IBeanFactoryOptionsInterface = {}): BeanAdapter => {
	const environment: TEnvironmentType = options.environment ?? (process.env as TEnvironmentType);
	const ansiTokenizerService: AnsiTokenizerService = new AnsiTokenizerService();

	const outputAdapterArguments: { ansiTokenizerService: AnsiTokenizerService; environment?: TEnvironmentType; stdout?: WriteStream } = {
		ansiTokenizerService,
		...(options.stdout === undefined ? {} : { stdout: options.stdout }),
		...(options.environment === undefined ? {} : { environment: options.environment }),
	};

	const outputPort: IOutputPortInterface = options.outputPort ?? new NodeTtyOutputAdapter(outputAdapterArguments);

	const inputAdapterArguments: { stdin?: ReadStream } = {
		...(options.stdin === undefined ? {} : { stdin: options.stdin }),
	};

	const inputPort: IInputPortInterface = options.inputPort ?? new NodeReadlineInputAdapter(inputAdapterArguments);

	const clockPort: IClockPortInterface = options.clockPort ?? new NodeClockAdapter();
	const editorPort: IEditorPortInterface = options.editorPort ?? new NodeEditorAdapter();

	const ansiRendererArguments: { environment?: TEnvironmentType; isTTY: boolean } = {
		environment,
		isTTY: outputPort.IS_TTY,
	};
	const ansiRenderer: AnsiRendererAdapter = new AnsiRendererAdapter(ansiRendererArguments);

	const themePort: IThemePortInterface =
		options.themePort ??
		new DefaultThemeAdapter({
			ansiRendererAdapter: ansiRenderer,
		});
	const promptStylePort: IPromptStylePortInterface = options.promptStylePort ?? new DefaultPromptStyleAdapter();

	const promptNavigationService: PromptNavigationService = new PromptNavigationService();
	const promptKeyDispatchService: PromptKeyDispatchService = new PromptKeyDispatchService();
	const listViewportService: ListViewportService = new ListViewportService();
	const textBufferService: TextBufferService = new TextBufferService();
	const promptValidationService: PromptValidationService = new PromptValidationService();
	const frameDiffService: FrameDiffService = new FrameDiffService();
	const textDiffService: TextDiffService = new TextDiffService();

	const promptRunnerFactory: PromptRunnerFactory = new PromptRunnerFactory({
		clockPort,
		inputPort,
		listViewportService,
		outputPort,
		promptKeyDispatchService,
		promptNavigationService,
		promptStylePort,
		promptValidationService,
		textBufferService,
		themePort,
	});

	const promptTextUseCase: PromptTextUseCase = promptRunnerFactory.createPromptTextUseCase();
	const promptSelectUseCase: PromptSelectUseCase = promptRunnerFactory.createPromptSelectUseCase();
	const promptMultiselectUseCase: PromptMultiselectUseCase = promptRunnerFactory.createPromptMultiselectUseCase();
	const promptGroupMultiselectUseCase: PromptGroupMultiselectUseCase = promptRunnerFactory.createPromptGroupMultiselectUseCase();

	const spinnerStartUseCase: SpinnerStartUseCase = new SpinnerStartUseCase({
		clockPort,
		frameDiffService,
		outputPort,
	});
	const spinnerUpdateUseCase: SpinnerUpdateUseCase = new SpinnerUpdateUseCase();

	const spinnerStopUseCase: SpinnerStopUseCase = new SpinnerStopUseCase({
		clockPort,
		outputPort,
		promptStylePort,
	});

	const spinnerService: BeanSpinnerService = new BeanSpinnerService({
		clockPort,
		spinnerStartUseCase,
		spinnerStopUseCase,
		spinnerUpdateUseCase,
		themePort,
	});

	const progressService: BeanProgressService = new BeanProgressService({
		clockPort,
		outputPort,
		themePort,
	});

	const spinnerManagerService: BeanSpinnerManagerService = new BeanSpinnerManagerService({
		clockPort,
		outputPort,
		promptStylePort,
		themePort,
	});
	const imageRendererService: BeanImageRendererService = new BeanImageRendererService();
	const styleService: BeanStyleService = new BeanStyleService();

	const tableRendererService: BeanTableRendererService = new BeanTableRendererService({
		ansiTokenizerService,
	});

	const taskRunnerService: BeanTaskRunnerService = new BeanTaskRunnerService({
		clockPort,
	});
	const treeRendererService: BeanTreeRendererService = new BeanTreeRendererService();

	const logMessageUseCase: LogMessageUseCase = new LogMessageUseCase({
		outputPort,
		themePort,
	});

	const promptService: BeanPromptService = new BeanPromptService({
		editorPort,
		environment,
		isDebugEnabled: options.isDebugEnabled ?? false,
		isSilent: options.isSilent ?? false,
		onLog: (input: { level: "error" | "info" | "success" | "warn"; message: string }): void => {
			if ((options.isSilent ?? false) && input.level !== "error") {
				return;
			}

			logMessageUseCase.execute(input);
		},
		outputPort,
		promptGroupMultiselectUseCase,
		promptMultiselectUseCase,
		promptSelectUseCase,
		promptTextUseCase,
		themePort,
	});

	const showNoteUseCase: ShowNoteUseCase = new ShowNoteUseCase({
		ansiTokenizerService,
		outputPort,
		themePort,
	});

	const disposeSignalCleanup: () => void =
		(options.isSignalHandlingEnabled ?? true)
			? setupSignalCleanup({
					inputPort,
					outputPort,
					spinnerManagerService,
				})
			: (): void => void 0;

	const dispose: () => void = (): void => {
		spinnerManagerService.dispose();
		disposeSignalCleanup();
	};

	return new BeanAdapter({
		dispose,
		environment,
		imageRendererService,
		isSilent: options.isSilent ?? false,
		logMessageUseCase,
		outputPort,
		progressService,
		promptService,
		showNoteUseCase,
		spinnerManagerService,
		spinnerService,
		styleService,
		tableRendererService,
		taskRunnerService,
		textDiffService,
		themePort,
		treeRendererService,
	});
};
