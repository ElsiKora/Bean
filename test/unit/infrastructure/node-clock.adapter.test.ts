import { describe, expect, it, vi } from "vitest";
import { NodeClockAdapter } from "../../../src/infrastructure/adapter/clock/node-clock.adapter";

describe("NodeClockAdapter", () => {
	it("delegates interval and timeout operations", () => {
		vi.useFakeTimers();
		const clock = new NodeClockAdapter();
		const intervalSpy = vi.fn();
		const timeoutSpy = vi.fn();

		const intervalHandle = clock.setInterval(intervalSpy, 10);
		clock.setTimeout(timeoutSpy, 5);

		vi.advanceTimersByTime(25);
		clock.clearInterval(intervalHandle);

		expect(timeoutSpy).toHaveBeenCalledTimes(1);
		expect(intervalSpy).toHaveBeenCalledTimes(2);
		vi.useRealTimers();
	});
});
