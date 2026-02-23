import type { IOutputPortInterface } from "@application/interface/port/output-port.interface";
import type { IThemePortInterface } from "@application/interface/port/theme-port.interface";
import type { TextDiffService } from "@application/service/render/text-diff.service";
import type { LogMessageUseCase } from "@application/use-case/output/log-message.use-case";
import type { ShowNoteUseCase } from "@application/use-case/output/show-note.use-case";

import type { IBeanMultiselectPromptInputInterface, IBeanSelectPromptInputInterface, IBeanSpinnerHandleInterface, IBeanTextPromptInputInterface } from "../interface";

import type { BeanImageRendererService, BeanProgressService, BeanPromptService, BeanSpinnerManagerService, BeanSpinnerService, BeanStyleService, BeanTableRendererService, BeanTaskRunnerService, BeanTreeRendererService } from "./service";
import type {
	TAutocompleteInputType,
	TBeanBoxInputType,
	TBeanColumnsInputType,
	TBeanConfirmInputType,
	TBeanDateInputType,
	TBeanDiffInputType,
	TBeanDividerInputType,
	TBeanEditorInputType,
	TBeanExpandInputType,
	TBeanGroupInputType,
	TBeanImageInputType,
	TBeanJsonInputType,
	TBeanLinkInputType,
	TBeanListInputType,
	TBeanLogInputType,
	TBeanMessageInputType,
	TBeanMultiProgressHandleType,
	TBeanMultiProgressInputType,
	TBeanNoteInputType,
	TBeanNumberInputType,
	TBeanPasswordInputType,
	TBeanProgressInputType,
	TBeanProgressOptionsType,
	TBeanProgressType,
	TBeanPromptSchemaType,
	TBeanRatingInputType,
	TBeanRawlistInputType,
	TBeanSpinnerInputType,
	TBeanSpinnerManagerHandleType,
	TBeanSpinnerPromiseInputType,
	TBeanStepInputType,
	TBeanStyleGradientInputType,
	TBeanStyleTextInputType,
	TBeanTableInputType,
	TBeanTaskRunnerInputType,
	TBeanTaskRunnerResultType,
	TBeanToggleInputType,
	TBeanTreeNodeType,
	TBeanTreeSelectInputType,
} from "./type";

import { BeanFluentApi } from "./bean-fluent.presenter";
import { BeanStyleFluentApi } from "./bean-style-fluent.presenter";
import { BOX_CONSTANT, COLUMNS_DEFAULT_GAP_CONSTANT, COLUMNS_MIN_WIDTH_CONSTANT, COLUMNS_TRUNCATION_SUFFIX_ASCII_CONSTANT, COLUMNS_TRUNCATION_SUFFIX_UNICODE_CONSTANT, JSON_INDENT_SIZE_CONSTANT, ONE_CONSTANT } from "./constant";
import { BeanProgressNamespace, BeanPromptNamespace, BeanSpinnerNamespace, BeanTaskNamespace } from "./namespace";

export class BeanAdapter {
	private readonly DISPOSE: () => void;

	private readonly ENVIRONMENT: Readonly<Record<string, string | undefined>>;

	private readonly IMAGE_RENDERER_SERVICE: BeanImageRendererService;

	private readonly IS_SILENT: boolean;

	private readonly LOG_MESSAGE_USE_CASE: LogMessageUseCase;

	private readonly OUTPUT_PORT: IOutputPortInterface;

	private readonly PROGRESS_NAMESPACE: BeanProgressNamespace;

	private readonly PROGRESS_SERVICE: BeanProgressService;

	private readonly PROMPT_NAMESPACE: BeanPromptNamespace;

	private readonly PROMPT_SERVICE: BeanPromptService;

	private readonly SHOW_NOTE_USE_CASE: ShowNoteUseCase;

	private readonly SPINNER_MANAGER_SERVICE: BeanSpinnerManagerService;

	private readonly SPINNER_NAMESPACE: BeanSpinnerNamespace;

