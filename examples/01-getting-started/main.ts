import { type BeanAdapter, createBeanAdapterFactory } from "@elsikora/bean";

const bean: BeanAdapter = createBeanAdapterFactory({
	environment: process.env,
	isSilent: false,
});

bean.intro({ message: "Welcome to @elsikora/bean!" });

bean.message({ message: "This is a simple message output." });

bean.step({ message: "Step 1 — Initializing project" });
bean.step({ message: "Step 2 — Installing dependencies" });
bean.step({ message: "Step 3 — Running build" });

bean.log({ level: "info", message: "Info: everything is configured" });
bean.log({ level: "success", message: "Success: build completed" });
bean.log({ level: "warn", message: "Warning: deprecated API usage detected" });
bean.log({ level: "error", message: "Error: failed to connect to database" });

bean.note({
	message: "This is a note block.\nIt can contain multiple lines\nand is visually distinct from regular output.",
	title: "Important Note",
});

bean.divider();

bean.outro({ message: "All done! Thanks for trying bean." });

bean.dispose();
