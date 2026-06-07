# Implementation Plan: RxJS State Management

**Branch**: `022-rxjs-state-management` | **Date**: 2026-06-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/022-rxjs-state-management/spec.md`

## Summary

Add two new Zodios API client endpoints for `GET /v1/market-metrics` (collection and model), introduce an `src/lib/rxjs/` module with RxJS `BehaviorSubject`-backed streams for market metrics, strategies, and backtest runs, and wire those streams into Svelte 5 `$state` modules via layout-level subscriptions. The RxJS layer handles request cancellation (`switchMap`), error isolation, and replay semantics. State modules remain RxJS-free.

## Technical Context

**Language/Version**: TypeScript 5.x / SvelteKit 2.x (Svelte 5.55)

**Primary Dependencies**:
- `@zodios/core` 11.0.0-beta.19 (existing)
- `zod` ^4.4.3 (existing)
- `rxjs` ^7.8.1 (new — to be added to `package.json`)
- `svelte` ^5.55.2 (existing)
- `vitest` ^4.1.3 (existing)

**Storage**: N/A (in-memory reactive state only)

**Testing**: Vitest (unit), Gherkin/Cucumber BDD (features/)

**Target Platform**: Browser (SvelteKit SSR-aware; streams initialise client-side in `onMount`)

**Project Type**: Frontend SvelteKit web application

**Performance Goals**: Single completed network request per `refresh()` call; in-flight cancellation via `switchMap`; subscriber replay latency < 1 event loop tick

**Constraints**: RxJS imports MUST NOT appear in `src/lib/state/` files (existing BDD constraint); streams must be singletons; no auto-fetch on module import

**Scale/Scope**: 3 resource streams × 3 BehaviorSubjects each (data, error, loading) = 9 subjects total

## Constitution Check

| Gate | Rule | Check | Status |
|------|------|-------|--------|
| Branch name follows `###-feature-name` format | Rule 1 | `022-rxjs-state-management` matches `[0-9]{3}-[a-z_-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios in all three user stories | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | No Docker changes; pure frontend state library | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Tasks will include ci-sca, ci-format-lint, ci-secrets-scan, ci-unit-tests | ✅ |
| Required directory structure included | Rule 9 | No new top-level directories required; `features/` exists | ✅ |
| UI components follow Atomic Design + Storybook (if frontend feature) | Rule 12 | No new UI components; pure state/data layer — Storybook not required | N/A |
| Virtual module structure respected | Rule 11 | Adding to `src/lib/` (SvelteKit convention); no new virtual module | ✅ |
| No secrets or credentials in planned artifacts | Rule 4 | All auth via existing Zodios JWT injection; no secrets in code | ✅ |

**Violations**: None. All applicable gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/022-rxjs-state-management/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── rxjs-module-api.md
├── checklists/
│   └── requirements.md
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/lib/
├── zodios/
│   ├── schemas/
│   │   └── market-metric.schema.ts          ← NEW: API-aligned Zod schema
│   ├── client.ts                            ← MODIFIED: add listMarketMetrics, getMarketMetric endpoints
│   └── index.ts                             ← MODIFIED: export new schemas + types
├── rxjs/                                    ← NEW directory
│   ├── market-metrics.stream.ts             ← NEW: BehaviorSubject stream for market metrics
│   ├── strategies.stream.ts                 ← NEW: BehaviorSubject stream for strategies
│   ├── backtest-runs.stream.ts              ← NEW: BehaviorSubject stream for backtest runs
│   └── index.ts                             ← NEW: barrel export
└── state/
    └── market-metric.svelte.ts              ← NEW: Svelte $state module for market metrics
    (strategy-list.svelte.ts unchanged)      ← no structural change
    (backtest-run.svelte.ts unchanged)       ← no structural change

features/
└── rxjs-state-management.feature           ← NEW: BDD Gherkin scenarios

src/lib/rxjs/__tests__/
├── market-metrics.stream.test.ts           ← NEW: unit tests
├── strategies.stream.test.ts               ← NEW: unit tests
└── backtest-runs.stream.test.ts            ← NEW: unit tests
```

**Note on layout wiring**: The subscription glue (connecting RxJS streams to Svelte $state) is placed in `src/routes/+layout.svelte` or an equivalent app entry point. No state module imports RxJS directly.

## Implementation Phases

### Phase A: Schema & Client Extension

1. Create `src/lib/zodios/schemas/market-metric.schema.ts`:
   - `MarketMetricResultSchema` (symbol, name, value, change, change_pct, as_of, stale)
   - `MarketMetricCollectionResultSchema` (items array + as_of)
   - Export TypeScript types

2. Update `src/lib/zodios/client.ts`:
   - Add `listMarketMetrics` endpoint: `GET /v1/market-metrics`
   - Add `getMarketMetric` endpoint: `GET /v1/market-metrics/:symbol`

3. Update `src/lib/zodios/index.ts`:
   - Export `MarketMetricResultSchema`, `MarketMetricCollectionResultSchema` and their types

### Phase B: RxJS Stream Modules

4. Install RxJS: `pnpm add rxjs`

5. Create `src/lib/rxjs/market-metrics.stream.ts`:
   - Internal `Subject<void>` refresh trigger
   - `BehaviorSubject<MarketMetricCollectionResult | null>` data subject
   - `BehaviorSubject<Error | null>` error subject
   - `BehaviorSubject<boolean>` loading subject
   - `switchMap` pipeline wired to `apiClient.listMarketMetrics()`
   - Exported `refresh()` function and subjects

6. Create `src/lib/rxjs/strategies.stream.ts` (same pattern, `apiClient.listStrategies()`)

7. Create `src/lib/rxjs/backtest-runs.stream.ts` (same pattern, `apiClient.listBacktestRuns()`)

8. Create `src/lib/rxjs/index.ts` barrel export with aliased names

### Phase C: Svelte State Module

9. Create `src/lib/state/market-metric.svelte.ts`:
   - Class with `data: MarketMetricCollectionResult | null`, `loading: boolean`, `error: Error | null`
   - All properties as Svelte 5 `$state`
   - Exported singleton `marketMetricState`

10. Verify `strategy-list.svelte.ts` and `backtest-run.svelte.ts` remain unchanged (no RxJS imports added)

### Phase D: Layout Wiring

11. Add subscription glue in `src/routes/+layout.svelte` (or nearest app entry `onMount`):
    - Subscribe `data$`, `error$`, `loading$` from each stream to corresponding state properties
    - Call `refresh()` for each stream in `onMount`
    - Unsubscribe all in `onDestroy`

### Phase E: Tests & BDD

12. Write unit tests in `src/lib/rxjs/__tests__/` for each stream module:
    - Verify initial `null` values
    - Verify `refresh()` triggers fetch and emits result
    - Verify error isolation (data$ retains last good value)
    - Verify `switchMap` cancellation (mock slow + fast refresh)

13. BDD feature file `features/rxjs-state-management.feature` already created (Phase 1 artifact)

14. Update `features/zodios-api-client.feature` Scenario "State modules compile without RxJS dependency" — add clarifying comment that `src/lib/rxjs/` is the approved import location; `src/lib/state/` remains RxJS-free

### Phase F: Zod Schema Tests

15. Add test cases to `src/lib/zodios/__tests__/schemas.test.ts` (or new file):
    - Parse OpenAPI example `MarketMetricResult` payload → assert success + field values
    - Parse `MarketMetricCollectionResult` with five items → assert success
    - Parse payload with missing required field → assert ZodError

## Complexity Tracking

No constitution violations to justify.
