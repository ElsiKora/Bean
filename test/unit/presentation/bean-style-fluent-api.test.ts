import { describe, expect, it } from "vitest";
import { createBeanAdapterFactory } from "../../../src/infrastructure/di/factory/bean-adapter.factory";
import { FakeClockPortFixture } from "../../e2e/fixtures/fake-clock-port.fixture";
import { FakeInputPortFixture } from "../../e2e/fixtures/fake-input-port.fixture";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";

describe("Bean style fluent API", () => {
	it("supports chaining and tagged-template rendering", () => {
		const bean = createBeanAdapterFactory({
			clockPort: new FakeClockPortFixture(),
			environment: {
				FORCE_COLOR: "3",
			},
			inputPort: new FakeInputPortFixture(),
			isSignalHandlingEnabled: false,
			outputPort: new FakeOutputPortFixture(),
		});
		const chainedText: string = bean.styleChain().red().bold().underline().render("hello");
		const templateTag = bean.styleTemplate({
			isItalic: true,
		});
		const taggedText: string = templateTag`value=${123}`;

		expect(chainedText).toContain("\u001B[");
		expect(chainedText).toContain("hello");
		expect(taggedText).toContain("value=123");
		expect(taggedText).toContain("[3m");
	});
});
