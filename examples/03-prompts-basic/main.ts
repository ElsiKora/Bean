import { type BeanAdapter, createBeanAdapterFactory } from "@elsikora/bean";

const MIN_NAME_LENGTH: number = 2;
const MIN_SECRET_LENGTH: number = 6;
const MIN_AGE: number = 1;
const MAX_AGE: number = 120;
const MIN_RATING: number = 1;
const MAX_RATING: number = 5;
const CANCELLED_ERROR_MESSAGE: string = "Cancelled by user.";

const bean: BeanAdapter = createBeanAdapterFactory({ environment: process.env });

const throwCancelledError = (): never => {
	throw new Error(CANCELLED_ERROR_MESSAGE);
};

bean.intro({ message: "Basic Prompts Demo" });
bean.divider();

const name: null | string = await bean.text({
	defaultValue: "World",
	message: "What is your name?",
	placeholder: "Enter your name...",
	validate: (value: string): null | string => (value.length < MIN_NAME_LENGTH ? "Name must be at least 2 characters" : null),
});

if (bean.isCancel(name)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "info", message: `Hello, ${name}!` });
bean.message({ message: "" });

const secretValue: null | string = await bean.password({
	message: "Enter a secret credential:",
	validate: (value: string): null | string => (value.length < MIN_SECRET_LENGTH ? "Secret must be at least 6 characters" : null),
});

if (bean.isCancel(secretValue)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "success", message: `Secret set (${String(secretValue.length)} chars)` });
bean.message({ message: "" });

const shouldContinue: boolean | null = await bean.confirm({
	isDefaultValue: true,
	message: "Do you want to continue?",
});

if (bean.isCancel(shouldContinue)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "info", message: `You chose: ${shouldContinue ? "Yes" : "No"}` });
bean.message({ message: "" });

const isDarkMode: boolean | null = await bean.toggle({
	isDefaultValue: false,
	message: "Enable dark mode?",
	offLabel: "Light",
	onLabel: "Dark",
});

if (bean.isCancel(isDarkMode)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "info", message: `Theme: ${isDarkMode ? "Dark" : "Light"}` });
bean.message({ message: "" });

const age: null | number = await bean.number({
	max: MAX_AGE,
	message: "How old are you?",
	min: MIN_AGE,
});

if (bean.isCancel(age)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "info", message: `Age: ${String(age)}` });
bean.message({ message: "" });

const satisfaction: null | number = await bean.rating({
	max: MAX_RATING,
	message: "Rate your experience (1-5):",
	min: MIN_RATING,
});

if (bean.isCancel(satisfaction)) {
	bean.outro({ message: "Cancelled." });
	bean.dispose();
	throwCancelledError();
}

bean.log({ level: "info", message: `Rating: ${String(satisfaction)}/${String(MAX_RATING)}` });

bean.divider();
bean.outro({ message: "Basic prompts demo complete!" });
bean.dispose();
