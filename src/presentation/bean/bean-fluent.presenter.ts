import type { IBeanSpinnerHandleInterface } from "../interface";

import type { BeanAdapter } from "./adapter";
import type { TBeanFluentConfirmInputType } from "./type/bean-fluent-confirm-input.type";
import type { TBeanFluentDateInputType } from "./type/bean-fluent-date-input.type";
import type { TBeanFluentEditorInputType } from "./type/bean-fluent-editor-input.type";
import type { TBeanFluentGroupMultiselectInputType } from "./type/bean-fluent-group-multiselect-input.type";
import type { TBeanFluentListInputType } from "./type/bean-fluent-list-input.type";
import type { TBeanFluentMultiselectInputType } from "./type/bean-fluent-multiselect-input.type";
import type { TBeanFluentNumberInputType } from "./type/bean-fluent-number-input.type";
import type { TBeanFluentPasswordInputType } from "./type/bean-fluent-password-input.type";
import type { TBeanFluentSelectInputType } from "./type/bean-fluent-select-input.type";
import type { TBeanFluentSpinnerInputType } from "./type/bean-fluent-spinner-input.type";
import type { TBeanFluentTextInputType } from "./type/bean-fluent-text-input.type";
import type { TBeanFluentToggleInputType } from "./type/bean-fluent-toggle-input.type";

export class BeanFluentApi {
	private readonly ACTIONS: Array<() => Promise<boolean>> = [];

	private readonly BEAN_ADAPTER: BeanAdapter;

	public constructor(input: { beanAdapter: BeanAdapter }) {
		this.BEAN_ADAPTER = input.beanAdapter;
	}

	public confirm(input: TBeanFluentConfirmInputType): this {
		return this.queueAction(async (): Promise<boolean> => {
			const isConfirmedValue: boolean | null = await this.BEAN_ADAPTER.confirm(input);
			input.onResolved?.(isConfirmedValue);

			return isConfirmedValue !== null;
		});
	}

	public date(input: TBeanFluentDateInputType): this {
		return this.queueAction(async (): Promise<boolean> => {
			const value: Date | null = await this.BEAN_ADAPTER.date(input);
			input.onResolved?.(value);

			return value !== null;
		});
	}

	public editor(input: TBeanFluentEditorInputType): this {
		return this.queueAction(async (): Promise<boolean> => {
			const value: null | string = await this.BEAN_ADAPTER.editor(input);
			input.onResolved?.(value);

			return value !== null;
		});
	}

	public groupMultiselect(input: TBeanFluentGroupMultiselectInputType): this {
		return this.queueAction(async (): Promise<boolean> => {
			const value: null | ReadonlyArray<string> = await this.BEAN_ADAPTER.groupMultiselect(input);
			input.onResolved?.(value);

			return value !== null;
		});
	}

	public intro(message: string): this {
		return this.queueAction((): Promise<boolean> => {
			this.BEAN_ADAPTER.intro({ message });

			return Promise.resolve(true);
		});
	}

	public list(input: TBeanFluentListInputType): this {
		return this.queueAction(async (): Promise<boolean> => {
			const value: null | ReadonlyArray<string> = await this.BEAN_ADAPTER.list(input);
			input.onResolved?.(value);

			return value !== null;
		});
	}

	public message(message: string): this {
		return this.queueAction((): Promise<boolean> => {
			this.BEAN_ADAPTER.message({ message });

			return Promise.resolve(true);
		});
	}

	public multiselect(input: TBeanFluentMultiselectInputType): this {
		return this.queueAction(async (): Promise<boolean> => {
			const value: null | ReadonlyArray<string> = await this.BEAN_ADAPTER.multiselect(input);
			input.onResolved?.(value);

			return value !== null;
		});
	}

	public number(input: TBeanFluentNumberInputType): this {
		return this.queueAction(async (): Promise<boolean> => {
			const value: null | number = await this.BEAN_ADAPTER.number(input);
			input.onResolved?.(value);

			return value !== null;
		});
	}

	public outro(message: string): this {
		return this.queueAction((): Promise<boolean> => {
			this.BEAN_ADAPTER.outro({ message });

			return Promise.resolve(true);
		});
	}

	public password(input: TBeanFluentPasswordInputType): this {
		return this.queueAction(async (): Promise<boolean> => {
			const value: null | string = await this.BEAN_ADAPTER.password(input);
			input.onResolved?.(value);

			return value !== null;
		});
	}

	public async run(): Promise<void> {
		for (const action of this.ACTIONS) {
			const shouldContinue: boolean = await action();

			if (!shouldContinue) {
				return;
			}
		}
	}

	public select(input: TBeanFluentSelectInputType): this {
		return this.queueAction(async (): Promise<boolean> => {
			const value: null | string = await this.BEAN_ADAPTER.select(input);
			input.onResolved?.(value);

			return value !== null;
		});
	}

	public spinner(input: TBeanFluentSpinnerInputType): this {
		return this.queueAction(async (): Promise<boolean> => {
			const spinnerHandle: IBeanSpinnerHandleInterface = this.BEAN_ADAPTER.spinner({
				intervalMs: input.intervalMs,
				isElapsedTimeEnabled: input.isElapsedTimeEnabled,
				onStateChange: input.onStateChange,
				prefix: input.prefix,
				text: input.text,
			});

			if (input.task === undefined) {
				spinnerHandle.stop();

				return true;
			}

			try {
				await Promise.resolve(input.task(spinnerHandle));

				if (spinnerHandle.isSpinning) {
					spinnerHandle.succeed();
				}
			} catch (error) {
				if (spinnerHandle.isSpinning) {
					spinnerHandle.fail(error instanceof Error ? error.message : "Unknown error");
				}

				throw error;
			}

			return true;
		});
	}

	public step(message: string): this {
		return this.queueAction((): Promise<boolean> => {
			this.BEAN_ADAPTER.step({ message });

			return Promise.resolve(true);
		});
	}

	public text(input: TBeanFluentTextInputType): this {
		return this.queueAction(async (): Promise<boolean> => {
			const value: null | string = await this.BEAN_ADAPTER.text(input);
			input.onResolved?.(value);

			return value !== null;
		});
	}

	public toggle(input: TBeanFluentToggleInputType): this {
		return this.queueAction(async (): Promise<boolean> => {
			const isToggledValue: boolean | null = await this.BEAN_ADAPTER.toggle(input);
			input.onResolved?.(isToggledValue);

			return isToggledValue !== null;
		});
	}

	private queueAction(action: () => Promise<boolean>): this {
		this.ACTIONS.push(action);

		return this;
	}
}
