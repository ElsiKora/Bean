import { describe, expect, it } from "vitest";
import { SelectOptionValueObject } from "../../../src/domain/value-object/select-option.value-object";
import { createBeanAdapterFactory } from "../../../src/infrastructure/di/factory/bean-adapter.factory";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeInputPortFixture } from "../../e2e/fixtures/fake-input-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";

describe("BeanAdapter public contract", () => {
	it("exposes stable public methods", () => {
		const bean = createBeanAdapterFactory();

		expect(typeof bean.confirm).toBe("function");
		expect(typeof bean.groupMultiselect).toBe("function");
		expect(typeof bean.log).toBe("function");
		expect(typeof bean.multiselect).toBe("function");
		expect(typeof bean.note).toBe("function");
		expect(typeof bean.password).toBe("function");
		expect(typeof bean.progress).toBe("function");
		expect(typeof bean.select).toBe("function");
		expect(typeof bean.spinner).toBe("function");
		expect(typeof bean.styleChain).toBe("function");
		expect(typeof bean.styleTemplate).toBe("function");
		expect(typeof bean.text).toBe("function");
		expect(typeof bean.treeSelect).toBe("function");
	});

	it("returns null for canceled interactive prompts", async () => {
		const input = new FakeInputPortFixture();
		const output = new FakeOutputPortFixture();
		const bean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			inputPort: input,
			outputPort: output,
		});

		const textPromise = bean.text({ message: "Text" });
		input.emit({ NAME: "escape" });
		await expect(textPromise).resolves.toBeNull();

		const selectPromise = bean.select({
			message: "Select",
			options: [new SelectOptionValueObject({ label: "A", value: "a" })],
		});
		input.emit({ NAME: "escape" });
		await expect(selectPromise).resolves.toBeNull();

		const confirmPromise = bean.confirm({ message: "Confirm?" });
		input.emit({ NAME: "escape" });
		await expect(confirmPromise).resolves.toBeNull();
	});
});
