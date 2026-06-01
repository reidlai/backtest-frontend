# Implementation Plan: Billing Card Organisms

**Branch**: `015-billing-card-organisms` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-billing-card-organisms/spec.md`

## Summary

Extract the three inline billing cards in `src/routes/setting-billing/+page.svelte` into three
self-contained Svelte organism components (`TokenUsageCard`, `BacktestRunsCard`,
`SystemStatusCard`), each with a dedicated Zod schema and local `$state` — following the
established `ResourceCostPanel` / `ResourceUsageSchema` pattern already in the codebase.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode)

**Primary Dependencies**: Zod 3.x (runtime), `$lib/components/ui/card`, `$lib/components/ui/progress`, `$lib/shared-mockdata/strategy`

**Storage**: N/A — display-only organisms; no persistence

**Testing**: Vitest (unit), Cucumber/Gherkin BDD (behavioral), Storybook (visual verification)

**Target Platform**: SvelteKit web application (browser)

**Project Type**: Frontend organism refactor within existing SvelteKit app

**Performance Goals**: No specific latency targets — render-only components on a static data page

**Constraints**: Visual output of the billing page MUST be identical to the pre-refactor state; no new dependencies may be introduced

**Scale/Scope**: 3 organism components, 3 schema files, 3 Storybook stories, 1 BDD feature file, 1 page updated

## Constitution Check

| Gate | Rule | Check | Status |
|---|---|---|---|
| Branch name follows `###-feature-name` format | Rule 1 | `015-billing-card-organisms` matches `[0-9]{3}-[a-z-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios for all 3 organisms | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | No Docker changes in scope | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Tasks include `ci-format-lint` and `ci-unit-tests` | ✅ |
| Required directory structure included | Rule 9 | `features/` present; `deploy/docker/` unchanged | ✅ |
| UI components follow Atomic Design + Storybook (if frontend feature) | Rule 12 | Storybook verification tasks precede backend implementation | ✅ |
| Virtual module structure respected (if adding new module) | Rule 11 | No new module; files added within existing `src/lib/` tree | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | Mock data only; no secrets | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/015-billing-card-organisms/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

> `quickstart.md` is not generated for this feature — it is a display-only UI refactor with no runtime setup steps.


### Source Code (repository root)

```text
src/
├── lib/
│   ├── components/
│   │   └── organisms/
│   │       ├── TokenUsageCard.svelte          # NEW
│   │       ├── BacktestRunsCard.svelte        # NEW
│   │       └── SystemStatusCard.svelte        # NEW
│   └── schemas/
│       ├── token-usage-card.schema.ts         # NEW
│       ├── backtest-runs-card.schema.ts       # NEW
│       ├── system-status-card.schema.ts       # NEW
│       └── index.ts                           # UPDATED (add 3 exports)
└── routes/
    └── setting-billing/
        └── +page.svelte                       # UPDATED (import 3 organisms)

src/stories/
├── TokenUsageCard.stories.svelte              # NEW
├── BacktestRunsCard.stories.svelte            # NEW
└── SystemStatusCard.stories.svelte            # NEW

features/
└── billing-card-organisms.feature             # NEW

features/
└── zod-schema-organisms.feature               # UPDATED (organism + schema counts)

src/lib/schemas/__tests__/
└── billing-card-organisms.schema.test.ts      # NEW (Vitest schema unit tests)
```

**Structure Decision**: Single-project SvelteKit layout. New files placed in existing `organisms/` and `schemas/` directories consistent with all prior organism features (005, 007, 010, 013, 014).

## Phase 0: Research

_Findings captured in [research.md](./research.md)._

## Phase 1: Design & Contracts

_Design artifacts in [data-model.md](./data-model.md) and [contracts/](./contracts/)._
