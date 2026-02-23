export type TBeanSpinnerPromiseInputType<TResult> = {
	failText?: string;
	successText?: string;
	task: () => Promise<TResult>;
	text: string;
};
