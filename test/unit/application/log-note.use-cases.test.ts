import { describe, expect, it } from "vitest";
import type { IThemePortInterface } from "../../../src/application/interface/port/theme-port.interface";
import { AnsiTokenizerService } from "../../../src/application/service/render/ansi-tokenizer.service";
import { LogMessageUseCase } from "../../../src/application/use-case/output/log-message.use-case";
import { ShowNoteUseCase } from "../../../src/application/use-case/output/show-note.use-case";
import { FakeOutputPortFixture } from "../../e2e/fixtures/fake-output-port.fixture";

class TestThemePortFixture implements IThemePortInterface {
	public accent(text: string): string {
		return `[accent]${text}`;
	}
	public success(text: string): string {
		return `[success]${text}`;
	}
	public danger(text: string): string {
		return `[danger]${text}`;
	}
	public muted(text: string): string {
		return `[muted]${text}`;
	}

	public strong(text: string): string {
		return `[strong]${text}`;
	}
	public info(text: string): string {
		return `[info]${text}`;
	}
}

describe("Log and note use-cases", () => {
	it("formats logs by level and draws note box", () => {
		const output = new FakeOutputPortFixture();
		const theme = new TestThemePortFixture();
		const logUseCase = new LogMessageUseCase({
			outputPort: output,
			themePort: theme,
		});
		const noteUseCase = new ShowNoteUseCase({
			ansiTokenizerService: new AnsiTokenizerService(),
			outputPort: output,
			themePort: theme,
		});

		logUseCase.execute({ level: "error", message: "fail" });
		logUseCase.execute({ level: "success", message: "ok" });
		logUseCase.execute({ level: "info", message: "info" });
		logUseCase.execute({ level: "warn", message: "warn" });
		noteUseCase.execute({ title: "Note", message: "line" });
		noteUseCase.execute({ title: "ANSI", message: "\u001B[31mred\u001B[39m" });

		expect(output.lines[0]).toContain("[danger]fail");
		expect(output.lines[1]).toContain("[success]ok");
		expect(output.lines[2]).toContain("[info]info");
		expect(output.lines[3]).toContain("[accent]warn");
		expect(output.lines.some((line) => line.includes("Note"))).toBe(true);
		expect(output.lines.some((line) => line.includes("[muted]│ line [muted]│"))).toBe(true);
		expect(output.lines.some((line) => line.includes("red"))).toBe(true);
	});
});
