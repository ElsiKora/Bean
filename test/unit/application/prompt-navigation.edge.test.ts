import { describe, expect, it } from "vitest";
import { PromptNavigationService } from "../../../src/application/service/prompt/prompt-navigation.service";
import { SelectOptionValueObject } from "../../../src/domain/value-object/select-option.value-object";

describe("PromptNavigationService edge cases", () => {
	it("handles empty and all-disabled option sets", () => {
		const service = new PromptNavigationService();
		expect(service.moveNext(0, 0)).toBe(0);
		expect(service.movePrevious(0, 0)).toBe(0);

		const disabled = [new SelectOptionValueObject({ isDisabled: true, label: "a", value: "a" }), new SelectOptionValueObject({ isDisabled: true, label: "b", value: "b" })];
		expect(service.moveNextEnabled(1, disabled)).toBe(1);
		expect(service.movePreviousEnabled(0, disabled)).toBe(0);
	});

	it("groups ungrouped options under default bucket", () => {
		const service = new PromptNavigationService();
		const grouped = service.groupByName([new SelectOptionValueObject({ label: "a", value: "a" }), new SelectOptionValueObject({ label: "b", value: "b", group: "g1" })]);

		expect(grouped.get("default")?.length).toBe(1);
		expect(grouped.get("g1")?.length).toBe(1);
	});
});