	private readonly SPINNER_SERVICE: BeanSpinnerService;

	private readonly STYLE_SERVICE: BeanStyleService;

	private readonly TABLE_RENDERER_SERVICE: BeanTableRendererService;

	private readonly TASK_NAMESPACE: BeanTaskNamespace;

	private readonly TASK_RUNNER_SERVICE: BeanTaskRunnerService;

	private readonly TEXT_DIFF_SERVICE: TextDiffService;

	private readonly THEME_PORT: IThemePortInterface;

	private readonly TREE_RENDERER_SERVICE: BeanTreeRendererService;

	public constructor(input: {
		dispose: () => void;
		environment: Readonly<Record<string, string | undefined>>;
		imageRendererService: BeanImageRendererService;
		isSilent: boolean;
		logMessageUseCase: LogMessageUseCase;
		outputPort: IOutputPortInterface;
		progressService: BeanProgressService;
		promptService: BeanPromptService;
		showNoteUseCase: ShowNoteUseCase;
		spinnerManagerService: BeanSpinnerManagerService;
		spinnerService: BeanSpinnerService;
		styleService: BeanStyleService;
		tableRendererService: BeanTableRendererService;
		taskRunnerService: BeanTaskRunnerService;
		textDiffService: TextDiffService;
		themePort: IThemePortInterface;
		treeRendererService: BeanTreeRendererService;
	}) {
		this.DISPOSE = input.dispose;
		this.ENVIRONMENT = input.environment;
		this.IMAGE_RENDERER_SERVICE = input.imageRendererService;
		this.IS_SILENT = input.isSilent;
		this.LOG_MESSAGE_USE_CASE = input.logMessageUseCase;
		this.SHOW_NOTE_USE_CASE = input.showNoteUseCase;
		this.OUTPUT_PORT = input.outputPort;
		this.PROGRESS_SERVICE = input.progressService;
		this.PROMPT_SERVICE = input.promptService;
		this.SPINNER_MANAGER_SERVICE = input.spinnerManagerService;
		this.SPINNER_SERVICE = input.spinnerService;
		this.STYLE_SERVICE = input.styleService;
		this.TABLE_RENDERER_SERVICE = input.tableRendererService;
		this.TASK_RUNNER_SERVICE = input.taskRunnerService;
		this.TEXT_DIFF_SERVICE = input.textDiffService;
		this.THEME_PORT = input.themePort;
		this.TREE_RENDERER_SERVICE = input.treeRendererService;
		this.PROGRESS_NAMESPACE = new BeanProgressNamespace({ beanAdapter: this });
		this.PROMPT_NAMESPACE = new BeanPromptNamespace({ beanAdapter: this });
		this.SPINNER_NAMESPACE = new BeanSpinnerNamespace({ beanAdapter: this });
		this.TASK_NAMESPACE = new BeanTaskNamespace({ beanAdapter: this });
	}

	public async autocomplete(input: TAutocompleteInputType): Promise<null | string> {
		return await this.PROMPT_SERVICE.autocomplete(input);
	}

