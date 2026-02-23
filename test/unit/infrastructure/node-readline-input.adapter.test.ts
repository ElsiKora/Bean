import { EventEmitter } from "node:events";
import { describe, expect, it } from "vitest";
import { NodeReadlineInputAdapter } from "../../../src/infrastructure/adapter/input/node-readline-input.adapter";

class MemoryReadStreamFixture extends EventEmitter {
	public isTTY: boolean;
	public rawMode: boolean;
	public resumed: boolean;

	public constructor() {
		super();
		this.isTTY = true;
		this.rawMode = false;
		this.resumed = false;
	}

	public setRawMode(value: boolean): void {
		this.rawMode = value;
	}

	public resume(): void {
		this.resumed = true;
	}

	public pause(): void {
		this.resumed = false;
	}
}

describe("NodeReadlineInputAdapter", () => {
	it("manages raw mode and normalizes key events", () => {
		const stream = new MemoryReadStreamFixture();
		const adapter = new NodeReadlineInputAdapter({
			stdin: stream as unknown as NodeJS.ReadStream,
		});
		const seen: string[] = [];
		const off = adapter.onKeyEvent((event) => {
			seen.push(`${event.NAME}:${event.SEQUENCE}`);
		});

		adapter.enableRawMode();
		stream.emit("keypress", "a", { name: "a", sequence: "a" });
		off();
		adapter.disableRawMode();

		expect(stream.rawMode).toBe(false);
		expect(stream.resumed).toBe(false);
		expect(seen).toEqual(["a:a"]);
	});

	it("throws on non-tty streams to prevent hanging prompts", () => {
		const stream = new MemoryReadStreamFixture();
		stream.isTTY = false;
		const adapter = new NodeReadlineInputAdapter({
			stdin: stream as unknown as NodeJS.ReadStream,
		});

		expect(() => adapter.enableRawMode()).toThrowError("Interactive prompts require a TTY stdin.");
		expect(stream.rawMode).toBe(false);

		adapter.disableRawMode();
		expect(stream.resumed).toBe(false);
	});
});
