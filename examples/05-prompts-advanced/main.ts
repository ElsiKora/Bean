import { type BeanAdapter, createBeanAdapterFactory, SelectOptionValueObject } from "@elsikora/bean";

const ZERO_LENGTH: number = 0;
const JSON_INDENT_SPACES: number = 2;
const CANCELLED_ERROR_MESSAGE: string = "Cancelled by user.";

const bean: BeanAdapter = createBeanAdapterFactory({ environment: process.env });

const throwCancelledError = (): never => {
	throw new Error(CANCELLED_ERROR_MESSAGE);
};

bean.intro({ message: "Advanced Prompts Demo" });
bean.divider();

const PACKAGES: ReadonlyArray<SelectOptionValueObject> = [
	new SelectOptionValueObject({ label: "express", value: "express" }),
	new SelectOptionValueObject({ label: "fastify", value: "fastify" }),
	new SelectOptionValueObject({ label: "koa", value: "koa" }),
	new SelectOptionValueObject({ label: "hapi", value: "hapi" }),
	new SelectOptionValueObject({ label: "nestjs", value: "nestjs" }),
	new SelectOptionValueObject({ label: "next", value: "next" }),
	new SelectOptionValueObject({ label: "nuxt", value: "nuxt" }),
	new SelectOptionValueObject({ label: "remix", value: "remix" }),
	new SelectOptionValueObject({ label: "astro", value: "astro" }),
	new SelectOptionValueObject({ label: "svelte-kit", value: "svelte-kit" }),
];

const selectedPackage: null | string = await bean.autocomplete({
	message: "Search for a package to install:",
	source: (query: string): ReadonlyArray<SelectOptionValueObject> => {
		if (query.length === ZERO_LENGTH) {
			return PACKAGES;
		}

		return PACKAGES.filter((option: SelectOptionValueObject): boolean => option.label.toLowerCase().includes(query.toLowerCase()));
	},
});

if (bean.isCancel(selectedPackage)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "success", message: `Installing: ${selectedPackage}` });
bean.message({ message: "" });

const deadline: Date | null = await bean.date({
	defaultValue: new Date(),
	message: "Set a project deadline (YYYY-MM-DD):",
});

if (bean.isCancel(deadline)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "info", message: `Deadline: ${deadline.toLocaleDateString()}` });
bean.message({ message: "" });

const tags: null | ReadonlyArray<string> = await bean.list({
	message: "Enter tags (comma-separated):",
	separator: ",",
});

if (bean.isCancel(tags)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "info", message: `Tags: ${tags.join(", ")}` });
bean.message({ message: "" });

const features: null | ReadonlyArray<string> = await bean.treeSelect({
	message: "Select features to include:",
	nodes: [
		{
			children: [
				{ label: "Username/Password", value: "auth-basic" },
				{ label: "OAuth 2.0", value: "auth-oauth" },
				{ label: "Two-Factor Auth", value: "auth-2fa" },
			],
			label: "Authentication",
			value: "auth",
		},
		{
			children: [
				{ label: "PostgreSQL", value: "db-postgres" },
				{ label: "MongoDB", value: "db-mongo" },
				{ label: "Redis Cache", value: "db-redis" },
			],
			label: "Database",
			value: "db",
		},
		{
			children: [
				{ label: "REST", value: "api-rest" },
				{ label: "GraphQL", value: "api-graphql" },
				{ label: "WebSocket", value: "api-ws" },
			],
			label: "API Layer",
			value: "api",
		},
	],
});

if (bean.isCancel(features)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "success", message: `Features: ${features.join(", ")}` });
bean.message({ message: "" });

const config: null | Readonly<Record<string, unknown>> = await bean.group({
	onCancel: (): void => {
		bean.log({ level: "warn", message: "Setup cancelled by user." });
	},
	steps: [
		{
			key: "projectName",
			run: async (): Promise<unknown> =>
				bean.text({
					message: "Project name:",
					validate: (value: string): null | string => (value.length === ZERO_LENGTH ? "Required" : null),
				}),
		},
		{
			key: "isTypeScript",
			run: async (): Promise<unknown> => bean.confirm({ isDefaultValue: true, message: "Use TypeScript?" }),
		},
		{
			key: "packageManager",
			run: async (): Promise<unknown> =>
				bean.select({
					message: "Package manager:",
					options: [new SelectOptionValueObject({ label: "npm", value: "npm" }), new SelectOptionValueObject({ label: "pnpm", value: "pnpm" }), new SelectOptionValueObject({ label: "yarn", value: "yarn" }), new SelectOptionValueObject({ label: "bun", value: "bun" })],
				}),
		},
	],
});

if (bean.isCancel(config)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.note({
	message: JSON.stringify(config, null, JSON_INDENT_SPACES),
	title: "Project Configuration",
});

bean.message({ message: "" });

const notes: null | string = await bean.editor({
	defaultValue: "# Release Notes\n\n- ",
	message: "Write release notes (opens external editor):",
});

if (bean.isCancel(notes)) {
	bean.log({ level: "info", message: "Editor cancelled." });
} else {
	bean.log({ level: "success", message: `Notes written (${String(notes.length)} chars)` });
}

bean.message({ message: "" });

const registration: null | Readonly<Record<string, unknown>> = await bean.promptFromSchema({
	fallbackValues: { role: "developer" },
	schema: {
		"Enter your email": { kind: "text", validate: (value: string): null | string => (value.includes("@") ? null : "Must be a valid email") },
		"Enter your username": { isRequired: true, kind: "text" },
		"Pick your role": {
			kind: "select",
			options: [new SelectOptionValueObject({ label: "Developer", value: "developer" }), new SelectOptionValueObject({ label: "Designer", value: "designer" }), new SelectOptionValueObject({ label: "Manager", value: "manager" })],
		},
	},
});

if (bean.isCancel(registration)) {
	bean.log({ level: "info", message: "Registration cancelled." });
} else {
	bean.note({
		message: JSON.stringify(registration, null, JSON_INDENT_SPACES),
		title: "Registration Result",
	});
}

bean.divider();
bean.outro({ message: "Advanced prompts demo complete!" });
bean.dispose();
