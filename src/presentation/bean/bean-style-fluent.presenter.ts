import type { BeanAdapter } from "./adapter";
import type { TBeanColorType } from "./type";
import type { TBeanStyleBrightColorType } from "./type/bean-style-bright-color.type";
import type { TBeanStyleChainStateType } from "./type/bean-style-chain-state.type";

const joinTemplateLiteralParts = (input: { strings: TemplateStringsArray; values: ReadonlyArray<unknown> }): string => {
	let output: string = "";

	for (const [index, part] of input.strings.entries()) {
		output += part;

		if (index < input.values.length) {
			output += String(input.values[index]);
		}
	}

	return output;
};

export class BeanStyleFluentApi {
	private readonly BEAN_ADAPTER: BeanAdapter;

	private readonly STYLE_STATE: TBeanStyleChainStateType;

	public constructor(input: { beanAdapter: BeanAdapter; styleState?: TBeanStyleChainStateType }) {
		this.BEAN_ADAPTER = input.beanAdapter;
		this.STYLE_STATE = input.styleState ?? {};
	}

	public background(color: TBeanColorType): BeanStyleFluentApi {
		return this.with({
			background: color,
		});
	}

	public black(): BeanStyleFluentApi {
		return this.bright("black");
	}

	public blue(): BeanStyleFluentApi {
		return this.bright("blue");
	}

	public bold(): BeanStyleFluentApi {
		return this.with({
			isBold: true,
		});
	}

	public bright(color: TBeanStyleBrightColorType): BeanStyleFluentApi {
		return this.with({
			brightColor: color,
		});
	}

	public color(color: TBeanColorType): BeanStyleFluentApi {
		return this.with({
			color,
		});
	}

	public cyan(): BeanStyleFluentApi {
		return this.bright("cyan");
	}

	public dim(): BeanStyleFluentApi {
		return this.with({
			isDim: true,
		});
	}

	public green(): BeanStyleFluentApi {
		return this.bright("green");
	}

	public hidden(): BeanStyleFluentApi {
		return this.with({
			isHidden: true,
		});
	}

	public inverse(): BeanStyleFluentApi {
		return this.with({
			isInverse: true,
		});
	}

	public italic(): BeanStyleFluentApi {
		return this.with({
			isItalic: true,
		});
	}

	public magenta(): BeanStyleFluentApi {
		return this.bright("magenta");
	}

	public overline(): BeanStyleFluentApi {
		return this.with({
			isOverline: true,
		});
	}

	public red(): BeanStyleFluentApi {
		return this.bright("red");
	}

	public render(text: string): string {
		const styledText: string = this.BEAN_ADAPTER.style({
			background: this.STYLE_STATE.background,
			color: this.STYLE_STATE.color,
			isBold: this.STYLE_STATE.isBold,
			isDim: this.STYLE_STATE.isDim,
			isHidden: this.STYLE_STATE.isHidden,
			isInverse: this.STYLE_STATE.isInverse,
			isItalic: this.STYLE_STATE.isItalic,
			isOverline: this.STYLE_STATE.isOverline,
			isStrikethrough: this.STYLE_STATE.isStrikethrough,
			isUnderline: this.STYLE_STATE.isUnderline,
			text,
		});

		if (this.STYLE_STATE.brightColor === undefined) {
			return styledText;
		}

		return this.BEAN_ADAPTER.styleBright({
			color: this.STYLE_STATE.brightColor,
			text: styledText,
		});
	}

	public strikethrough(): BeanStyleFluentApi {
		return this.with({
			isStrikethrough: true,
		});
	}

	public template(strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>): string {
		return this.render(
			joinTemplateLiteralParts({
				strings,
				values,
			}),
		);
	}

	public underline(): BeanStyleFluentApi {
		return this.with({
			isUnderline: true,
		});
	}

	public white(): BeanStyleFluentApi {
		return this.bright("white");
	}

	public yellow(): BeanStyleFluentApi {
		return this.bright("yellow");
	}

	private with(input: Partial<TBeanStyleChainStateType>): BeanStyleFluentApi {
		return new BeanStyleFluentApi({
			beanAdapter: this.BEAN_ADAPTER,
			styleState: {
				...this.STYLE_STATE,
				...input,
			},
		});
	}
}
