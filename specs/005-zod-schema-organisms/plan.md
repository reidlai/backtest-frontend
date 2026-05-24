# Implementation Plan: Zod Schema per Organism

**Branch**: `005-zod-schema-organisms` | **Date**: 2026-05-24 | **Spec**: `specs/005-zod-schema-organisms/spec.md`

**Input**: Feature specification from `specs/005-zod-schema-organisms/spec.md`

## Summary

Add `zod` as a runtime dependency and create one Zod schema file per organism under `src/lib/schemas/` (16 files + 1 index barrel), 18 data-contract type schemas under `src/lib/schemas/types/` (18 files + 1 index barrel), and 3 state singleton schemas under `src/lib/schemas/state/` (3 files + 1 index barrel). Organisms with local `$state` consolidate scattered state variables into a single `let state = $state(Schema.parse({}))`. Each schema embeds `.default()` values, provides TypeScript types via `z.infer<typeof Schema>`, and supports runtime validation via `.parse()`/`.safeParse()`. Fields typed with existing TypeScript interfaces use `z.custom<T>()` initially, then migrate to `z.array(TypeSchema)` once type schemas exist. Global state singleton classes (`AppState`, `BacktestState`, `StrategyState`) derive their default values from Zod schemas rather than hardcoded class-body values.

## Technical Context

**Language/Version**: TypeScript 6.0.2, Svelte 5.55.2, SvelteKit 2.57.0

**Primary Dependencies**: Svelte 5 (`$state`/`$props` runes), zod 3.x (to be added — see research.md)

**Storage**: N/A

**Testing**: Vitest 4.1.3 (unit), Playwright 1.59.1 (e2e), Storybook 10.4.0 (component stories)

**Target Platform**: Web browser (SvelteKit SSR + client hydration)

**Project Type**: SvelteKit frontend web application

**Performance Goals**: N/A — `Schema.parse({})` at component initialization is negligible; schema compilation is build-time

**Constraints**:
- `z.custom<T>()` interim for all fields typed via existing TypeScript interfaces; replaced by `z.array(TypeSchema)` once `src/lib/schemas/types/` schemas exist (FR-012)
- `zod` must be a runtime dependency (`.parse()` runs in the browser)
- Package manager: `pnpm`
- State singleton class bodies MUST NOT duplicate schema defaults — class initializers use `Schema.parse({}).fieldName`

**Scale/Scope**: 16 organism schemas + 18 data-type schemas + 3 state schemas + 3 index barrels + 5 organism schema updates (FR-012) + 4 organism component updates + 3 state class updates + 1 BDD feature file = ~40 new/modified files

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate | Rule | Check | Status |
|---|---|---|---|
| Branch name follows `###-feature-name` format | Rule 1 | `005-zod-schema-organisms` matches `[0-9]{3}-[a-z_-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then in all 3 user stories | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | Feature does not touch Docker | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Tasks will include `ci-sca`, `ci-format-lint`, `ci-secrets-scan`, `ci-unit-tests` | ✅ |
| Required directory structure included | Rule 9 | `features/`, `e2e-tests/`, `deploy/docker/` all exist | ✅ |
| UI components follow Atomic Design + Storybook (Rule 12, step 4) | Rule 12 | Storybook stories exist for all 9 stateful organisms; this feature is step 4 of Rule 12 workflow (Zod schemas after Storybook verification) | ✅ |
| Virtual module structure respected | Rule 11 | No new module; `src/lib/schemas/` added within existing SvelteKit project structure | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | Schema layer only; no secrets involved | ✅ |

**Violations**: None. All gates pass or are N/A.

## Project Structure

### Documentation (this feature)

```text
specs/005-zod-schema-organisms/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/lib/schemas/                          ← NEW directory (organism schemas)
├── index.ts                              ← barrel re-export for organism schemas
├── ai-chat-panel.schema.ts
├── ai-research-box.schema.ts
├── ai-review-panel.schema.ts
├── ai-review-sidebar.schema.ts
├── dashboard-metric-grid.schema.ts
├── function-gateways.schema.ts
├── live-control-form.schema.ts
├── main-menu-group.schema.ts
├── navigation-sidebar.schema.ts
├── performance-chart-tabs.schema.ts
├── performance-metric-grid.schema.ts
├── quick-actions-panel.schema.ts
├── resource-cost-panel.schema.ts
├── result-menu-group.schema.ts
├── stub-section.schema.ts
├── top-bar.schema.ts
├── types/                                ← NEW subdirectory (data-contract type schemas — FR-011)
│   ├── index.ts                          ← barrel re-export for type schemas
│   ├── time-series-point.schema.ts
│   ├── monthly-return.schema.ts
│   ├── metric-tile.schema.ts
│   ├── nav-section.schema.ts
│   ├── chat-message.schema.ts
│   ├── function-gateway-card.schema.ts
│   ├── market-metric.schema.ts
│   ├── market-regime.schema.ts
│   ├── screener-result.schema.ts
│   ├── backtest-result.schema.ts
│   ├── regime-breakdown.schema.ts
│   ├── perf-summary-item.schema.ts
│   ├── strategy.schema.ts
│   ├── risk-flag.schema.ts
│   ├── ai-review.schema.ts
│   ├── resource-usage.schema.ts
│   ├── trade-record.schema.ts
│   └── sentiment-event.schema.ts
└── state/                                ← NEW subdirectory (state singleton schemas — FR-013)
    ├── index.ts                          ← barrel re-export for state schemas
    ├── app-state.schema.ts
    ├── backtest-state.schema.ts
    └── strategy-state.schema.ts

src/lib/types/index.ts                    ← MODIFIED — add PerfSummaryItem interface
src/lib/state/app.svelte.ts               ← MODIFIED — init from AppStateSchema.parse({})
src/lib/state/backtest.svelte.ts          ← MODIFIED — init from BacktestStateSchema.parse({})
src/lib/state/strategy.svelte.ts          ← MODIFIED — init from StrategyStateSchema.parse({})

src/lib/components/organisms/             ← MODIFIED (10 files with local $state or display data)
├── AIChatPanel.svelte                    ← consolidate chatInput + messages → state
├── AIResearchBox.svelte                  ← consolidate aiText + validationError → state
├── AIReviewPanel.svelte                  ← wire review → schema state (Phase 6, T071)
├── DashboardMetricGrid.svelte            ← wire metrics → schema state (T072)
├── FunctionGateways.svelte               ← wire gatewayCards → schema state (T076)
├── MainMenuGroup.svelte                  ← wire mainSections → schema state (T077)
├── PerformancdeChartTabs.svelte          ← consolidate activeChartTab → state
├── PerformanceMetricGrid.svelte          ← consolidate 5 state vars → state
├── ResourceCostPanel.svelte              ← wire resourceUsage → schema state (T073)
└── ResultMenuGroup.svelte                ← wire resultSections → schema state (T078)

features/
└── zod-schema-organisms.feature          ← NEW BDD feature file

package.json                              ← MODIFIED — add zod runtime dependency
```

**Structure Decision**: Single-project SvelteKit layout. Organism schemas under `src/lib/schemas/` mirror organism naming. Data-contract type schemas live in `src/lib/schemas/types/`. State singleton schemas live in `src/lib/schemas/state/`. All use kebab-case with `.schema.ts` suffix.
