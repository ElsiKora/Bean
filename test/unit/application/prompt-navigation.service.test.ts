import { describe, expect, it } from "vitest";
import { PromptNavigationService } from "../../../src/application/service/prompt/prompt-navigation.service";
import { SelectOptionValueObject } from "../../../src/domain/value-object/select-option.value-object";

describe("PromptNavigationService", () => {
	it("skips disabled options while moving forward", () => {
		const service = new PromptNavigationService();
		const options = [new SelectOptionValueObject({ label: "A", value: "a" }), new SelectOptionValueObject({ isDisabled: true, label: "B", value: "b" }), new SelectOptionValueObject({ label: "C", value: "c" })];

		const next = service.moveNextEnabled(0, options);
		expect(next).toBe(2);
	});

	it("toggles selected index", () => {
		const service = new PromptNavigationService();
		const selected = new Set<number>([1]);
		const next = service.toggleIndex(selected, 2);
		const again = service.toggleIndex(next, 1);

		expect([...next]).toEqual([1, 2]);
		expect([...again]).toEqual([2]);
	});
});
