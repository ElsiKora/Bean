import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";

import { AnsiTokenizerService } from "../../../src/application/service/render/ansi-tokenizer.service";
import { NodeTtyOutputAdapter } from "../../../src/infrastructure/adapter/output/node-tty-output.adapter";

class MemoryWriteStreamFixture extends EventEmitter {
	public readonly chunks: string[];
	public isTTY: boolean;
	public columns: number;

	public constructor() {
		super();
		this.chunks = [];
		this.isTTY = true;
		this.columns = 100;
	}

	public write(chunk: string): boolean {
		this.chunks.push(chunk);
		return true;
	}
}

describe("NodeTtyOutputAdapter", () => {
	it("writes lines, frames and emits external write callbacks", () => {
		const stream = new MemoryWriteStreamFixture();
		const adapter = new NodeTtyOutputAdapter({
			ansiTokenizerService: new AnsiTokenizerService(),
			stdout: stream as unknown as NodeJS.WriteStream,
			environment: {},
		});
		const listener = vi.fn();
		adapter.onExternalWrite(listener);

		adapter.writeFrame("frame-1");
		adapter.writeLine("line-1");
		adapter.write("raw-1");
		adapter.hideCursor();
		adapter.showCursor();

		expect(listener).toHaveBeenCalledTimes(2);
		expect(stream.chunks.join("")).toContain("line-1\n");
		expect(stream.chunks.join("")).toContain("raw-1");
		expect(stream.chunks.join("")).toContain("\u001B[?25l");
		expect(stream.chunks.join("")).toContain("\u001B[?25h");
	});

	it("disables unicode when BEAN_FORCE_ASCII is enabled", () => {
		const stream = new MemoryWriteStreamFixture();
		const adapter = new NodeTtyOutputAdapter({
			ansiTokenizerService: new AnsiTokenizerService(),
			stdout: stream as unknown as NodeJS.WriteStream,
			environment: { BEAN_FORCE_ASCII: "1" },
		});

		expect(adapter.IS_UNICODE_SUPPORTED).toBe(false);
	});

	it("clears wrapped visual lines between frames", () => {
		const stream = new MemoryWriteStreamFixture();
		stream.columns = 10;
		const adapter = new NodeTtyOutputAdapter({
			ansiTokenizerService: new AnsiTokenizerService(),
			stdout: stream as unknown as NodeJS.WriteStream,
			environment: {},
		});

		adapter.writeFrame("1234567890123456789012345");
		adapter.writeFrame("next");

		const clearSequenceCount: number = stream.chunks.join("").split("\u001B[2K").length - 1;
		expect(clearSequenceCount).toBeGreaterThanOrEqual(3);
	});
});
