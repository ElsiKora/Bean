import { describe, expect, it } from "vitest";
import { TextBufferService } from "../../../src/application/service/prompt/text-buffer.service";

describe("TextBufferService", () => {
	it("applies insert, backspace and delete operations with cursor clamping", () => {
		const service = new TextBufferService();

		expect(service.applyInsert({ cursorIndex: 10, value: "ab", valueToInsert: "c" })).toEqual({ cursorIndex: 3, value: "abc" });
		expect(service.applyBackspace({ cursorIndex: 0, value: "abc" })).toEqual({ cursorIndex: 0, value: "abc" });
		expect(service.applyBackspace({ cursorIndex: 2, value: "abc" })).toEqual({ cursorIndex: 1, value: "ac" });
		expect(service.applyDeleteForward({ cursorIndex: 3, value: "abc" })).toEqual({ cursorIndex: 3, value: "abc" });
		expect(service.applyDeleteForward({ cursorIndex: 1, value: "abc" })).toEqual({ cursorIndex: 1, value: "ac" });
	});

	it("supports word deletion and kill operations", () => {
		const service = new TextBufferService();

		expect(service.deleteWordBackward({ cursorIndex: 0, value: "hello world" })).toEqual({ cursorIndex: 0, value: "hello world" });
		expect(service.deleteWordBackward({ cursorIndex: 11, value: "hello world" })).toEqual({ cursorIndex: 6, value: "hello " });
		expect(service.killToStart({ cursorIndex: 5, value: "hello world" })).toEqual({ cursorIndex: 0, value: " world" });
		expect(service.killToEnd({ cursorIndex: 5, value: "hello world" })).toEqual({ cursorIndex: 5, value: "hello" });
	});

	it("moves cursor by character and by word with edge handling", () => {
		const service = new TextBufferService();
		const value = "hello world";

		expect(service.moveHome()).toBe(0);
		expect(service.moveEnd({ value })).toBe(value.length);
		expect(service.moveLeft({ cursorIndex: 0, value })).toBe(0);
		expect(service.moveRight({ cursorIndex: value.length, value })).toBe(value.length);
		expect(service.moveWordLeft({ cursorIndex: value.length, value })).toBe(6);
		expect(service.moveWordLeft({ cursorIndex: 0, value })).toBe(0);
		expect(service.moveWordRight({ cursorIndex: 0, value })).toBe(5);
		expect(service.moveWordRight({ cursorIndex: value.length, value })).toBe(value.length);
	});

	it("treats grapheme clusters as single cursor units", () => {
		const service = new TextBufferService();
		const familyEmoji = "👨‍👩‍👧‍👦";
		const smileEmoji = "🙂";
		const value = `${familyEmoji}z`;
		const familyEmojiEndIndex: number = familyEmoji.length;

		expect(service.moveRight({ cursorIndex: 0, value })).toBe(familyEmojiEndIndex);
		expect(service.moveLeft({ cursorIndex: familyEmojiEndIndex, value })).toBe(0);
		expect(service.moveRight({ cursorIndex: 1, value })).toBe(familyEmojiEndIndex);
		expect(service.applyBackspace({ cursorIndex: familyEmojiEndIndex, value })).toEqual({
			cursorIndex: 0,
			value: "z",
		});
		expect(service.applyDeleteForward({ cursorIndex: 0, value })).toEqual({
			cursorIndex: 0,
			value: "z",
		});

		const inserted = service.applyInsert({
			cursorIndex: familyEmojiEndIndex,
			value,
			valueToInsert: smileEmoji,
		});
		expect(inserted.value).toBe(`${familyEmoji}${smileEmoji}z`);
		expect(inserted.cursorIndex).toBe(familyEmojiEndIndex + smileEmoji.length);
	});
});
