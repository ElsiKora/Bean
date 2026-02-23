import type { IBeanMultiselectPromptInputInterface, IBeanSelectPromptInputInterface, IBeanTextPromptInputInterface } from "../../interface";
import type { BeanAdapter } from "../adapter";
import type { TAutocompleteInputType, TBeanConfirmInputType, TBeanDateInputType, TBeanEditorInputType, TBeanExpandInputType, TBeanGroupInputType, TBeanListInputType, TBeanNumberInputType, TBeanPasswordInputType, TBeanPromptSchemaType, TBeanRatingInputType, TBeanRawlistInputType, TBeanToggleInputType, TBeanTreeSelectInputType } from "../type";

export class BeanPromptNamespace {
	private readonly BEAN_ADAPTER: BeanAdapter;

	public constructor(input: { beanAdapter: BeanAdapter }) {
		this.BEAN_ADAPTER = input.beanAdapter;
	}

	public async autocomplete(input: TAutocompleteInputType): Promise<null | string> {
		return await this.BEAN_ADAPTER.autocomplete(input);
	}

	public async confirm(input: TBeanConfirmInputType): Promise<boolean | null> {
		return await this.BEAN_ADAPTER.confirm(input);
	}

	public async date(input: TBeanDateInputType): Promise<Date | null> {
		return await this.BEAN_ADAPTER.date(input);
	}

	public async editor(input: TBeanEditorInputType): Promise<null | string> {
		return await this.BEAN_ADAPTER.editor(input);
	}

	public async expand(input: TBeanExpandInputType): Promise<null | string> {
		return await this.BEAN_ADAPTER.expand(input);
	}

	public async group(input: TBeanGroupInputType): Promise<null | Readonly<Record<string, unknown>>> {
		return await this.BEAN_ADAPTER.group(input);
	}

	public async groupMultiselect(input: IBeanMultiselectPromptInputInterface): Promise<null | ReadonlyArray<string>> {
		return await this.BEAN_ADAPTER.groupMultiselect(input);
	}

	public isCancel(value: unknown): boolean {
		return this.BEAN_ADAPTER.isCancel(value);
	}

	public async list(input: TBeanListInputType): Promise<null | ReadonlyArray<string>> {
		return await this.BEAN_ADAPTER.list(input);
	}

	public async multiselect(input: IBeanMultiselectPromptInputInterface): Promise<null | ReadonlyArray<string>> {
		return await this.BEAN_ADAPTER.multiselect(input);
	}

	public async number(input: TBeanNumberInputType): Promise<null | number> {
		return await this.BEAN_ADAPTER.number(input);
	}

	public async password(input: TBeanPasswordInputType): Promise<null | string> {
		return await this.BEAN_ADAPTER.password(input);
	}

	public async promptFromSchema(input: { fallbackValues?: Readonly<Record<string, unknown>>; schema: TBeanPromptSchemaType }): Promise<null | Readonly<Record<string, unknown>>> {
		return await this.BEAN_ADAPTER.promptFromSchema(input);
	}

	public async rating(input: TBeanRatingInputType): Promise<null | number> {
		return await this.BEAN_ADAPTER.rating(input);
	}

	public async rawlist(input: TBeanRawlistInputType): Promise<null | string> {
		return await this.BEAN_ADAPTER.rawlist(input);
	}

	public async select(input: IBeanSelectPromptInputInterface): Promise<null | string> {
		return await this.BEAN_ADAPTER.select(input);
	}

	public async text(input: IBeanTextPromptInputInterface): Promise<null | string> {
		return await this.BEAN_ADAPTER.text(input);
	}

	public async toggle(input: TBeanToggleInputType): Promise<boolean | null> {
		return await this.BEAN_ADAPTER.toggle(input);
	}

	public async treeSelect(input: TBeanTreeSelectInputType): Promise<null | ReadonlyArray<string>> {
		return await this.BEAN_ADAPTER.treeSelect(input);
	}
}
