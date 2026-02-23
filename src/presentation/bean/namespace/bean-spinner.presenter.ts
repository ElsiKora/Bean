import type { IBeanSpinnerHandleInterface } from "../../interface";
import type { BeanAdapter } from "../adapter";
import type { TBeanSpinnerInputType, TBeanSpinnerManagerHandleType, TBeanSpinnerPromiseInputType } from "../type";

export class BeanSpinnerNamespace {
	private readonly BEAN_ADAPTER: BeanAdapter;

	public constructor(input: { beanAdapter: BeanAdapter }) {
		this.BEAN_ADAPTER = input.beanAdapter;
	}

	public create(input: TBeanSpinnerInputType): IBeanSpinnerHandleInterface {
		return this.BEAN_ADAPTER.spinner(input);
	}

	public createManager(input: { frames?: ReadonlyArray<string>; intervalMs?: number } = {}): TBeanSpinnerManagerHandleType {
		return this.BEAN_ADAPTER.spinnerManager(input);
	}

	public async track<TResult>(input: TBeanSpinnerPromiseInputType<TResult>): Promise<TResult> {
		return await this.BEAN_ADAPTER.spinnerPromise(input);
	}
}
