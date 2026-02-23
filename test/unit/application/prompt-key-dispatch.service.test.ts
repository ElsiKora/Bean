import { describe, expect, it } from "vitest";
import { PromptKeyDispatchService } from "../../../src/application/service/prompt/prompt-key-dispatch.service";

describe("PromptKeyDispatchService", () => {
	it("resolves list commands across control and navigation keys", () => {
		const service = new PromptKeyDispatchService();

		expect(service.resolveListCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "escape", SEQUENCE: "" })).toBe("cancel");
		expect(service.resolveListCommand({ IS_CTRL: true, IS_META: false, IS_SHIFT: false, NAME: "c", SEQUENCE: "" })).toBe("cancel");
		expect(service.resolveListCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "down", SEQUENCE: "" })).toBe("down");
		expect(service.resolveListCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "up", SEQUENCE: "" })).toBe("up");
		expect(service.resolveListCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "left", SEQUENCE: "" })).toBe("left");
		expect(service.resolveListCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "right", SEQUENCE: "" })).toBe("right");
		expect(service.resolveListCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "space", SEQUENCE: " " })).toBe("space");
		expect(service.resolveListCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "backspace", SEQUENCE: "" })).toBe("backspace");
		expect(service.resolveListCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "return", SEQUENCE: "\r" })).toBe("enter");
		expect(service.resolveListCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "x", SEQUENCE: "x" })).toBe("text");
	});

	it("resolves text commands including control actions and printable text", () => {
		const service = new PromptKeyDispatchService();

		expect(service.resolveTextCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "escape", SEQUENCE: "" })).toBe("cancel");
		expect(service.resolveTextCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "return", SEQUENCE: "\r" })).toBe("enter");
		expect(service.resolveTextCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "backspace", SEQUENCE: "" })).toBe("backspace");
		expect(service.resolveTextCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "left", SEQUENCE: "" })).toBe("left");
		expect(service.resolveTextCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "right", SEQUENCE: "" })).toBe("right");
		expect(service.resolveTextCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "home", SEQUENCE: "" })).toBe("home");
		expect(service.resolveTextCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "end", SEQUENCE: "" })).toBe("end");
		expect(service.resolveTextCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "delete", SEQUENCE: "" })).toBe("delete");
		expect(service.resolveTextCommand({ IS_CTRL: true, IS_META: false, IS_SHIFT: false, NAME: "a", SEQUENCE: "" })).toBe("ctrl-a");
		expect(service.resolveTextCommand({ IS_CTRL: true, IS_META: false, IS_SHIFT: false, NAME: "k", SEQUENCE: "" })).toBe("ctrl-k");
		expect(service.resolveTextCommand({ IS_CTRL: true, IS_META: false, IS_SHIFT: false, NAME: "u", SEQUENCE: "" })).toBe("ctrl-u");
		expect(service.resolveTextCommand({ IS_CTRL: true, IS_META: false, IS_SHIFT: false, NAME: "w", SEQUENCE: "" })).toBe("ctrl-w");
		expect(service.resolveTextCommand({ IS_CTRL: false, IS_META: false, IS_SHIFT: false, NAME: "", SEQUENCE: "x" })).toBe("text");
		expect(service.resolveTextCommand({ IS_CTRL: true, IS_META: false, IS_SHIFT: false, NAME: "x", SEQUENCE: "x" })).toBe("noop");
	});
});
