# @elsikora/bean

Zero-dependency CLI interaction library for prompts, spinners, progress, and rich terminal output.

## Install

```bash
npm install @elsikora/bean
```

## Quick Start

```typescript
import { SelectOptionValueObject, createBeanAdapterFactory } from "@elsikora/bean";

const bean = createBeanAdapterFactory();

const scope = await bean.select({
	message: "Select scope",
	options: [new SelectOptionValueObject({ label: "core", value: "core" }), new SelectOptionValueObject({ label: "ui", value: "ui" })],
});

if (scope !== null) {
	bean.spinnerPromise({
		successText: "Done",
		task: async () => {
			// do work
		},
		text: `Generating for ${scope}`,
	});
}
```

## Runtime Parity Features

- Prompt runtime: abort support, inline search/filter, custom frame rendering, lazy option loading, tree-select.
- Spinner runtime: status callbacks, prefixed spinner text, neutral/succeeded/failed states.
- Spinner manager runtime: hierarchical labels (`parent/child`) and per-spinner state-change callbacks.
- Progress runtime: prefixed progress lines, hierarchical multi-progress (`parentId`), render callbacks.
- Task runner runtime: nested subtasks, structured lifecycle events, optional persisted logs, configurable log prefix.
- Styling runtime: nested ANSI-safe styling, grapheme-aware gradient text rendering.
- Output runtime: zero-dependency image fallback renderer via `bean.image({ pixels, ... })`.

## Task Runner Example

```typescript
const summary = await bean.runTasks({
	isPersistLogs: true,
	logPrefix: "[release]",
	onEvent: (event) => {
		// status: started, retrying, succeeded, failed, skipped, rollback-*
	},
	tasks: [
		{
			prefix: "[build]",
			run: async () => {},
			subtasks: [
				{ run: async () => {}, title: "lint" },
				{ retries: 2, run: async () => {}, title: "unit" },
			],
			title: "pipeline",
		},
	],
});
```

## Validation

```bash
npm run lint:all
npm test
```
