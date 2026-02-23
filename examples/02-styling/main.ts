import { type BeanAdapter, createBeanAdapterFactory, type IThemePortInterface } from "@elsikora/bean";

const PALETTE_SAMPLE_SIZE: number = 16;
const PAD_LEFT_WIDTH: number = 3;
const FILES_WITH_ERRORS_COUNT: number = 3;

const RGB_RED_MAX: number = 255;
const RGB_GREEN_HIGH: number = 200;
const RGB_GREEN_MID: number = 100;
const RGB_GREEN_LOW: number = 50;
const RGB_BLUE_HIGH: number = 150;
const RGB_BLUE_LOW: number = 50;
const RGB_BLUE_MAX: number = 255;

const bean: BeanAdapter = createBeanAdapterFactory({ environment: process.env });

bean.intro({ message: "Styling & Colors Demo" });
bean.divider();

bean.message({ message: "Named colors:" });
bean.message({
	message: [bean.style({ color: "red", text: "red" }), bean.style({ color: "green", text: "green" }), bean.style({ color: "blue", text: "blue" }), bean.style({ color: "yellow", text: "yellow" }), bean.style({ color: "cyan", text: "cyan" }), bean.style({ color: "magenta", text: "magenta" }), bean.style({ color: "white", text: "white" }), bean.style({ color: "gray", text: "gray" })].join("  "),
});
bean.message({ message: "" });

bean.message({ message: "Bright colors:" });
bean.message({
	message: [bean.styleBright({ color: "red", text: "bright red" }), bean.styleBright({ color: "green", text: "bright green" }), bean.styleBright({ color: "blue", text: "bright blue" }), bean.styleBright({ color: "yellow", text: "bright yellow" }), bean.styleBright({ color: "cyan", text: "bright cyan" }), bean.styleBright({ color: "magenta", text: "bright magenta" })].join("  "),
});
bean.message({ message: "" });

bean.message({ message: "Hex colors:" });
bean.message({
	message: [bean.styleHex({ color: "#FF6B6B", text: "coral" }), bean.styleHex({ color: "#4ECDC4", text: "teal" }), bean.styleHex({ color: "#FFD93D", text: "gold" }), bean.styleHex({ color: "#C3AED6", text: "lavender" }), bean.styleHex({ color: "#87CEEB", text: "sky blue" }), bean.styleHex({ color: "#FFDAB9", text: "peach" })].join("  "),
});
bean.message({ message: "" });

bean.message({ message: "RGB colors:" });
bean.message({
	message: [bean.styleRgb({ rgb: { b: RGB_BLUE_LOW, g: RGB_GREEN_MID, r: RGB_RED_MAX }, text: "rgb(255,100,50)" }), bean.styleRgb({ rgb: { b: RGB_BLUE_HIGH, g: RGB_GREEN_HIGH, r: RGB_GREEN_LOW }, text: "rgb(50,200,150)" }), bean.styleRgb({ rgb: { b: RGB_BLUE_MAX, g: RGB_GREEN_LOW, r: RGB_GREEN_MID }, text: "rgb(100,50,255)" })].join("  "),
});
bean.message({ message: "" });

bean.message({ message: "256-color palette (sample):" });
const palette: Array<string> = [];

for (let index: number = 0; index < PALETTE_SAMPLE_SIZE; index++) {
	palette.push(
		bean.style256({
			color: index,
			text: ` ${String(index).padStart(PAD_LEFT_WIDTH)} `,
		}),
	);
}

bean.message({ message: palette.join("") });
bean.message({ message: "" });

bean.message({ message: "Background colors:" });
bean.message({
	message: [bean.styleBgHex({ color: "#FF6B6B", text: " White on Coral " }), bean.styleBgHex({ color: "#4ECDC4", text: " White on Teal " }), bean.styleBgRgb({ rgb: { b: RGB_BLUE_MAX, g: RGB_GREEN_LOW, r: RGB_GREEN_MID }, text: " White on Purple " })].join("  "),
});
bean.message({ message: "" });

bean.message({ message: "Text decorations:" });
bean.message({
	message: [bean.style({ isBold: true, text: "bold" }), bean.style({ isDim: true, text: "dim" }), bean.style({ isItalic: true, text: "italic" }), bean.style({ isUnderline: true, text: "underline" }), bean.style({ isStrikethrough: true, text: "strikethrough" }), bean.style({ isOverline: true, text: "overline" }), bean.style({ isInverse: true, text: "inverse" })].join("  "),
});
bean.message({ message: "" });

bean.message({ message: "Combined styles:" });
bean.message({
	message: bean.style({ color: "#FF6B6B", isBold: true, isItalic: true, isUnderline: true, text: "Bold + Italic + Underline + Coral" }),
});
bean.message({ message: "" });

bean.message({ message: "Style chain (fluent API):" });
bean.message({ message: "  " + bean.styleChain({ color: "yellow" }).bold().render("⚠ Warning: disk space low") });
bean.message({ message: "  " + bean.styleChain({ color: "green" }).bold().render("✓ All tests passed") });
bean.message({ message: "  " + bean.styleChain({ color: "red" }).bold().underline().render("✗ Build failed") });
bean.message({ message: "" });

bean.message({ message: "Template literal styling:" });
const danger: ReturnType<BeanAdapter["styleTemplate"]> = bean.styleTemplate({ color: "red", isBold: true });
const info: ReturnType<BeanAdapter["styleTemplate"]> = bean.styleTemplate({ color: "cyan" });
const validationCommand: string = "bean validate";
bean.message({ message: "  " + danger`Error: ${String(FILES_WITH_ERRORS_COUNT)} files could not be processed` });
bean.message({ message: "  " + info`Tip: run ${validationCommand} to check your config` });
bean.message({ message: "" });

bean.message({ message: "Custom theme:" });

const customTheme: IThemePortInterface = bean.createTheme({
	accent: (text: string): string => bean.styleHex({ color: "#FF6B6B", text }),
	info: (text: string): string => bean.styleHex({ color: "#87CEEB", text }),
	success: (text: string): string => bean.styleHex({ color: "#4ECDC4", text }),
});
bean.message({ message: "  " + customTheme.accent("Accent text with custom coral color") });
bean.message({ message: "  " + customTheme.success("Success text with custom teal color") });
bean.message({ message: "  " + customTheme.info("Info text with custom sky blue color") });
bean.message({ message: "  " + customTheme.strong("Strong text (falls back to default theme)") });
bean.message({ message: "" });

bean.message({ message: `Current color level: ${String(bean.colorLevel())} (0=none, 1=basic, 2=256, 3=16M)` });

bean.divider();
bean.outro({ message: "Styling demo complete!" });
bean.dispose();
