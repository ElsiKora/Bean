import type { BeanAdapter } from "../adapter";
import type { TBeanTaskRunnerInputType, TBeanTaskRunnerResultType } from "../type";

export class BeanTaskNamespace {
	private readonly BEAN_ADAPTER: BeanAdapter;

	public constructor(input: { beanAdapter: BeanAdapter }) {
		this.BEAN_ADAPTER = input.beanAdapter;
	}

	public async run(input: TBeanTaskRunnerInputType): Promise<TBeanTaskRunnerResultType> {
		return await this.BEAN_ADAPTER.runTasks(input);
	}
}
