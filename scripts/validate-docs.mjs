import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const REQUIRED_DOC_FILES = ["docs/page.mdx", "docs/_meta.js", "docs/getting-started/page.mdx", "docs/getting-started/_meta.js", "docs/core-concepts/page.mdx", "docs/core-concepts/_meta.js", "docs/guides/page.mdx", "docs/guides/_meta.js", "docs/api-reference/page.mdx", "docs/api-reference/_meta.js"];

const REQUIRED_ROOT_FILES = ["README.md"];

const allRequiredFiles = [...REQUIRED_DOC_FILES, ...REQUIRED_ROOT_FILES];
const missingFiles = allRequiredFiles.filter((filePath) => !existsSync(path.resolve(process.cwd(), filePath)));

if (missingFiles.length > 0) {
	console.error("Documentation validation failed. Missing required files:");

	for (const missingFile of missingFiles) {
		console.error(`- ${missingFile}`);
	}

	throw new Error("Documentation validation failed.");
}

process.stdout.write("Documentation validation passed.\n");
