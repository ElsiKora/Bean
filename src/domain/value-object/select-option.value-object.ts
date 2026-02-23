export class SelectOptionValueObject {
	public get description(): null | string {
		return this.DESCRIPTION;
	}

	public get group(): null | string {
		return this.GROUP;
	}

	public get hint(): null | string {
		return this.HINT;
	}

	public get isDisabled(): boolean {
		return this.IS_DISABLED;
	}

	public get isSeparator(): boolean {
		return this.IS_SEPARATOR;
	}

	public get label(): string {
		return this.LABEL;
	}

	public get shortKey(): null | string {
		return this.SHORT_KEY;
	}

	public get value(): string {
		return this.VALUE;
	}

	private readonly DESCRIPTION: null | string;

	private readonly GROUP: null | string;

	private readonly HINT: null | string;

	private readonly IS_DISABLED: boolean;

	private readonly IS_SEPARATOR: boolean;

	private readonly LABEL: string;

	private readonly SHORT_KEY: null | string;

	private readonly VALUE: string;

	public constructor(input: { description?: string; group?: string; hint?: string; isDisabled?: boolean; isSeparator?: boolean; label: string; shortKey?: string; value: string }) {
		this.DESCRIPTION = input.description ?? null;
		this.LABEL = input.label;
		this.VALUE = input.value;
		this.GROUP = input.group ?? null;
		this.HINT = input.hint ?? null;
		this.IS_DISABLED = input.isDisabled ?? false;
		this.IS_SEPARATOR = input.isSeparator ?? false;
		this.SHORT_KEY = input.shortKey ?? null;
	}
}
