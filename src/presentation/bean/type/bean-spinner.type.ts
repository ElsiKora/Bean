import type { TBeanSpinnerStateChangeType } from "./bean-spinner-state-change.type";

export type TBeanSpinnerInputType = {
	frames?: ReadonlyArray<string>;
	intervalMs?: number;
	isElapsedTimeEnabled?: boolean;
	onStateChange?: (input: TBeanSpinnerStateChangeType) => void;
	prefix?: string;
	text: string;
};
