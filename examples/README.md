# Bean Examples

Interactive examples demonstrating all features of `@elsikora/bean`.

## Prerequisites

```bash
npm install
npm install -D tsx
```

## Running Examples

```bash
npx tsx --tsconfig examples/tsconfig.json examples/<folder>/main.ts
```

For example:

```bash
npx tsx --tsconfig examples/tsconfig.json examples/01-getting-started/main.ts
```

## Example Overview

| #   | Folder                 | Features                                                                                                                                                                                     |
| --- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | `01-getting-started`   | Factory creation, messages, intro/outro, step, log levels, note, divider, dispose                                                                                                            |
| 02  | `02-styling`           | Named colors, hex, RGB, 256-color, bright, background, bold, italic, underline, strikethrough, overline, inverse, dim, style chains, template literals, custom themes, color level detection |
| 03  | `03-prompts-basic`     | Text input with validation, password, confirm, toggle, number with min/max, rating                                                                                                           |
| 04  | `04-prompts-select`    | Single select, select with search, multiselect, group multiselect, rawlist, expand with short keys                                                                                           |
| 05  | `05-prompts-advanced`  | Autocomplete with source, date, list (comma-separated), tree select, prompt groups, editor, promptFromSchema                                                                                 |
| 06  | `06-spinners`          | Manual spinner, stop states (succeed/fail/warn/info/stop), state tracking, prefix, spinnerPromise, spinner manager, hierarchical spinners                                                    |
| 07  | `07-progress`          | Static progress, animated progress bar, custom characters, render callback, multi-progress, hierarchical multi-progress                                                                      |
| 08  | `08-task-runner`       | Sequential tasks, subtasks, retries, conditional tasks (when), rollback on failure, lifecycle events, persisted logs                                                                         |
| 09  | `09-output-formatting` | Table, tree, JSON (pretty/compact), diff, note, box, divider, columns, hyperlink, log levels, structural elements                                                                            |
| 10  | `10-fluent-api`        | Chained workflow: intro → text → select → multiselect → confirm → spinner → outro                                                                                                            |
