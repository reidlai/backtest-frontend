# Implementation Plan: Fundamental Screener Organism Refactor

**Branch**: `008-screener-organism-refactor` | **Date**: 2026-05-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-screener-organism-refactor/spec.md`

## Summary

Extract the fundamental screener page's inline filter block and results table into two dedicated organism components (`ScreenerFilterPanel` and `ScreenerResultTable`). The filter organism owns all filter state and exports its own SvelteKit snapshot object (re-exported by the page). The result organism sources `sampleScreenerResults` internally and emits a backtest action callback. The page becomes a thin composition shell with no data imports.

## Technical Context

**Language/Version**: TypeScript 5.x (SvelteKit / Svelte 5 runes)

**Primary Dependencies**: SvelteKit snapshot API, Zod (`FundamentalScreenerSchema`, `ScreenerResultSchema`), shadcn-svelte (`Input`, `Label`, `Select`, `Table`), `$lib/shared-mockdata/market` (sample data), `$lib/schemas` (Zod schemas)

**Storage**: N/A — client-side state only; snapshot persists to browser session history

**Testing**: Vitest (unit), Storybook (component verification), Playwright (e2e), Cucumber/Gherkin (BDD)

**Target Platform**: SvelteKit web application (browser)

**Project Type**: Frontend web application — SvelteKit page refactor

**Performance Goals**: No regression from current render performance; all organism components render synchronously from in-memory data

**Constraints**: Zero visual regression; snapshot restore must continue to work correctly after extraction; no new dependencies introduced

**Scale/Scope**: 2 new organism components, 2 new Storybook stories, 1 BDD feature file, 1 Zod schema addition (ScreenerFilterPanelSchema)

## Constitution Check

| Gate | Rule | Check | Status |
|---|---|---|---|
| Branch name follows `###-feature-name` format | Rule 1 | `008-screener-organism-refactor` matches `[0-9]{3}-[a-z_-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios for all 3 user stories | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | No Docker changes in this refactor | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Tasks include lint/format, SCA, secrets scan, unit test verification | ✅ |
| Required directory structure included | Rule 9 | `features/` exists; adding `features/screener-organism-refactor.feature` | ✅ |
| UI components follow Atomic Design + Storybook (if frontend feature) | Rule 12 | Storybook stories created for both organisms before implementation considered complete | ✅ |
| Virtual module structure respected (if adding new module) | Rule 11 | Using existing `src/lib/components/organisms/` — no new module | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | No secrets involved; sample data only | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/008-screener-organism-refactor/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── components/
│   │   └── organisms/
│   │       ├── ScreenerFilterPanel.svelte     # NEW — filter controls + snapshot
│   │       └── ScreenerResultTable.svelte     # NEW — results table + sample data
│   └── schemas/
│       ├── screener-filter-panel.schema.ts    # NEW — Zod schema for filter state
│       └── index.ts                           # UPDATED — export new schema
├── routes/
│   └── fundamental-screener/
│       └── +page.svelte                       # UPDATED — thin composition shell
└── stories/
    ├── ScreenerFilterPanel.stories.svelte     # NEW — Storybook story
    └── ScreenerResultTable.stories.svelte     # NEW — Storybook story

features/
└── screener-organism-refactor.feature         # NEW — BDD feature file

e2e-tests/
└── screener-organism-refactor.e2e.ts          # NEW — Playwright e2e
```

## Phase 0: Research

### Decision Log

**Decision**: Snapshot ownership — filter organism exports `snapshot`, page re-exports
- **Rationale**: SvelteKit's `export const snapshot` contract must live on the page module, but the actual capture/restore logic (which knows about filter state) belongs in the organism. The organism exports the snapshot object literal; the page re-exports it via `export { snapshot } from './ScreenerFilterPanel'`-style re-export pattern. This keeps routing concerns on the page while keeping state management in the organism.
- **Alternatives considered**: Page owns snapshot and reads state via bindable props — rejected (per spec clarification Q1, answer B).

**Decision**: Filter state — fully internal, no external exposure
- **Rationale**: No filtering logic is in scope; the result table always shows unfiltered sample data. Exposing filter state would create dead API surface. The filter organism is a fully self-contained UI panel.
- **Alternatives considered**: Expose state via bindable props for future use — rejected (per spec clarification Q2, answer A).

**Decision**: Result organism data sourcing — internal import of `sampleScreenerResults`
- **Rationale**: Moves data coupling from the page to the organism that actually consumes it. The page becomes import-free of data concerns. When real API data is introduced, only `ScreenerResultTable` needs updating.
- **Alternatives considered**: Pass data as prop from page — rejected (spec FR-005, US3).

**Decision**: Zod schema for filter panel — new `ScreenerFilterPanelSchema` in dedicated file
- **Rationale**: Existing `FundamentalScreenerSchema` is used for snapshot validation. The organism will use this existing schema directly (renamed import); a new schema file follows the established pattern (`screener-filter-panel.schema.ts`). The existing schema already covers all four fields.
- **Alternatives considered**: Reuse `FundamentalScreenerSchema` without a new file — acceptable, but a dedicated schema file matches the project's 1-schema-per-organism convention.

**Decision**: Backtest action — `onBacktest` prop (callback function)
- **Rationale**: The Svelte 5 runes pattern used across this codebase passes callbacks as props (not Svelte `createEventDispatcher`). Existing organisms like `QuickActionsPanel` follow this pattern. The page passes `handleBacktest` as `onBacktest` prop.
- **Alternatives considered**: Svelte event dispatch — rejected; runes-era pattern uses callback props.

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md) for entity definitions.
See [contracts/](./contracts/) for component interface contracts.
