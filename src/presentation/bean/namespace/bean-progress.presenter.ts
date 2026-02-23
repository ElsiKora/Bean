import type { BeanAdapter } from "../adapter";
import type { TBeanMultiProgressHandleType, TBeanMultiProgressInputType, TBeanProgressInputType, TBeanProgressOptionsType, TBeanProgressType } from "../type";

export class BeanProgressNamespace {
	private readonly BEAN_ADAPTER: BeanAdapter;

	public constructor(input: { beanAdapter: BeanAdapter }) {
		this.BEAN_ADAPTER = input.beanAdapter;
	}

	public create(input: TBeanProgressOptionsType): TBeanProgressType {
		return this.BEAN_ADAPTER.createProgress(input);
	}

	public createMulti(input: TBeanMultiProgressInputType = {}): TBeanMultiProgressHandleType {
		return this.BEAN_ADAPTER.createMultiProgress(input);
	}

	public render(input: TBeanProgressInputType): void {
		this.BEAN_ADAPTER.progress(input);
	}
}
