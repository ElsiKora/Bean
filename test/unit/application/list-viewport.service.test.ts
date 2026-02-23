import { describe, expect, it } from "vitest";
import { ListViewportService } from "../../../src/application/service/prompt/list-viewport.service";

describe("ListViewportService", () => {
	it("returns an empty window for empty options", () => {
		const service = new ListViewportService();

		expect(
			service.getWindow({
				cursorIndex: 0,
				optionCount: 0,
				pageSize: 5,
			}),
		).toEqual({
			endIndex: 0,
			startIndex: 0,
		});
	});

	it("uses a sliding window around the cursor", () => {
		const service = new ListViewportService();

		expect(
			service.getWindow({
				cursorIndex: 4,
				optionCount: 10,
				pageSize: 5,
			}),
		).toEqual({
			endIndex: 7,
			startIndex: 2,
		});
		expect(
			service.getWindow({
				cursorIndex: 5,
				optionCount: 10,
				pageSize: 5,
			}),
		).toEqual({
			endIndex: 8,
			startIndex: 3,
		});
	});

	it("clamps the sliding window near edges", () => {
		const service = new ListViewportService();

		expect(
			service.getWindow({
				cursorIndex: 0,
				optionCount: 10,
				pageSize: 5,
			}),
		).toEqual({
			endIndex: 5,
			startIndex: 0,
		});
		expect(
			service.getWindow({
				cursorIndex: 9,
				optionCount: 10,
				pageSize: 5,
			}),
		).toEqual({
			endIndex: 10,
			startIndex: 5,
		});
	});
});
