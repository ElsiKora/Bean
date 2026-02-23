export type TBeanFluentConfirmInputType = {
	isDefaultValue?: boolean;
	isFallbackValue?: boolean;
	message: string;
	onResolved?: (value: boolean | null) => void;
};
