export interface IBeanSpinnerHandleInterface {
	fail(text?: string): void;
	info(text?: string): void;
	readonly isSpinning: boolean;
	stop(text?: string): void;
	succeed(text?: string): void;
	update(text: string): void;
	warn(text?: string): void;
}
