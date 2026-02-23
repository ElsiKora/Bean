import { type BeanAdapter, createBeanAdapterFactory } from "@elsikora/bean";

const COMPACT_JSON_COUNT: number = 42;
const SHORT_DIVIDER_WIDTH: number = 40;
const COLUMN_GAP: number = 4;

const bean: BeanAdapter = createBeanAdapterFactory({ environment: process.env });

bean.intro({ message: "Output Formatting Demo" });
bean.divider();

// --- Table ---
bean.message({ message: "1) Table:" });
bean.table({
	columns: ["Package", "Version", "Size", "License"],
	rows: [
		["@elsikora/bean", "0.1.0", "~7 kB", "MIT"],
		["ora", "9.3.0", "~30 kB", "MIT"],
		["chalk", "5.4.1", "~5 kB", "MIT"],
		["listr2", "10.0.0", "~80 kB", "MIT"],
		["ink", "6.8.0", "~200 kB", "MIT"],
	],
});

bean.message({ message: "" });

// --- Tree ---
bean.message({ message: "2) Tree:" });
bean.tree({
	children: [
		{
			children: [{ label: "entity/" }, { label: "enum/" }, { label: "value-object/" }],
			label: "domain/",
		},
		{
			children: [{ label: "service/" }, { label: "use-case/" }, { label: "interface/" }],
			label: "application/",
		},
		{
			children: [{ label: "adapter/" }, { label: "composition/" }],
			label: "infrastructure/",
		},
		{
			children: [
				{
					children: [{ label: "adapter.ts" }, { label: "bean-fluent-api.ts" }, { label: "bean-style-fluent-api.ts" }],
					label: "bean/",
				},
			],
			label: "presentation/",
		},
	],
	label: "src/",
});

bean.message({ message: "" });

// --- JSON output ---
bean.message({ message: "3) JSON output (pretty):" });
bean.json({
	value: {
		author: "Elsikora",
		dependencies: 0,
		features: ["prompts", "spinners", "progress", "styling", "task-runner"],
		name: "@elsikora/bean",
		version: "0.1.0",
	},
});

bean.message({ message: "" });

bean.message({ message: "4) JSON output (compact):" });
bean.json({
	isPretty: false,
	value: { count: COMPACT_JSON_COUNT, status: "ok" },
});

bean.message({ message: "" });

// --- Diff ---
bean.message({ message: "5) Text diff:" });
bean.diff({
	after: ["{", '  "name": "@elsikora/bean",', '  "version": "0.2.0",', '  "description": "Zero-dep terminal interaction library",', '  "type": "module",', '  "license": "MIT"', "}"].join("\n"),
	before: ["{", '  "name": "@elsikora/bean",', '  "version": "0.1.0",', '  "description": "Zero-dependency terminal interaction library for prompts, spinners, and rich CLI output.",', '  "type": "module"', "}"].join("\n"),
	labelAfter: "package.json (after)",
	labelBefore: "package.json (before)",
});

bean.message({ message: "" });

// --- Note ---
bean.message({ message: "6) Note:" });
bean.note({
	message: "Remember to update the changelog\nbefore publishing a new version.\n\nRun: npm run release",
	title: "Release Checklist",
});

bean.message({ message: "" });

// --- Box ---
bean.message({ message: "7) Box:" });
bean.box({
	message: "Your CLI tool is ready!\nRun `npx my-tool init` to get started.",
	title: "Success",
});

bean.message({ message: "" });

// --- Divider ---
bean.message({ message: "8) Dividers:" });
bean.divider();
bean.divider({ char: "=" });
bean.divider({ char: "·", width: SHORT_DIVIDER_WIDTH });

bean.message({ message: "" });

// --- Columns ---
bean.message({ message: "9) Columns:" });
bean.columns({ columns: ["Name", "Status", "Duration"], gap: COLUMN_GAP });
bean.columns({ columns: ["lint", "passed", "1.2s"], gap: COLUMN_GAP });
bean.columns({ columns: ["test", "passed", "4.8s"], gap: COLUMN_GAP });
bean.columns({ columns: ["build", "passed", "2.1s"], gap: COLUMN_GAP });

bean.message({ message: "" });

// --- Link ---
bean.message({ message: "10) Hyperlink:" });
bean.link({ label: "View documentation", url: "https://github.com/elsikora/bean" });

bean.message({ message: "" });

// --- Log levels ---
bean.message({ message: "11) Log levels:" });
bean.log({ level: "info", message: "Informational message" });
bean.log({ level: "success", message: "Operation completed successfully" });
bean.log({ level: "warn", message: "Deprecated API usage detected" });
bean.log({ level: "error", message: "Failed to read configuration file" });

bean.message({ message: "" });

// --- Intro / Outro / Step / Message ---
bean.message({ message: "12) Structural elements:" });
bean.intro({ message: "Section Header (intro)" });
bean.step({ message: "Individual step item" });
bean.message({ message: "Plain message line" });
bean.outro({ message: "Section Footer (outro)" });

bean.divider();
bean.outro({ message: "Output formatting demo complete!" });
bean.dispose();
