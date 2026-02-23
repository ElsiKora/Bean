import { describe, expect, it } from "vitest";
import type { IThemePortInterface } from "../../../src/application/interface/port/theme-port.interface";
import { createBeanAdapterFactory } from "../../../src/infrastructure/di/factory/bean-adapter.factory";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeInputPortFixture } from "../../e2e/fixtures/fake-input-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";

class PlainThemePortFixture implements IThemePortInterface {
	public accent(text: string): string {
		return text;
	}
	public success(text: string): string {
		return text;
	}
	public danger(text: string): string {
		return text;
	}
	public muted(text: string): string {
		return text;
	}

	public strong(text: string): string {
		return text;
	}
	public info(text: string): string {
		return text;
	}
}

describe("BeanAdapter", () => {
	it("handles confirm prompt and progress/note/log output", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture({ columns: 50 });
		const bean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			outputPort: output,
			themePort: new PlainThemePortFixture(),
		});

		const confirmPromise = bean.confirm({ message: "Proceed?" });
		input.emit({ NAME: "return" });
		await expect(confirmPromise).resolves.toBe(true);

		bean.progress({ current: 2, total: 4, label: "test" });
		bean.note({ title: "Title", message: "Body" });
		bean.log({ level: "success", message: "done" });

		expect(output.frames.some((frame) => frame.includes("50%"))).toBe(true);
		expect(output.lines.some((line) => line.includes("Title"))).toBe(true);
		expect(output.lines.some((line) => line.includes("done"))).toBe(true);
	});
});
