import { type BeanAdapter, createBeanAdapterFactory, SelectOptionValueObject } from "@elsikora/bean";

const SEARCH_PAGE_SIZE: number = 5;
const CANCELLED_ERROR_MESSAGE: string = "Cancelled by user.";

const bean: BeanAdapter = createBeanAdapterFactory({ environment: process.env });

const throwCancelledError = (): never => {
	throw new Error(CANCELLED_ERROR_MESSAGE);
};

bean.intro({ message: "Select Prompts Demo" });
bean.divider();

const framework: null | string = await bean.select({
	message: "Pick a frontend framework:",
	options: [
		new SelectOptionValueObject({ description: "The progressive JavaScript framework", label: "Vue", value: "vue" }),
		new SelectOptionValueObject({ description: "A JavaScript library for building UIs", label: "React", value: "react" }),
		new SelectOptionValueObject({ description: "Cybernetically enhanced web apps", label: "Svelte", value: "svelte" }),
		new SelectOptionValueObject({ description: "The web framework for content-driven websites", label: "Astro", value: "astro" }),
		new SelectOptionValueObject({ hint: "Not recommended", isDisabled: true, label: "jQuery", value: "jquery" }),
	],
});

if (bean.isCancel(framework)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "success", message: `Framework: ${framework}` });
bean.message({ message: "" });

const country: null | string = await bean.select({
	isSearchEnabled: true,
	message: "Search and pick a country:",
	options: [
		new SelectOptionValueObject({ label: "United States", value: "us" }),
		new SelectOptionValueObject({ label: "United Kingdom", value: "uk" }),
		new SelectOptionValueObject({ label: "Germany", value: "de" }),
		new SelectOptionValueObject({ label: "France", value: "fr" }),
		new SelectOptionValueObject({ label: "Japan", value: "jp" }),
		new SelectOptionValueObject({ label: "Canada", value: "ca" }),
		new SelectOptionValueObject({ label: "Australia", value: "au" }),
		new SelectOptionValueObject({ label: "Brazil", value: "br" }),
		new SelectOptionValueObject({ label: "India", value: "in" }),
		new SelectOptionValueObject({ label: "South Korea", value: "kr" }),
	],
	pageSize: SEARCH_PAGE_SIZE,
});

if (bean.isCancel(country)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "success", message: `Country: ${country}` });
bean.message({ message: "" });

const tools: null | ReadonlyArray<string> = await bean.multiselect({
	initialValues: ["eslint"],
	isRequired: true,
	message: "Select your dev tools (space to toggle, enter to confirm):",
	options: [new SelectOptionValueObject({ label: "ESLint", value: "eslint" }), new SelectOptionValueObject({ label: "Prettier", value: "prettier" }), new SelectOptionValueObject({ label: "Vitest", value: "vitest" }), new SelectOptionValueObject({ label: "Husky", value: "husky" }), new SelectOptionValueObject({ label: "Commitlint", value: "commitlint" }), new SelectOptionValueObject({ label: "Lint-staged", value: "lint-staged" })],
});

if (bean.isCancel(tools)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "success", message: `Tools: ${tools.join(", ")}` });
bean.message({ message: "" });

const logLevel: null | string = await bean.rawlist({
	message: "Select log level (enter number):",
	options: [new SelectOptionValueObject({ label: "Debug", value: "debug" }), new SelectOptionValueObject({ label: "Info", value: "info" }), new SelectOptionValueObject({ label: "Warn", value: "warn" }), new SelectOptionValueObject({ label: "Error", value: "error" }), new SelectOptionValueObject({ label: "Silent", value: "silent" })],
});

if (bean.isCancel(logLevel)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "success", message: `Log level: ${logLevel}` });
bean.message({ message: "" });

const conflict: null | string = await bean.expand({
	message: "Conflict detected in package.json. What do you want to do?",
	options: [new SelectOptionValueObject({ label: "Overwrite", shortKey: "y", value: "overwrite" }), new SelectOptionValueObject({ label: "Skip", shortKey: "n", value: "skip" }), new SelectOptionValueObject({ label: "Show diff", shortKey: "d", value: "diff" }), new SelectOptionValueObject({ label: "Abort", shortKey: "a", value: "abort" })],
});

if (bean.isCancel(conflict)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "success", message: `Action: ${conflict}` });
bean.message({ message: "" });

const stack: null | ReadonlyArray<string> = await bean.groupMultiselect({
	message: "Build your stack (grouped options):",
	options: [
		new SelectOptionValueObject({ group: "Frontend", label: "React", value: "react" }),
		new SelectOptionValueObject({ group: "Frontend", label: "Vue", value: "vue" }),
		new SelectOptionValueObject({ group: "Frontend", label: "Svelte", value: "svelte" }),
		new SelectOptionValueObject({ group: "Backend", label: "Express", value: "express" }),
		new SelectOptionValueObject({ group: "Backend", label: "Fastify", value: "fastify" }),
		new SelectOptionValueObject({ group: "Backend", label: "NestJS", value: "nestjs" }),
		new SelectOptionValueObject({ group: "Database", label: "PostgreSQL", value: "postgres" }),
		new SelectOptionValueObject({ group: "Database", label: "MongoDB", value: "mongo" }),
		new SelectOptionValueObject({ group: "Database", label: "Redis", value: "redis" }),
	],
});

if (bean.isCancel(stack)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "success", message: `Stack: ${stack.join(", ")}` });

bean.divider();
bean.outro({ message: "Select prompts demo complete!" });
bean.dispose();
