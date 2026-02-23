# Runtime Parity Migration Notes

This document tracks behavior and API shifts introduced while reaching full runtime parity.

## Spinner API

- `stop()` is neutral, `succeed()` is success, and `fail()` is failure.
- Spinner internals now use explicit status values; callers should not assume old boolean-flag semantics.
- `spinner()` now accepts optional `prefix` and `onStateChange` for runtime observability.

## Spinner Manager API

- `spinnerManager().create()` now supports:
  - `parentId` for hierarchy.
  - `prefix` for scoped labels.
  - `onStateChange` callback for lifecycle tracking.
- Rendered labels include hierarchy segments (example: `core/lint/unit`).

## Progress API

- `createProgress()` and `progress()` support optional `prefix`.
- `createProgress()` supports `onRender` callback for runtime observability.
- `createMultiProgress().add()` supports `parentId` and `prefix`.
- Multi-progress handles now expose `setLabel()` and `setPrefix()`.

## Task Runner API

- `runTasks()` supports nested `subtasks` in each task definition.
- `runTasks()` accepts:
  - `onEvent` for structured lifecycle events.
  - `logPrefix` to scope runtime output.
  - `isPersistLogs` to return a `logs` array in the summary.
- Returned summary may include `logs` when persistence is enabled.

## Prompt Runtime Notes

- Select/multiselect/group-multiselect/text continue to support immediate interactive usage.
- Async option loading remains available via `optionsLoader`.
- For deterministic tests, keep using fake clock/input/output fixtures and emit events after prompt invocation.
