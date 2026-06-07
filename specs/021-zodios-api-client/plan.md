# Implementation Plan: Zodios API Client with OpenAPI-Derived Zod Schemas

**Branch**: `021-zodios-api-client` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/021-zodios-api-client/spec.md`

## Summary

Introduce a typed Zodios API client (`@zodios/core` v11, native fetch) backed by Zod schemas derived from the backtest-eapi OpenAPI spec. All 21 schemas (17 response types + 4 request body types) are placed under `src/lib/zodios/schemas/` and re-exported via `src/lib/zodios/index.ts`. Existing `src/lib/schemas/` files that overlap are updated in-place to re-export from the canonical source, preserving import paths. Svelte 5 rune state modules (`*.svelte.ts`) are created in `src/lib/state/` for each API resource domain. Four existing organisms are updated to accept decomposed OpenAPI-aligned props instead of monolithic legacy schemas.

**SC-003 correction**: The OpenAPI spec defines 15 endpoints, not 13. SC-003 is revised to "all 15 API endpoints represented". All 15 are listed in research.md.

## Technical Context

**Language/Version**: TypeScript 5.x / Node ≥ 24

**Primary Dependencies**:
- `@zodios/core` v11 (native fetch adapter) — to be installed
- `zod` v4.4.3 (already installed)
- `svelte` v5.55.2 (already installed)
- `@sveltejs/kit` v2.57.0 (already installed)
- `vitest` v4.1.3 (unit tests)
- `playwright` v1.59.1 (e2e tests)

**Storage**: N/A (no server-side storage; in-memory Svelte 5 rune state only)

**Testing**: vitest (unit tests in `src/lib/schemas/__tests__/`, new tests in `src/lib/zodios/__tests__/` and `src/lib/state/__tests__/`), Playwright (e2e — existing, not changed in this feature)

**Target Platform**: Browser (SvelteKit, `@sveltejs/adapter-node`)

**Project Type**: Web application (frontend)

**Performance Goals**: Schema parse latency < 5 ms per response (Zod is synchronous CPU-only)

**Constraints**: Zero new `any` types; zero RxJS dependency; `@zodios/core` v11 must use native fetch (no Axios)

**Scale/Scope**: 21 schemas, 15 endpoints, 4 state modules, 4 organism file updates

## Constitution Check

| Gate | Rule | Check | Status |
|------|------|-------|--------|
| Branch name follows `###-feature-name` format | Rule 1 | Branch is `021-zodios-api-client` — matches `[0-9]{3}-[a-z_-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios in all 4 User Stories | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | No Docker changes in this feature | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Tasks will include `ci-sca`, `ci-format-lint`, `ci-secrets-scan`, `ci-unit-tests` | ✅ |
| Required directory structure included | Rule 9 | `features/` exists; `deploy/docker/` not applicable to this feature | ✅ |
| UI components follow Atomic Design + Storybook (if frontend feature) | Rule 12 | Organism updates are schema-driven field renames, not new components; Storybook stories updated in tasks | ✅ |
| Virtual module structure respected (if adding new module) | Rule 11 | New modules go under `src/lib/zodios/` and `src/lib/state/` — consistent with existing layout | ✅ |
| No secrets or credentials in planned artifacts | Rule 4 | Base URL from env var; JWT injection deferred; no secrets in code | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/021-zodios-api-client/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── endpoints.ts     # Zodios endpoint array definition
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── zodios/                           # NEW — Zodios client + canonical schemas
│   │   ├── schemas/
│   │   │   ├── error-response.schema.ts        # ErrorResponse (RFC 7807)
│   │   │   ├── health.schema.ts                # HealthResponse
│   │   │   ├── strategy.schema.ts              # StrategyResult, PagedStrategyResult
│   │   │   ├── strategy-config.schema.ts       # StrategyConfig, EntryConfig, ExitConfig, LiquidityFilter
│   │   │   ├── backtest-run.schema.ts          # BacktestRunResult, PagedBacktestRunResult, BacktestConfig
│   │   │   ├── backtest-result.schema.ts       # BacktestResultResource, PagedBacktestResultResource
│   │   │   ├── performance-metrics.schema.ts   # PerformanceMetrics
│   │   │   ├── equity-curve.schema.ts          # EquityCurve
│   │   │   ├── trade-record.schema.ts          # TradeRecord
│   │   │   ├── signal-record.schema.ts         # SignalRecord
│   │   │   ├── action-response.schema.ts       # ActionResponse
│   │   │   └── request-bodies.schema.ts        # All 4 request body types
│   │   ├── client.ts                           # Zodios singleton client
│   │   └── index.ts                            # Barrel re-export
│   ├── schemas/                          # EXISTING — updated to re-export from zodios/schemas/
│   │   ├── backtest-result.schema.ts     # Updated: re-exports from zodios/schemas/
│   │   ├── trade-record.schema.ts        # Updated: re-exports from zodios/schemas/
│   │   ├── strategy.schema.ts            # Unchanged (UI abstraction)
│   │   ├── backtest-runs-card.schema.ts  # Unchanged (billing UI)
│   │   └── performance-metric-grid.schema.ts  # Unchanged (UI interaction state)
│   ├── state/                            # EXISTING + NEW state modules
│   │   ├── app.svelte.ts                 # Unchanged
│   │   ├── order-types-config.svelte.ts  # Unchanged
│   │   ├── schedule-execution-config.svelte.ts  # Unchanged
│   │   ├── strategy.svelte.ts            # Unchanged
│   │   ├── universe-capital-config.svelte.ts    # Unchanged
│   │   ├── strategy-list.svelte.ts       # NEW: PagedStrategyResult + loading + error
│   │   ├── backtest-run.svelte.ts        # NEW: PagedBacktestRunResult + sub-state + loading + error
│   │   └── backtest-result.svelte.ts     # NEW: PagedBacktestResultResource + loading + error
│   └── components/organisms/
│       ├── TradeLotTable.svelte          # Updated: snake_case fields, exit_reason column
│       ├── PerformanceSummary.svelte     # Updated: 4 separate props
│       ├── PerformanceMetricGrid.svelte  # Updated: performanceMetrics prop, UI state stays local
│       └── PerformancdeChartTabs.svelte  # Updated: 4 separate props (note: typo preserved)

features/
└── zodios-api-client.feature             # NEW: BDD acceptance tests (Gherkin)

src/lib/zodios/__tests__/
└── schemas.test.ts                       # NEW: Zod schema parse tests

src/lib/state/__tests__/
└── state.test.ts                         # NEW: State read/write tests

src/lib/schemas/__tests__/
├── trade-record.schema.test.ts           # UPDATED: snake_case fields
└── backtest-result.schema.test.ts        # CREATED: tests for re-export compatibility adapter
```

**Structure Decision**: Single SvelteKit project. New `src/lib/zodios/` module for canonical schemas and client. Existing `src/lib/schemas/` updated to re-export, not deleted. New `src/lib/state/` modules added alongside existing ones.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|-----------|--------------------------------------|
| Rule 12 ordering inverted — Zod schemas created before Storybook verification | Schemas are derived FROM the existing backtest-eapi OpenAPI spec, not invented to drive new UI. Organism changes (FR-012, FR-013) are field renames on existing components, not new component creation. The canonical schemas must exist before Storybook story fixtures can reference correct typed fields. | Writing Storybook stories first with placeholder prop types would require a second Storybook update pass once real schemas are defined — double work. The spirit of Rule 12 (UI requirements drive API contract) does not apply when the direction is reversed: migrating an existing external API's types into the frontend. |
