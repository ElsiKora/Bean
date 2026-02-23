# BeanAdapter Modularization Plan

## Goal

- Keep `BeanAdapter` as the public facade only.
- Move technical details to dedicated modules by responsibility.
- Preserve current API surface while reducing coupling and file complexity.

## Target Structure

- `src/presentation/bean/adapter.ts`
  - Public facade (`BeanAdapter`) and orchestration only.
- `src/presentation/bean/bean-fluent-api.ts`
  - Fluent chain API implementation.
- `src/presentation/bean/type/`
  - Adapter input/output internal types.
- `src/presentation/bean/constant/`
  - Presentation-level constants.
- `src/presentation/bean/service/`
  - Small pure helper functions for formatting/parsing.
- `src/application/service/render/text-diff.service.ts`
  - LCS diff algorithm and operation generation.
- `src/application/interface/port/editor-port.interface.ts`
  - Editor abstraction port.
- `src/infrastructure/adapter/editor/node-editor.adapter.ts`
  - Node-specific external editor integration.

## Completed in this wave

- Editor OS interaction removed from presentation and moved to infrastructure through `IEditorPortInterface`.
- LCS diff algorithm moved from `BeanAdapter` to `TextDiffService`.
- `BeanFluentApi` extracted from `adapter.ts` into dedicated module.
- Local adapter constants and input types extracted into dedicated folders.
- Signal cleanup registration in composition root made idempotent.
- `progress`/`createProgress`/`createMultiProgress` extracted to `BeanProgressService`.
- `spinnerManager` extracted to `BeanSpinnerManagerService`.
- `runTasks` extracted to `BeanTaskRunnerService`.
- Color-level and styling logic extracted to `BeanStyleService`.
- Tree rendering extracted to `BeanTreeRendererService`.

## Next wave (to finish full split)

- Extract prompt fallback and completion-line rendering into prompt strategy services.
- Keep only facade methods + delegation in `BeanAdapter`.
- Add architecture tests ensuring `presentation/bean/adapter.ts` has no `node:*` imports and no algorithmic utilities.