	public box(input: TBeanBoxInputType): void {
		const lines: Array<string> = input.message.split("\n");
		const title: string | undefined = input.title?.trim();

		const contentWidth: number = Math.max(title?.length ?? 0, ...lines.map((line: string): number => line.length), ONE_CONSTANT);
		const horizontal: string = (this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? BOX_CONSTANT.UNICODE_HORIZONTAL : BOX_CONSTANT.ASCII_HORIZONTAL).repeat(contentWidth + BOX_CONSTANT.DOUBLE_SIDE_PADDING);
		const topLeft: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? BOX_CONSTANT.UNICODE_TOP_LEFT : BOX_CONSTANT.ASCII_TOP_LEFT;
		const topRight: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? BOX_CONSTANT.UNICODE_TOP_RIGHT : BOX_CONSTANT.ASCII_TOP_RIGHT;
		const bottomLeft: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? BOX_CONSTANT.UNICODE_BOTTOM_LEFT : BOX_CONSTANT.ASCII_BOTTOM_LEFT;
		const bottomRight: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? BOX_CONSTANT.UNICODE_BOTTOM_RIGHT : BOX_CONSTANT.ASCII_BOTTOM_RIGHT;
		const separatorLeft: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? BOX_CONSTANT.UNICODE_SEPARATOR_LEFT : BOX_CONSTANT.ASCII_SEPARATOR_LEFT;
		const separatorRight: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? BOX_CONSTANT.UNICODE_SEPARATOR_RIGHT : BOX_CONSTANT.ASCII_SEPARATOR_RIGHT;
		const vertical: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? BOX_CONSTANT.UNICODE_VERTICAL : BOX_CONSTANT.ASCII_VERTICAL;

		this.OUTPUT_PORT.writeLine(this.THEME_PORT.muted(`${topLeft}${horizontal}${topRight}`));

		if (title !== undefined && title.length > 0) {
			this.OUTPUT_PORT.writeLine(`${this.THEME_PORT.muted(vertical)} ${this.THEME_PORT.accent(title.padEnd(contentWidth, " "))} ${this.THEME_PORT.muted(vertical)}`);
			this.OUTPUT_PORT.writeLine(this.THEME_PORT.muted(`${separatorLeft}${horizontal}${separatorRight}`));
		}

		for (const line of lines) {
			this.OUTPUT_PORT.writeLine(`${this.THEME_PORT.muted(vertical)} ${line.padEnd(contentWidth, " ")} ${this.THEME_PORT.muted(vertical)}`);
		}

		this.OUTPUT_PORT.writeLine(this.THEME_PORT.muted(`${bottomLeft}${horizontal}${bottomRight}`));
	}

	public colorLevel(): number {
		return this.STYLE_SERVICE.resolveColorLevel({
			environment: this.ENVIRONMENT,
			isTTY: this.OUTPUT_PORT.IS_TTY,
		});
	}

	public columns(input: TBeanColumnsInputType): void {
		if (input.columns.length === 0) {
			this.OUTPUT_PORT.writeLine("");

			return;
		}

		const gapSize: number = Math.max(input.gap ?? COLUMNS_DEFAULT_GAP_CONSTANT, ONE_CONSTANT);
		const gapCount: number = Math.max(input.columns.length - ONE_CONSTANT, 0);
		const totalGapWidth: number = gapCount * gapSize;
		const availableWidth: number = Math.max(this.OUTPUT_PORT.COLUMNS - totalGapWidth, input.columns.length);
		const columnWidth: number = Math.max(Math.floor(availableWidth / input.columns.length), COLUMNS_MIN_WIDTH_CONSTANT);
		const gapText: string = " ".repeat(gapSize);

		const renderedColumns: Array<string> = input.columns.map((column: string): string =>
			this.formatColumnCell({
				maxWidth: columnWidth,
				text: column,
			}),
		);
		this.OUTPUT_PORT.writeLine(renderedColumns.join(gapText));
	}

	public async confirm(input: TBeanConfirmInputType): Promise<boolean | null> {
		return await this.PROMPT_SERVICE.confirm(input);
	}

	public createMultiProgress(input: TBeanMultiProgressInputType = {}): TBeanMultiProgressHandleType {
		return this.PROGRESS_SERVICE.createMultiProgress(input);
	}

	public createProgress(input: TBeanProgressOptionsType): TBeanProgressType {
		return this.PROGRESS_SERVICE.createProgress(input);
	}

	public createTheme(input: Partial<IThemePortInterface>): IThemePortInterface {
		return {
			accent: (text: string): string => input.accent?.(text) ?? this.THEME_PORT.accent(text),
			danger: (text: string): string => input.danger?.(text) ?? this.THEME_PORT.danger(text),
			info: (text: string): string => input.info?.(text) ?? this.THEME_PORT.info(text),
			muted: (text: string): string => input.muted?.(text) ?? this.THEME_PORT.muted(text),
			strong: (text: string): string => input.strong?.(text) ?? this.THEME_PORT.strong(text),
			success: (text: string): string => input.success?.(text) ?? this.THEME_PORT.success(text),
		};
	}

