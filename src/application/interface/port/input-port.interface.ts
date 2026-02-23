import type { IKeyEventInterface } from "@domain/interface/input/key-event.interface";

export interface IInputPortInterface {
	disableRawMode(): void;
	enableRawMode(): void;
	onKeyEvent(listener: (event: IKeyEventInterface) => void): () => void;
}
