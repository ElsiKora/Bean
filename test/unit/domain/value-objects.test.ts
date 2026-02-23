import { describe, expect, it } from "vitest";
import { CursorPositionValueObject } from "../../../src/domain/value-object/cursor-position.value-object";
import { SelectOptionValueObject } from "../../../src/domain/value-object/select-option.value-object";

describe("Value objects", () => {
	it("creates cursor positions and option metadata", () => {
		const cursor = new CursorPositionValueObject(1, 2).withColumn(5).withRow(3);
		const option = new SelectOptionValueObject({
			isDisabled: true,
			label: "Core",
			value: "core",
			group: "backend",
		});

		expect(cursor.row).toBe(3);
		expect(cursor.column).toBe(5);
		expect(option.group).toBe("backend");
		expect(option.isDisabled).toBe(true);
	});
});
