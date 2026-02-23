import { describe, expect, it } from "vitest";
import { AnsiRendererAdapter } from "../../../src/infrastructure/adapter/render/ansi-renderer.adapter";
import { DefaultThemeAdapter } from "../../../src/infrastructure/adapter/theme/default-theme.adapter";

describe("DefaultThemeAdapter", () => {
	it("styles themed outputs through ansi renderer", () => {
		const theme = new DefaultThemeAdapter({
			ansiRendererAdapter: new AnsiRendererAdapter({
				isTTY: true,
				environment: {},
			}),
		});

		expect(theme.success("ok")).toContain("\u001B[");
		expect(theme.danger("err")).toContain("\u001B[");
		expect(theme.muted("muted")).toContain("\u001B[");
		expect(theme.accent("warn")).toContain("\u001B[");
		expect(theme.info("info")).toContain("\u001B[");
		expect(theme.strong("bold")).toContain("\u001B[");
	});
});
