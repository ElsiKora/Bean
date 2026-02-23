import type { Key } from "node:readline";
import type { ReadStream } from "node:tty";

import type { IInputPortInterface } from "@application/interface/port/input-port.interface";
import type { IKeyEventInterface } from "@domain/interface/input/key-event.interface";

import { emitKeypressEvents } from "node:readline";

const NON_TTY_INPUT_ERROR_MESSAGE_CONSTANT: string = "Interactive prompts require a TTY stdin.";

export class NodeReadlineInputAdapter implements IInputPortInterface {
	private readonly STDIN: ReadStream;

	public constructor(input: { stdin?: ReadStream } = {}) {
		this.STDIN = input.stdin ?? process.stdin;
		emitKeypressEvents(this.STDIN);
	}

	public disableRawMode(): void {
		if (this.STDIN.isTTY) {
			this.STDIN.setRawMode(false);
			this.STDIN.pause();
		}
	}

	public enableRawMode(): void {
		if (!this.STDIN.isTTY) {
			throw new Error(NON_TTY_INPUT_ERROR_MESSAGE_CONSTANT);
		}

		this.STDIN.setRawMode(true);
		this.STDIN.resume();
	}

	public onKeyEvent(listener: (event: IKeyEventInterface) => void): () => void {
		const onKeypress = (sequence: string, key: Key): void => {
			listener({
				IS_CTRL: key.ctrl ?? false,
				IS_META: key.meta ?? false,
				IS_SHIFT: key.shift ?? false,
				NAME: key.name ?? "",
				SEQUENCE: key.sequence ?? sequence ?? "",
			});
		};

		this.STDIN.on("keypress", onKeypress);

		return () => {
			this.STDIN.off("keypress", onKeypress);
		};
	}
}
