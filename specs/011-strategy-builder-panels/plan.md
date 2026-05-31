# Implementation Plan: Strategy Builder Input and Output Panels

**Branch**: `011-strategy-builder-panels` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-strategy-builder-panels/spec.md`

## Summary

Refactor `src/routes/strategy-builder/+page.svelte` to replace inline markup with two dedicated organism components: `StrategyInputPanel` (strategy description input + "Run" button with inline validation) and `StrategyOutputPanel` (performance metrics, equity curve chart, trade summary table, loading state, and error state). Both organisms follow the existing Atomic Design + Zod-schema-first workflow established in this codebase. State is managed via the existing `strategyState` Svelte 5 rune class in `src/lib/state/strategy.svelte.ts`; backtest result data is typed by the existing `BacktestResultSchema`.

## Technical Context

**Language/Version**: TypeScript (SvelteKit, Svelte 5 runes)

**Primary Dependencies**: SvelteKit, Svelte 5 (`$state`, `$derived`), Zod v4, layerchart (D3-based charts), bits-ui, TailwindCSS, Storybook

**Storage**: N/A — client-side state only (`strategyState` singleton)

**Testing**: Vitest (unit), Playwright (e2e), Cucumber/Gherkin (BDD in `features/`)

**Target Platform**: Web browser (SvelteKit SSR/CSR)

**Project Type**: Frontend web application (SvelteKit virtual module under `frontend/typescript/`)

**Performance Goals**: Output Panel renders results within 1 second of receiving data (SC-003); page loads without error in 100% of cases (SC-001)

**Constraints**: Viewport support 768px–1920px; mobile (<768px) out of scope; no secrets or external API calls introduced by this feature (backtest execution is already wired in `strategyState`)

**Scale/Scope**: Single-page refactor; two new organism components; one new Zod schema; one new Storybook story per organism; one new BDD feature file

## Constitution Check

| Gate | Rule | Check | Status |
| ---- | ---- | ----- | ------ |
| Branch name follows `###-feature-name` format | Rule 1 | `011-strategy-builder-panels` matches `[0-9]{3}-[a-z_-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios across 3 user stories | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | Feature is frontend-only; no Docker changes | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Existing CI covers these; tasks include Storybook + BDD verification | ✅ |
| Required directory structure included | Rule 9 | `features/` will receive new `.feature` file; `deploy/docker/` untouched | ✅ |
| UI components follow Atomic Design + Storybook (Rule 12) | Rule 12 | Organisms scoped at correct level; Storybook stories precede backend work | ✅ |
| Virtual module structure respected | Rule 11 | Components land in `src/lib/components/organisms/` under `frontend/typescript/` | ✅ |
| No secrets or credentials in planned artifacts | Rule 4 | No secrets introduced | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/011-strategy-builder-panels/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── strategy-builder-ui.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── components/
│   │   └── organisms/
│   │       ├── StrategyInputPanel.svelte        # NEW: Input Panel organism
│   │       └── StrategyOutputPanel.svelte       # NEW: Output Panel organism
│   ├── schemas/
│   │   ├── strategy-input-panel.schema.ts       # NEW: Zod schema for Input Panel props
│   │   └── strategy-output-panel.schema.ts      # NEW: Zod schema for Output Panel props
│   └── state/
│       └── strategy.svelte.ts                   # EXISTING: extended with run/loading/error state
└── routes/
    └── strategy-builder/
        └── +page.svelte                         # MODIFIED: composes the two organisms

features/
└── strategy-builder-panels.feature              # NEW: BDD scenarios

src/
└── stories/
    ├── StrategyInputPanel.stories.ts            # NEW: Storybook story
    └── StrategyOutputPanel.stories.ts           # NEW: Storybook story
```
