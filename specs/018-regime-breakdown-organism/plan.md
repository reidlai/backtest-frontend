# Implementation Plan: Regime Breakdown Organism

**Branch**: `018-regime-breakdown-organism` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/018-regime-breakdown-organism/spec.md`

## Summary

Extract the inline Regime Breakdown `<div>` from `src/routes/performance-result/+page.svelte` into a new self-contained Svelte organism component (`RegimeBreakdownTable.svelte`). The organism manages its own local state (seeded from existing mock data), validates rows against the existing `RegimeBreakdownSchema` Zod schema before rendering, and shows a "No data available" message when the array is empty. No props are accepted; mock data is temporary until a future API integration feature replaces it.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (SvelteKit)

**Primary Dependencies**: Svelte 5 (`$state`, `$derived`), Zod (existing), shadcn-svelte Table primitives (existing)

**Storage**: N/A

**Testing**: Vitest (unit), Playwright (e2e), Cucumber/Gherkin (BDD — `features/`)

**Target Platform**: Web browser (SvelteKit SSR/CSR)

**Project Type**: Web application — frontend SvelteKit module

**Performance Goals**: No specific targets; static mock data, no async operations

**Constraints**: No new external dependencies. Existing `RegimeBreakdownSchema` must not be changed.

**Scale/Scope**: Single component refactor. One new `.svelte` file, one updated page, one new `.feature` file.

## Constitution Check

| Gate | Rule | Check | Status |
| ---- | ---- | ----- | ------ |
| Branch name follows `###-feature-name` format | Rule 1 | `018-regime-breakdown-organism` matches `[0-9]{3}-[a-z_-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios in all three user stories | ✅ |
| Docker image uses distroless base | Rule 3 | No Docker changes in this feature | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Existing CI pipeline covers all gates; no new CI jobs needed | N/A |
| Required directory structure included | Rule 9 | `features/` exists; new `regime-breakdown-organism.feature` planned | ✅ |
| UI components follow Atomic Design + Storybook | Rule 12 | Organism component; Storybook story task included in plan | ✅ |
| Virtual module structure respected | Rule 11 | Component placed in `src/lib/components/organisms/` per project convention | ✅ |
| No secrets or credentials in planned artifacts | Rule 4 | No secrets involved | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/018-regime-breakdown-organism/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── components/
│   │   └── organisms/
│   │       └── RegimeBreakdownTable.svelte         (NEW)
│   └── schemas/
│       └── regime-breakdown.schema.ts              (existing, unchanged)
└── routes/
    └── performance-result/
        └── +page.svelte                            (UPDATED — replace inline div with <RegimeBreakdownTable />)

features/
└── regime-breakdown-organism.feature               (NEW — BDD scenarios)
```

**Structure Decision**: Single SvelteKit project; organism placed in `src/lib/components/organisms/` consistent with all existing organisms (e.g., `PerformanceMetricGrid.svelte`, `TradeLotTable.svelte`).

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design

See [data-model.md](./data-model.md).
