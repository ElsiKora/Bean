import type { IInputPortInterface } from "../../../src/application/interface/port/input-port.interface";
import type { IKeyEventInterface } from "../../../src/domain/interface/input/key-event.interface";

export class FakeInputPortFixture implements IInputPortInterface {
	public rawModeEnabled: boolean;

	private readonly listeners: Set<(event: IKeyEventInterface) => void>;

	public constructor() {
		this.rawModeEnabled = false;
		this.listeners = new Set<(event: IKeyEventInterface) => void>();
	}

	public enableRawMode(): void {
		this.rawModeEnabled = true;
	}

	public disableRawMode(): void {
		this.rawModeEnabled = false;
	}

	public onKeyEvent(listener: (event: IKeyEventInterface) => void): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	public emit(event: Partial<IKeyEventInterface>): void {
		const normalized: IKeyEventInterface = {
			IS_CTRL: event.IS_CTRL ?? false,
			IS_META: event.IS_META ?? false,
			IS_SHIFT: event.IS_SHIFT ?? false,
			NAME: event.NAME ?? "",
			SEQUENCE: event.SEQUENCE ?? "",
		};

		for (const listener of this.listeners) {
			listener(normalized);
		}
	}
}
