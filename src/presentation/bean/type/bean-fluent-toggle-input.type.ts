export type TBeanFluentToggleInputType = {
	isDefaultValue?: boolean;
	isFallbackValue?: boolean;
	message: string;
	offLabel?: string;
	onLabel?: string;
	onResolved?: (value: boolean | null) => void;
};
