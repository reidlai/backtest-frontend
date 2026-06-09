# Tasks: RxJS State Management (022)

**Input**: Design documents from `specs/022-rxjs-state-management/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**BDD-First (Constitution Rule 6 — MANDATORY)**: BDD feature file `features/rxjs-state-management.feature` already created in planning phase. It is listed in Phase 1 for traceability and MUST be verified before any implementation task is marked complete.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependency, verify BDD feature file exists, and validate project scaffolding is ready.

- [x] T001 Install `rxjs ^7.8.1` via `pnpm add rxjs` and verify `package.json` dependency entry
- [x] T002 [BDD] Verify `features/rxjs-state-management.feature` is present, tagged `@smoke @api`, and covers all three user stories (Constitution Rule 6 — MUST precede implementation)
- [x] T003 [P] Create `src/lib/rxjs/` directory with empty `index.ts` placeholder to unblock parallel stream authoring

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the API-aligned Zod schema and extend the Zodios client — both are prerequisites for all three RxJS stream modules.

**⚠️ CRITICAL**: All three user story phases depend on this phase completing first.

- [x] T004 [ZOD] Create `src/lib/zodios/schemas/market-metric.schema.ts` with `MarketMetricResultSchema` (symbol, name, value, change, change_pct, as_of, stale) and `MarketMetricCollectionResultSchema` (items array + as_of) — types exported as `MarketMetricResult` and `MarketMetricCollectionResult`
- [x] T005 Update `src/lib/zodios/client.ts` — add `listMarketMetrics` endpoint (`GET /v1/market-metrics`, response `MarketMetricCollectionResultSchema`) and `getMarketMetric` endpoint (`GET /v1/market-metrics/:symbol`, response `MarketMetricResultSchema`) to `backtestEapiEndpoints` array
- [x] T006 Update `src/lib/zodios/index.ts` — export `MarketMetricResultSchema`, `MarketMetricCollectionResultSchema`, `MarketMetricResult`, `MarketMetricCollectionResult`
- [x] T007 [P] Add Zod schema unit tests in `src/lib/zodios/__tests__/schemas.test.ts` — parse OpenAPI example `MarketMetricResult` payload (VIX, value 14.25, change -0.35, change_pct -2.4, stale false) and assert success; parse `MarketMetricCollectionResult` with five items; parse payload with missing `symbol` and assert ZodError

**Checkpoint**: Zodios client typed and validated — RxJS stream authoring can now begin in parallel across all three stories.

---

## Phase 3: User Story 1 — Market Metrics Live Data Feed (Priority: P1) 🎯 MVP

**Goal**: Deliver a fully reactive market-metrics BehaviorSubject stream wired to the Zodios `listMarketMetrics` endpoint, a new Svelte $state module, and layout-level subscription glue — so the five market metric tiles populate from the real API on page load.

**Independent Test**: Open the app (or run `pnpm dev`) — the market metrics top-bar shows five populated tiles (symbol, value, change, change_pct) fetched from `GET /v1/market-metrics`. Check browser network tab: only one request fires on load.

### Implementation for User Story 1

- [x] T008 [US1] Create `src/lib/rxjs/market-metrics.stream.ts` — implement internal `Subject<void>` refresh trigger; `BehaviorSubject<MarketMetricCollectionResult | null>` (`data$`); `BehaviorSubject<Error | null>` (`error$`); `BehaviorSubject<boolean>` (`loading$`); wire `switchMap(() => from(apiClient.listMarketMetrics()).pipe(catchError(...)))` pipeline; export `refresh()` function and the three subjects
- [x] T009 [US1] Create `src/lib/state/market-metric.svelte.ts` — `MarketMetricState` class with `data: MarketMetricCollectionResult | null = $state(null)`, `loading: boolean = $state(false)`, `error: Error | null = $state(null)`; export singleton `marketMetricState`
- [x] T010 [US1] Add subscription glue in `src/routes/+layout.svelte` (inside `onMount`) — subscribe `marketMetricsData$` → `marketMetricState.data`, `marketMetricsError$` → `marketMetricState.error`, `marketMetricsLoading$` → `marketMetricState.loading`; call `refreshMarketMetrics()`; unsubscribe all in `onDestroy`
- [x] T011 [US1] Write unit tests in `src/lib/rxjs/__tests__/market-metrics.stream.test.ts` — assert `data$` starts as `null`; mock `apiClient.listMarketMetrics` and assert `refresh()` emits result to `data$`; assert 401 error emits on `error$` while `data$` retains last good value; assert `loading$` transitions `false → true → false`; assert rapid double-`refresh()` results in only one emission (switchMap cancellation); **assert a second subscription to `marketMetricsData$` receives the last emitted value without triggering a new mock call** (BehaviorSubject replay — SC-002 parity). **Testing approach**: use `vi.fn()` mocks with `firstValueFrom` for synchronous value assertions; use `rxjs/testing` `TestScheduler` for marble-based timing assertions on `loading$` and switchMap cancellation. Document chosen approach in `src/lib/rxjs/__tests__/README.md`.
- [x] T011b [US1] Update `src/lib/components/organisms/DashboardMetricGrid.svelte` to render states driven by `marketMetricState` — show five skeleton placeholder cards while `marketMetricState.loading === true`; show an inline error banner with a retry button (calls `refreshMarketMetrics()`) when `marketMetricState.error !== null`; show a "no data available" message when `marketMetricState.data` is an empty collection (SC-001).

**Checkpoint**: US1 independently functional — market metrics tiles render live data with skeleton/error/empty states; error state preserved on API failure; `src/lib/state/` files import no RxJS symbols.

---

## Phase 4: User Story 2 — Strategy List Reactive State (Priority: P2)

**Goal**: Replace any direct Zodios calls in strategy-related pages with the new RxJS stream — strategies load reactively from `GET /v1/strategies` via BehaviorSubject and replay to late subscribers without a second network request.

**Independent Test**: Navigate to the strategies page. Open DevTools network tab — only one `GET /v1/strategies` request fires. Open a second component that subscribes to `strategiesData$` — no second request is made; it immediately receives the cached `PagedStrategyResult`.

### Implementation for User Story 2

- [x] T012 [US2] Create `src/lib/rxjs/strategies.stream.ts` — same three-BehaviorSubject pattern as `market-metrics.stream.ts`; wire `switchMap(() => from(apiClient.listStrategies()).pipe(catchError(...)))`; export `refresh()` as `refreshStrategies` and subjects as `strategiesData$`, `strategiesError$`, `strategiesLoading$`
- [x] T013 [US2] Add subscription glue in `src/routes/+layout.svelte` (inside the existing `onMount` block from T010) — subscribe `strategiesData$` → `strategyListState.data`, `strategiesError$` → `strategyListState.error`, `strategiesLoading$` → `strategyListState.loading`; call `refreshStrategies()`; add unsubscribe to `onDestroy`
- [x] T014 [US2] Write unit tests in `src/lib/rxjs/__tests__/strategies.stream.test.ts` — assert `data$` starts as `null`; mock `apiClient.listStrategies` and assert `refresh()` emits `PagedStrategyResult`; assert second subscription receives last value without triggering a new mock call; assert error path sets `strategiesError$` while `strategiesData$` retains prior value

**Checkpoint**: US2 independently functional — strategy list populated reactively; second subscriber gets cached value; `src/lib/state/strategy-list.svelte.ts` unchanged (no RxJS imports).

---

## Phase 5: User Story 3 — Backtest Runs Reactive State (Priority: P3)

**Goal**: Wire the backtest runs list to its own BehaviorSubject stream so run status transitions can be observed reactively and future polling/WebSocket push can be added without component rewrites.

**Independent Test**: Trigger a new backtest run creation. Call `refreshBacktestRuns()` — the `backtestRunsData$` emits the updated list and the UI reflects the new run count without a full page refresh.

### Implementation for User Story 3

- [x] T015 [US3] Create `src/lib/rxjs/backtest-runs.stream.ts` — same three-BehaviorSubject pattern; wire `switchMap(() => from(apiClient.listBacktestRuns()).pipe(catchError(...)))`; export `refresh()` as `refreshBacktestRuns` and subjects as `backtestRunsData$`, `backtestRunsError$`, `backtestRunsLoading$`
- [x] T016 [US3] Add subscription glue in `src/routes/+layout.svelte` (inside the existing `onMount` block) — subscribe `backtestRunsData$` → `backtestRunState.list`, `backtestRunsError$` → `backtestRunState.error`, `backtestRunsLoading$` → `backtestRunState.loading`; call `refreshBacktestRuns()`; add unsubscribe to `onDestroy`
- [x] T017 [US3] Write unit tests in `src/lib/rxjs/__tests__/backtest-runs.stream.test.ts` — assert `data$` starts as `null`; mock `apiClient.listBacktestRuns` and assert `refresh()` emits `PagedBacktestRunResult`; assert 401 error emits on `error$` with status 401; assert switchMap cancellation on rapid refresh; **assert a second subscription to `backtestRunsData$` receives the last emitted value without triggering a new mock call** (BehaviorSubject replay — SC-002 parity)

**Checkpoint**: US3 independently functional — backtest runs list reactive; state module unchanged; all three streams share the same structural pattern.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Wire the full barrel export, validate architectural constraints, and ensure CI gates pass.

- [x] T018 Update `src/lib/rxjs/index.ts` — export all six subjects and three `refresh()` functions with aliased names per `contracts/rxjs-module-api.md` (e.g., `marketMetricsData$`, `refreshMarketMetrics`, etc.)
- [x] T019 [P] Verify architectural constraint — run `grep -r "from 'rxjs'" src/lib/state/` and assert zero matches (BDD Scenario: "State modules contain no RxJS imports")
- [x] T020 [P] Update `features/zodios-api-client.feature` Scenario "State modules compile without RxJS dependency" — add inline comment clarifying that `src/lib/rxjs/` is the approved RxJS import boundary; `src/lib/state/` remains RxJS-free
- [x] T021 Run `pnpm vitest run src/lib/rxjs src/lib/zodios/__tests__` and confirm all unit tests pass
- [x] T022 Run `pnpm check` (Svelte type-check) and confirm zero type errors
- [x] T023 Run `pnpm lint` and confirm zero lint violations
- [x] T024 Run quickstart.md validation — follow steps 1–5 in `specs/022-rxjs-state-management/quickstart.md` and confirm expected output at each step

---

## Phase 7: Pino Logging (FR-011 / SC-007)

**Purpose**: Add structured debug/warn logging to all three RxJS stream modules. Logger level is controlled by the `PUBLIC_LOG_LEVEL` SvelteKit public env var (default `'info'`).

**⚠️ Browser constraint**: Must use `pino/browser` (not default pino). Raw `LOG_LEVEL` is inaccessible in browser bundles — use `PUBLIC_LOG_LEVEL` via `$env/static/public`.

- [x] T025 Install `pino ^8.x` via `pnpm add pino` and verify `package.json` dependency entry
- [x] T026 Create `src/lib/rxjs/logger.ts` — pino logger with level from `$env/dynamic/public` `PUBLIC_LOG_LEVEL` (default `'info'`); uses `browser: { asObject: true }` for Vite/SSR compatibility
- [x] T027 Update `src/lib/rxjs/market-metrics.stream.ts` — in `tap()` add `logger.debug({ resource: 'market-metrics', count: result.items?.length ?? 0 }, 'fetch ok')`; in `catchError()` add `logger.warn({ resource: 'market-metrics', message: error.message }, 'fetch error')`. No credentials logged.
- [x] T028 Update `src/lib/rxjs/strategies.stream.ts` and `backtest-runs.stream.ts` with the same logging pattern (resource names `'strategies'` and `'backtest-runs'` respectively)
- [x] T029 Add `PUBLIC_LOG_LEVEL=info` to `.env.example`; add a "Logging" section to `specs/022-rxjs-state-management/quickstart.md` documenting valid values (`debug`, `info`, `warn`, `error`) and the `PUBLIC_` prefix requirement

**Checkpoint**: With `PUBLIC_LOG_LEVEL=debug` in `.env.local`, browser devtools console shows one debug entry per successful refresh and one warn entry per error — no credential data in log output (SC-007).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS** all user story phases
- **Phase 3 (US1)**: Depends on Phase 2 — no dependency on US2 or US3
- **Phase 4 (US2)**: Depends on Phase 2 — no dependency on US1 or US3
- **Phase 5 (US3)**: Depends on Phase 2 — no dependency on US1 or US2
- **Phase 6 (Polish)**: Depends on all user story phases completing
- **Phase 7 (Logging)**: Depends on Phase 3 streams existing (T008, T012, T015); can run in parallel with Phase 6

### Within-Phase Dependencies

```
T001 → T002 → T003
T004 → T005 → T006   (T007 can run in parallel with T005–T006)
T008 → T009 → T010 → T011   (US1 sequential: stream → state → layout → tests)
T012 → T013 → T014           (US2 sequential)
T015 → T016 → T017           (US3 sequential)
T018 → T019, T020, T021, T022, T023 → T024
T025 → T026 → T027 → T028 → T029   (Phase 7 sequential: install → logger → streams → env)
```

> **Branch note**: T010, T013, and T016 all modify `src/routes/+layout.svelte`. The companion branch `fix/jwt-bearer-auth` (PR #95) is now merged; confirm all layout changes are present on `022-rxjs-state-management` before opening the feature PR. Constitution Rule 1 requires the final merge to originate from the correctly named branch.

> ⚠️ **Cross-phase file conflict**: T010, T013, and T016 all modify `src/routes/+layout.svelte`.
> These tasks MUST be executed sequentially in order (T010 → T013 → T016), even if US1, US2,
> and US3 streams are authored in parallel. Do NOT begin T013 until T010 is merged; do NOT
> begin T016 until T013 is merged. If working in parallel branches, co-author all three
> layout changes in a single task sequence before merging.

### Parallel Opportunities

- T007 can run in parallel with T005 and T006 (different files)
- T003 (create directory) unblocks T008, T012, T015 in parallel once Phase 2 is done
- US2 stream (T012, T014) can be authored in parallel with US1 (T008–T011), **but T013 MUST wait for T010** (same file: `+layout.svelte`)
- US3 stream (T015, T017) can be authored in parallel with US1/US2, **but T016 MUST wait for T013** (same file: `+layout.svelte`)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Parallel track A — Zod schema + export:
Task T004: Create src/lib/zodios/schemas/market-metric.schema.ts
Task T006: Update src/lib/zodios/index.ts

# Parallel track B — Client extension + tests:
Task T005: Update src/lib/zodios/client.ts
Task T007: Add schema unit tests in src/lib/zodios/__tests__/schemas.test.ts
```