	public async date(input: TBeanDateInputType): Promise<Date | null> {
		return await this.PROMPT_SERVICE.date(input);
	}

	public diff(input: TBeanDiffInputType): void {
		const beforeLines: Array<string> = input.before.split("\n");
		const afterLines: Array<string> = input.after.split("\n");
		const outputLines: Array<string> = [];

		const operations: Array<{ line: string; type: "delete" | "equal" | "insert" }> = this.TEXT_DIFF_SERVICE.buildOperations({
			afterLines,
			beforeLines,
		});

		if (input.labelBefore !== undefined) {
			outputLines.push(this.THEME_PORT.muted(`--- ${input.labelBefore}`));
		}

		if (input.labelAfter !== undefined) {
			outputLines.push(this.THEME_PORT.muted(`+++ ${input.labelAfter}`));
		}

		for (const operation of operations) {
			if (operation.type === "equal") {
				outputLines.push(`  ${operation.line}`);

				continue;
			}

			if (operation.type === "delete") {
				outputLines.push(this.THEME_PORT.danger(`- ${operation.line}`));

				continue;
			}

			outputLines.push(this.THEME_PORT.success(`+ ${operation.line}`));
		}

		this.OUTPUT_PORT.writeLine(outputLines.join("\n"));
	}

	public dispose(): void {
		this.DISPOSE();
	}

	public divider(input: TBeanDividerInputType = {}): void {
		const dividerCharacter: string = (input.char ?? "─").slice(0, 1);
		const width: number = Math.max(input.width ?? this.OUTPUT_PORT.COLUMNS, 1);
		this.OUTPUT_PORT.writeLine(this.THEME_PORT.muted(dividerCharacter.repeat(width)));
	}

	public async editor(input: TBeanEditorInputType): Promise<null | string> {
		return await this.PROMPT_SERVICE.editor(input);
	}

	public async expand(input: TBeanExpandInputType): Promise<null | string> {
		return await this.PROMPT_SERVICE.expand(input);
	}

	public fluent(): BeanFluentApi {
		return new BeanFluentApi({ beanAdapter: this });
	}

	public async group(input: TBeanGroupInputType): Promise<null | Readonly<Record<string, unknown>>> {
		return await this.PROMPT_SERVICE.group(input);
	}

	public async groupMultiselect(input: IBeanMultiselectPromptInputInterface): Promise<null | ReadonlyArray<string>> {
		return await this.PROMPT_SERVICE.groupMultiselect(input);
	}

	public image(input: TBeanImageInputType): void {
		const maxWidth: number = Math.max(Math.min(input.maxWidth ?? this.OUTPUT_PORT.COLUMNS, this.OUTPUT_PORT.COLUMNS), ONE_CONSTANT);

		const renderedImage: string = this.IMAGE_RENDERER_SERVICE.render({
			isUnicodeSupported: this.OUTPUT_PORT.IS_UNICODE_SUPPORTED,
			maxWidth,
			pixels: input.pixels,
		});

		if (renderedImage.length > 0) {
			this.OUTPUT_PORT.writeLine(renderedImage);

			return;
		}

		if (input.alt !== undefined) {
			this.OUTPUT_PORT.writeLine(input.alt);
		}
	}

	public intro(input: TBeanMessageInputType): void {
		this.message({
			message: this.THEME_PORT.strong(input.message),
		});
	}

	public isCancel(value: unknown): boolean {
		return value === null;
	}

	public json(input: TBeanJsonInputType): void {
		const text: string = (input.isPretty ?? true) ? JSON.stringify(input.value, null, JSON_INDENT_SIZE_CONSTANT) : JSON.stringify(input.value);
		this.OUTPUT_PORT.writeLine(text);
	}

