import { type BeanAdapter, createBeanAdapterFactory, type IBeanSpinnerHandleInterface, SelectOptionValueObject } from "@elsikora/bean";

const DELAY_CREATE_PROJECT_MS: number = 1000;
const DELAY_COPY_FILES_MS: number = 800;
const DELAY_CONFIGURE_FEATURES_MS: number = 1200;
const DELAY_INSTALL_DEPENDENCIES_MS: number = 1500;

const bean: BeanAdapter = createBeanAdapterFactory({ environment: process.env });

let projectName: string = "";
let framework: string = "";
let shouldInstall: boolean = false;
let features: ReadonlyArray<string> = [];

await bean
	.fluent()
	.intro("Project Scaffolding Wizard")
	.step("Let's configure your new project")
	.text({
		message: "What is your project name?",
		onResolved: (value: null | string): void => {
			projectName = value ?? "my-project";
		},
		placeholder: "my-awesome-app",
		validate: (v: string): null | string => (v.length === 0 ? "Project name is required" : null),
	})
	.select({
		message: "Which framework do you want to use?",
		onResolved: (value: null | string): void => {
			framework = value ?? "none";
		},
		options: [
			new SelectOptionValueObject({ description: "A JavaScript library for building UIs", label: "React", value: "react" }),
			new SelectOptionValueObject({ description: "The progressive JavaScript framework", label: "Vue", value: "vue" }),
			new SelectOptionValueObject({ description: "Cybernetically enhanced web apps", label: "Svelte", value: "svelte" }),
			new SelectOptionValueObject({ description: "The web framework for content-driven websites", label: "Astro", value: "astro" }),
		],
	})
	.multiselect({
		message: "Select additional features:",
		onResolved: (value: null | ReadonlyArray<string>): void => {
			features = value ?? [];
		},
		options: [new SelectOptionValueObject({ label: "TypeScript", value: "typescript" }), new SelectOptionValueObject({ label: "ESLint", value: "eslint" }), new SelectOptionValueObject({ label: "Prettier", value: "prettier" }), new SelectOptionValueObject({ label: "Vitest", value: "vitest" }), new SelectOptionValueObject({ label: "Tailwind CSS", value: "tailwind" }), new SelectOptionValueObject({ label: "Docker", value: "docker" })],
	})
	.confirm({
		isDefaultValue: true,
		message: "Install dependencies now?",
		onResolved: (isConfirmedValue: boolean | null): void => {
			shouldInstall = isConfirmedValue ?? false;
		},
	})
	.message("")
	.step("Configuration summary")
	.spinner({
		task: async (handle: IBeanSpinnerHandleInterface): Promise<void> => {
			handle.update(`Creating ${projectName}...`);
			await new Promise((resolve: () => void) => setTimeout(resolve, DELAY_CREATE_PROJECT_MS));

			handle.update("Copying template files...");
			await new Promise((resolve: () => void) => setTimeout(resolve, DELAY_COPY_FILES_MS));

			if (features.length > 0) {
				handle.update(`Configuring ${features.join(", ")}...`);
				await new Promise((resolve: () => void) => setTimeout(resolve, DELAY_CONFIGURE_FEATURES_MS));
			}

			if (shouldInstall) {
				handle.update("Installing dependencies...");
				await new Promise((resolve: () => void) => setTimeout(resolve, DELAY_INSTALL_DEPENDENCIES_MS));
			}
		},
		text: "Scaffolding project...",
	})
	.outro(`Project "${projectName}" created with ${framework}!`)
	.run();

bean.dispose();