## Parallel Example: User Stories 2 + 3 (after Phase 2)

```bash
# Developer A — US2:
Task T012: Create src/lib/rxjs/strategies.stream.ts
Task T013: Wire strategies in +layout.svelte
Task T014: Write strategies stream tests

# Developer B — US3:
Task T015: Create src/lib/rxjs/backtest-runs.stream.ts
Task T016: Wire backtest-runs in +layout.svelte
Task T017: Write backtest-runs stream tests
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T007)
3. Complete Phase 3: US1 — Market Metrics (T008–T011)
4. **STOP and VALIDATE**: Five market metric tiles show live data; error path isolated; no RxJS in state modules
5. Demo / deploy if ready

### Incremental Delivery

1. Setup + Foundational → Zodios client extended, schemas validated
2. US1 → Market metrics live → **MVP demo**
3. US2 → Strategy list reactive → second story delivered
4. US3 → Backtest runs reactive → full feature complete
5. Polish → barrel export, constraints verified, CI passes

---

## Notes

- `[P]` tasks = different files, no shared-state conflicts, safe to run in parallel
- `[BDD]` tasks (T002) MUST precede any implementation task — Constitution Rule 6
- `[ZOD]` tasks (T004) MUST precede Zodios client extension (T005) — data contract first
- `src/lib/state/` files MUST NOT import from `rxjs` or `$lib/rxjs` — enforced by T019
- `src/lib/rxjs/` modules are singletons — do not instantiate new subjects per import
- `onDestroy` cleanup (unsubscribe) MUST be implemented alongside every `onMount` subscription — T010, T013, T016
- Commit after each phase checkpoint for clean rollback points