	public link(input: TBeanLinkInputType): void {
		if (this.OUTPUT_PORT.IS_TTY) {
			this.OUTPUT_PORT.writeLine(`\u001B]8;;${input.url}\u0007${input.label}\u001B]8;;\u0007`);

			return;
		}

		this.OUTPUT_PORT.writeLine(`${input.label} (${input.url})`);
	}

	public async list(input: TBeanListInputType): Promise<null | ReadonlyArray<string>> {
		return await this.PROMPT_SERVICE.list(input);
	}

	public log(input: TBeanLogInputType): void {
		if (this.IS_SILENT && input.level !== "error") {
			return;
		}

		this.LOG_MESSAGE_USE_CASE.execute(input);
	}

	public message(input: TBeanMessageInputType): void {
		this.OUTPUT_PORT.writeLine(input.message);
	}

	public async multiselect(input: IBeanMultiselectPromptInputInterface): Promise<null | ReadonlyArray<string>> {
		return await this.PROMPT_SERVICE.multiselect(input);
	}

	public note(input: TBeanNoteInputType): void {
		this.SHOW_NOTE_USE_CASE.execute(input);
	}

	public async number(input: TBeanNumberInputType): Promise<null | number> {
		return await this.PROMPT_SERVICE.number(input);
	}

	public outro(input: TBeanMessageInputType): void {
		this.message({
			message: this.THEME_PORT.success(input.message),
		});
	}

	public async password(input: TBeanPasswordInputType): Promise<null | string> {
		return await this.PROMPT_SERVICE.password(input);
	}

	public progress(input: TBeanProgressInputType): void {
		this.PROGRESS_SERVICE.progress(input);
	}

	public progressNamespace(): BeanProgressNamespace {
		return this.PROGRESS_NAMESPACE;
	}

	public async promptFromSchema(input: { fallbackValues?: Readonly<Record<string, unknown>>; schema: TBeanPromptSchemaType }): Promise<null | Readonly<Record<string, unknown>>> {
		return await this.PROMPT_SERVICE.promptFromSchema(input);
	}

	public promptNamespace(): BeanPromptNamespace {
		return this.PROMPT_NAMESPACE;
	}

	public async rating(input: TBeanRatingInputType): Promise<null | number> {
		return await this.PROMPT_SERVICE.rating(input);
	}

	public async rawlist(input: TBeanRawlistInputType): Promise<null | string> {
		return await this.PROMPT_SERVICE.rawlist(input);
	}

	public runTasks(input: TBeanTaskRunnerInputType): Promise<TBeanTaskRunnerResultType> {
		return this.TASK_RUNNER_SERVICE.run({
			...input,
			log: (logInput: { level: "error" | "info" | "success" | "warn"; message: string }): void => {
				this.log(logInput);
			},
		});
	}

	public async select(input: IBeanSelectPromptInputInterface): Promise<null | string> {
		return await this.PROMPT_SERVICE.select(input);
	}

	public spinner(input: TBeanSpinnerInputType): IBeanSpinnerHandleInterface {
		return this.SPINNER_SERVICE.spinner(input);
	}

	public spinnerManager(input: { frames?: ReadonlyArray<string>; intervalMs?: number } = {}): TBeanSpinnerManagerHandleType {
		return this.SPINNER_MANAGER_SERVICE.create(input);
	}

	public spinnerNamespace(): BeanSpinnerNamespace {
		return this.SPINNER_NAMESPACE;
	}

	public async spinnerPromise<TResult>(input: TBeanSpinnerPromiseInputType<TResult>): Promise<TResult> {
		return await this.SPINNER_SERVICE.spinnerPromise(input);
	}

	public step(input: TBeanStepInputType): void {
		this.message({
			message: `• ${input.message}`,
		});
	}

	public style(input: TBeanStyleTextInputType): string {
		return this.STYLE_SERVICE.style({
			...input,
			colorLevel: this.colorLevel(),
		});
	}

	public style256(input: { color: number; text: string }): string {
		return this.styleWithForegroundColor({
			color: input.color,
			text: input.text,
		});
	}

