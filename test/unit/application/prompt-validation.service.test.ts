import { describe, expect, it } from "vitest";
import { PromptValidationService } from "../../../src/application/service/prompt/prompt-validation.service";

describe("PromptValidationService", () => {
	it("validates required text and multiselect counts", () => {
		const service = new PromptValidationService();
		expect(service.validateRequired("", true)).toBe("Value is required.");
		expect(service.validateRequired("ok", true)).toBeNull();
		expect(service.validateSelectRequired(0, true)).toBe("Select at least one option.");
		expect(service.validateSelectRequired(2, true)).toBeNull();
	});
});
