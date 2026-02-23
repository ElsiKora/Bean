import { describe, expect, it } from "vitest";
import type { IThemePortInterface } from "../../../src/application/interface/port/theme-port.interface";
import { SelectOptionValueObject } from "../../../src/domain/value-object/select-option.value-object";
import { createBeanAdapterFactory } from "../../../src/infrastructure/di/factory/bean-adapter.factory";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeInputPortFixture } from "../../e2e/fixtures/fake-input-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";

class IdentityThemeBranchFixture implements IThemePortInterface {
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

describe("BeanAdapter branch coverage", () => {
	it("covers cancel/select/group/spinner branch variants", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture({ isTTY: true, supportsUnicode: false });
		const clock = new FakeClockPortFixture();
		const bean = createBeanAdapterFactory({
			clockPort: clock,
			inputPort: input,
			outputPort: output,
			themePort: new IdentityThemeBranchFixture(),
		});

		const confirmPromise = bean.confirm({ message: "Cancel?" });
		input.emit({ NAME: "escape" });
		await expect(confirmPromise).resolves.toBeNull();

		const selectPromise = bean.select({
			message: "Choose",
			options: [new SelectOptionValueObject({ label: "x", value: "x" }), new SelectOptionValueObject({ label: "y", value: "y" })],
		});
		input.emit({ NAME: "down" });
		input.emit({ NAME: "return" });
		await expect(selectPromise).resolves.toBe("y");

		const groupedPromise = bean.groupMultiselect({
			isRequired: true,
			message: "Grouped",
			options: [new SelectOptionValueObject({ label: "a1", value: "a1", group: "a" }), new SelectOptionValueObject({ label: "a2", value: "a2", group: "a" })],
		});
		input.emit({ NAME: "a", SEQUENCE: "a" });
		input.emit({ NAME: "a", SEQUENCE: "a" });
		input.emit({ NAME: "space" });
		input.emit({ NAME: "return" });
		await expect(groupedPromise).resolves.toEqual(["a1"]);

		const spinnerOne = bean.spinner({ text: "one", intervalMs: 10 });
		spinnerOne.fail();

		const spinnerTwo = bean.spinner({ text: "two", intervalMs: 10 });
		spinnerTwo.stop();

		bean.progress({ current: 1, total: 3 });
		expect(output.frames.some((line) => line.includes("%"))).toBe(true);

		const nonTtyOutput = new FakeOutputPortFixture({ isTTY: false, supportsUnicode: false });
		const nonTtyBean = createBeanAdapterFactory({
			clockPort: clock,
			inputPort: input,
			outputPort: nonTtyOutput,
			themePort: new IdentityThemeBranchFixture(),
		});
		const nonTtySpinner = nonTtyBean.spinner({ text: "inactive", intervalMs: 10 });
		nonTtySpinner.stop();
		expect(nonTtyOutput.lines.some((line) => line.includes("inactive"))).toBe(true);
	});
});
