# Implementation Plan: Backtest Engine Column Organism Components

**Branch**: `007-column-organism-components` | **Date**: 2026-05-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-column-organism-components/spec.md`

## Summary

Refactor `src/routes/backtest-engine/+page.svelte` to replace three inline configuration columns with dedicated organism components (`UniverseCapitalConfig`, `ScheduleExecutionConfig`, `OrderTypesConfig`). Each organism gets its own dedicated Zod-backed singleton state class, following the existing `BacktestState` / `AppState` / `StrategyState` pattern. The global `backtestState` singleton is removed; all import sites (`+page.svelte`, `QuickActionsPanel.svelte`) are updated to reference the new per-organism singletons. The page owns all cross-organism coordination: the `$effect` that writes `appState.backtestPrefillSymbol` into the universe field, and `handleRun` which aggregates state from all three singletons. Each organism is Storybook-verified before page integration and before advancing to the next user story (Constitution Rule 12).

## Technical Context

**Language/Version**: TypeScript 5.x, Svelte 5.55.2, SvelteKit 2.57.0

**Primary Dependencies**: Svelte 5 (`$state`/`$props` runes), Zod 3.x, Tailwind CSS 4, shadcn-svelte (Button, Input, Label, Select), svelte-sonner (toast)

**Storage**: N/A

**Testing**: Vitest 4.1.3 (unit), Playwright 1.59.1 (e2e), Storybook 10.4.0 (component visual verification)

**Target Platform**: Web browser (SvelteKit SSR + client hydration)

**Project Type**: SvelteKit frontend web application

**Performance Goals**: N/A — structural UI refactor; no runtime performance impact expected

**Constraints**:
- Visual and functional equivalence MUST be preserved (FR-007)
- `pnpm` is the package manager; no new runtime dependencies introduced
- Schema files MUST use direct relative imports between schemas (never the barrel) to prevent circular imports
- Each organism MUST NOT import `appState` or sibling organism state
- `BacktestStateSchema` field defaults MUST be reused in the new per-organism schemas, not duplicated

**Scale/Scope**: 3 new organism components + 3 new schema files + 3 new state singletons + 3 Storybook stories + 1 BDD feature file + 3 updated files + 2 removed files ≈ 15 new/modified files

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate | Rule | Check | Status |
| --- | --- | --- | --- |
| Branch name follows `###-feature-name` format | Rule 1 | `007-column-organism-components` matches `[0-9]{3}-[a-z-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then in all 3 user stories | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | Feature does not touch Docker | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Tasks will include `ci-sca`, `ci-format-lint`, `ci-secrets-scan`, `ci-unit-tests` | ✅ |
| Required directory structure included | Rule 9 | `features/`, `e2e-tests/`, `deploy/docker/` all present in repo | ✅ |
| UI components follow Atomic Design + Storybook | Rule 12 | Storybook stories for 3 new organisms precede schema/state work in task ordering | ✅ |
| Virtual module structure respected | Rule 11 | No new module; all files live within existing `src/lib/` structure | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | UI component refactor; no secrets involved | ✅ |

**Violations**: None. All gates pass or are N/A.

## Project Structure

### Documentation (this feature)

```text
specs/007-column-organism-components/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← Phase 1 output
│   └── component-props.md
└── tasks.md             ← Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── components/
│   │   └── organisms/
│   │       ├── UniverseCapitalConfig.svelte       [NEW]  — Universe & Capital column organism
│   │       ├── ScheduleExecutionConfig.svelte      [NEW]  — Schedule & Execution column organism
│   │       └── OrderTypesConfig.svelte             [NEW]  — Order Types column organism
│   ├── schemas/
│   │   ├── universe-capital-config.schema.ts       [NEW]  — UniverseCapitalConfigSchema + BacktestModeSchema
│   │   ├── schedule-execution-config.schema.ts     [NEW]  — ScheduleExecutionConfigSchema
│   │   ├── order-types-config.schema.ts            [NEW]  — OrderTypesConfigSchema + OrderTypeSchema
│   │   ├── backtest-state.schema.ts                [REMOVE] — replaced by 3 new schema files
│   │   └── index.ts                               [UPDATED] — add 3 new exports, remove old
│   └── state/
│       ├── universe-capital-config.svelte.ts       [NEW]  — universeCapitalConfigState singleton
│       ├── schedule-execution-config.svelte.ts     [NEW]  — scheduleExecutionConfigState singleton
│       ├── order-types-config.svelte.ts            [NEW]  — orderTypesConfigState singleton
│       └── backtest.svelte.ts                      [REMOVE] — replaced by 3 new state files
├── routes/
│   └── backtest-engine/
│       └── +page.svelte                           [UPDATED] — use 3 organisms, own handleRun + $effect
└── stories/
    ├── UniverseCapitalConfig.stories.svelte        [NEW]
    ├── ScheduleExecutionConfig.stories.svelte      [NEW]
    └── OrderTypesConfig.stories.svelte             [NEW]

features/
└── column-organism-components.feature              [NEW]  — BDD scenarios (Constitution Rule 6)

src/lib/components/organisms/
└── QuickActionsPanel.svelte                       [UPDATED] — reset() all 3 new singletons
```

**Structure Decision**: Single SvelteKit project. All new files land in existing `src/lib/` directories. No new directories created. Two files removed (`backtest.svelte.ts`, `backtest-state.schema.ts`); their contents are split into three files each.
