# Implementation Plan: Performance Summary & Edit Modal Organisms

**Branch**: `020-performance-summary-edit-modal-organisms` | **Date**: 2026-06-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/020-performance-summary-edit-modal-organisms/spec.md`

## Summary

Extract two inline UI blocks from `src/routes/performance-result/+page.svelte` into standalone Svelte 5 organisms — `PerformanceSummary` and `EditMetricModal` — each with local Zod-validated state and corresponding schema files under `src/lib/schemas/`.

## Technical Context

**Language/Version**: TypeScript 5 / SvelteKit (Svelte 5 runes)

**Primary Dependencies**: Zod (already present), shadcn-svelte Dialog/Button/Input/Label components, `$lib/shared-mockdata/performance` for `samplePerfSummary`

**Storage**: N/A (client-side state only)

**Testing**: Vitest + `@testing-library/svelte` (unit); Cucumber/Gherkin BDD in `features/`

**Target Platform**: Browser (SvelteKit SPA)

**Project Type**: Frontend web application (SvelteKit)

**Performance Goals**: Render within single reactive cycle; no perceptible latency

**Constraints**: Organisms must be independently mountable; no global state mutations inside organisms

**Scale/Scope**: Two new organism files; two new schema files; one updated page; one BDD feature file

## Constitution Check

| Gate | Rule | Check | Status |
|------|------|-------|--------|
| Branch name follows `###-feature-name` format | Rule 1 | `020-performance-summary-edit-modal-organisms` matches `[0-9]{3}-[a-z_-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios in User Story 1 & 2 | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | No Docker changes in this feature | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Tasks will include verification that existing CI gates pass | ✅ |
| Required directory structure included | Rule 9 | `features/` present; no new directories required | ✅ |
| UI components follow Atomic Design + Storybook (if frontend feature) | Rule 12 | Storybook story tasks MUST be included for both new organisms | ✅ |
| Virtual module structure respected (if adding new module) | Rule 11 | Existing `src/` structure followed; no new virtual module | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | No secrets involved | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/020-performance-summary-edit-modal-organisms/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── components/
│   │   └── organisms/
│   │       ├── PerformanceSummary.svelte        ← NEW
│   │       └── EditMetricModal.svelte           ← NEW
│   └── schemas/
│       ├── performance-summary.schema.ts        ← NEW
│       ├── edit-metric-modal.schema.ts          ← NEW
│       └── index.ts                             ← UPDATE (add exports)
└── routes/
    └── performance-result/
        └── +page.svelte                         ← UPDATE

features/
└── performance-summary-edit-modal-organisms.feature  ← NEW

e2e-tests/
└── (no new e2e test required for this refactor)
```

**Structure Decision**: Single-project frontend layout. All new files follow the established `src/lib/` organism and schema conventions confirmed by inspection of `RegimeBreakdownTable.svelte`, `PerformanceMetricGrid.svelte`, and their schema counterparts.