	public styleBg256(input: { color: number; text: string }): string {
		return this.styleWithBackgroundColor({
			background: input.color,
			text: input.text,
		});
	}

	public styleBgHex(input: { color: string; text: string }): string {
		const normalizedColor: string = input.color.toLowerCase();

		return this.styleWithBackgroundColor({
			background: normalizedColor,
			text: input.text,
		});
	}

	public styleBgRgb(input: { rgb: { b: number; g: number; r: number }; text: string }): string {
		return this.styleWithBackgroundColor({
			background: input.rgb,
			text: input.text,
		});
	}

	public styleBright(input: { color: "black" | "blue" | "cyan" | "green" | "magenta" | "red" | "white" | "yellow"; text: string }): string {
		return this.STYLE_SERVICE.styleBright({
			color: input.color,
			colorLevel: this.colorLevel(),
			text: input.text,
		});
	}

	public styleChain(input: Omit<TBeanStyleTextInputType, "text"> = {}): BeanStyleFluentApi {
		return new BeanStyleFluentApi({
			beanAdapter: this,
			styleState: input,
		});
	}

	public styleGradient(input: TBeanStyleGradientInputType): string {
		return this.STYLE_SERVICE.gradient({
			...input,
			colorLevel: this.colorLevel(),
		});
	}

	public styleHex(input: { color: string; text: string }): string {
		const normalizedColor: string = input.color.toLowerCase();

		return this.styleWithForegroundColor({
			color: normalizedColor,
			text: input.text,
		});
	}

	public styleRgb(input: { rgb: { b: number; g: number; r: number }; text: string }): string {
		return this.styleWithForegroundColor({
			color: input.rgb,
			text: input.text,
		});
	}

	public styleTemplate(input: Omit<TBeanStyleTextInputType, "text"> = {}): (strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>) => string {
		const styleChain: BeanStyleFluentApi = this.styleChain(input);

		return (strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>): string => {
			return styleChain.template(strings, ...values);
		};
	}

	public table(input: TBeanTableInputType): void {
		this.OUTPUT_PORT.writeLine(this.TABLE_RENDERER_SERVICE.render(input));
	}

	public taskNamespace(): BeanTaskNamespace {
		return this.TASK_NAMESPACE;
	}

	public async text(input: IBeanTextPromptInputInterface): Promise<null | string> {
		return await this.PROMPT_SERVICE.text(input);
	}

	public async toggle(input: TBeanToggleInputType): Promise<boolean | null> {
		return await this.PROMPT_SERVICE.toggle(input);
	}

	public tree(input: TBeanTreeNodeType): void {
		this.OUTPUT_PORT.writeLine(this.TREE_RENDERER_SERVICE.render(input));
	}

	public async treeSelect(input: TBeanTreeSelectInputType): Promise<null | ReadonlyArray<string>> {
		return await this.PROMPT_SERVICE.treeSelect(input);
	}

	private formatColumnCell(input: { maxWidth: number; text: string }): string {
		if (input.text.length <= input.maxWidth) {
			return input.text.padEnd(input.maxWidth, " ");
		}

		const truncationSuffix: string = this.OUTPUT_PORT.IS_UNICODE_SUPPORTED ? COLUMNS_TRUNCATION_SUFFIX_UNICODE_CONSTANT : COLUMNS_TRUNCATION_SUFFIX_ASCII_CONSTANT;

		if (input.maxWidth <= truncationSuffix.length) {
			return truncationSuffix.slice(0, input.maxWidth);
		}

		const visibleTextWidth: number = input.maxWidth - truncationSuffix.length;

		return `${input.text.slice(0, visibleTextWidth)}${truncationSuffix}`;
	}

	private styleWithBackgroundColor(input: { background: { b: number; g: number; r: number } | number | string; text: string }): string {
		return this.style({
			background: input.background,
			text: input.text,
		});
	}

	private styleWithForegroundColor(input: { color: { b: number; g: number; r: number } | number | string; text: string }): string {
		return this.style({
			color: input.color,
			text: input.text,
		});
	}
}
