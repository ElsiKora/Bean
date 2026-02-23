import { describe, expect, it } from "vitest";
import type { IThemePortInterface } from "../../../src/application/interface/port/theme-port.interface";
import { createBeanAdapterFactory } from "../../../src/infrastructure/di/factory/bean-adapter.factory";
import { SelectOptionValueObject } from "../../../src/domain/value-object/select-option.value-object";
import { FakeClockPortFixture } from "../fixtures/fake-clock-port.fixture";
import { FakeInputPortFixture } from "../fixtures/fake-input-port.fixture";
import { FakeOutputPortFixture } from "../fixtures/fake-output-port.fixture";

class IdentityThemePortFixture implements IThemePortInterface {
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

describe("Bean integration", () => {
	it("runs prompts and spinner end-to-end with injected streams", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture({ isTTY: true, supportsUnicode: true });
		const clock = new FakeClockPortFixture();

		const bean = createBeanAdapterFactory({
			clockPort: clock,
			inputPort: input,
			outputPort: output,
			themePort: new IdentityThemePortFixture(),
		});

		const textPromise = bean.text({ isRequired: true, message: "Message" });
		input.emit({ NAME: "", SEQUENCE: "f" });
		input.emit({ NAME: "", SEQUENCE: "e" });
		input.emit({ NAME: "", SEQUENCE: "a" });
		input.emit({ NAME: "", SEQUENCE: "t" });
		input.emit({ NAME: "return" });
		await expect(textPromise).resolves.toBe("feat");

		const multiselectPromise = bean.multiselect({
			isRequired: true,
			message: "Scopes",
			options: [new SelectOptionValueObject({ label: "core", value: "core" }), new SelectOptionValueObject({ label: "ui", value: "ui" })],
		});
		input.emit({ NAME: "space" });
		input.emit({ NAME: "down" });
		input.emit({ NAME: "space" });
		input.emit({ NAME: "return" });
		await expect(multiselectPromise).resolves.toEqual(["core", "ui"]);

		const spinner = bean.spinner({ text: "Building", intervalMs: 10 });
		clock.runIntervals(2);
		spinner.update("Building package");
		bean.log({ level: "info", message: "external write" });
		clock.runTimeouts();
		spinner.succeed("Build done");

		expect(output.frames.some((frame) => frame.includes("Building package"))).toBe(true);
		expect(output.frames.some((frame) => frame.includes("Build done"))).toBe(true);
	});
});
