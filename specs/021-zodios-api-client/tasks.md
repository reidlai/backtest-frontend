# Tasks: Zodios API Client with OpenAPI-Derived Zod Schemas

**Input**: Design documents from `/specs/021-zodios-api-client/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/endpoints.ts ✅

**Branch**: `021-zodios-api-client`

**User Stories**:
- US1 (P1): Validate API Responses with Zod Schemas
- US2 (P1): Typed Zodios API Client for All Endpoints
- US3 (P2): Centralised State Structures for API Resources
- US4 (P2): Svelte 5 Rune-Based State for API Resources

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, BDD feature file tagging, dependency installation, and directory creation.

- [x] T001 [BDD] Tag `features/zodios-api-client.feature` with `@smoke` and `@api` tags on all scenarios (Constitution Rule 6 — BDD file already created in planning; must be tagged before implementation starts)
- [x] T001b [BDD] Create BDD step definitions for zodios-api-client scenarios in `features/step-definitions/zodios-api-client.steps.ts` — steps must be atomic and reusable (Constitution Rule 6 MUST); use vitest mock/stub for Zodios client and state; cover at minimum the schema parse steps, state write/read steps, and organism $props() steps
- [x] T002 Install `@zodios/core` dependency: run `pnpm add @zodios/core` from repo root
- [x] T003 Create directory structure: `src/lib/zodios/schemas/`, `src/lib/zodios/__tests__/`, `src/lib/state/__tests__/` (mkdir -p)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared schemas and barrel infrastructure that ALL user stories depend on. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: US1–US4 are all blocked on T004–T006.

- [x] T004 [ZOD] Create `src/lib/zodios/schemas/error-response.schema.ts` — `ErrorResponseSchema` with all five RFC 7807 fields (`type`, `title`, `status`, `detail`, `instance`) all required; export `type ErrorResponse = z.infer<typeof ErrorResponseSchema>`
- [x] T005 [ZOD] Create `src/lib/zodios/schemas/_paged.ts` — generic `pagedSchema<T>` factory returning `z.object({ total: z.number().int(), offset: z.number().int().optional(), limit: z.number().int().optional(), items: z.array(itemSchema) })`; export the factory function
- [x] T006 Create stub `src/lib/zodios/index.ts` — empty barrel file (will be filled in T023); must exist so TypeScript path resolution doesn't fail during schema development

**Checkpoint**: ErrorResponse, paged factory, and barrel stub in place — US1 implementation can begin.

---

## Phase 3: User Story 1 — Zod Schema Validation (Priority: P1) 🎯 MVP

**Goal**: Define all 21 Zod schemas (17 response types + 4 request body types) in `src/lib/zodios/schemas/`. Update existing `src/lib/schemas/` files to re-export from the canonical source. Update schema unit tests for changed schemas.

**Independent Test**: Import `TradeRecordSchema` from `$lib/zodios/schemas/trade-record.schema` and call `.parse()` on the OpenAPI example payload — no ZodError thrown, return type inferred without `any`.

### Implementation — Standalone Response Schemas (no cross-schema deps)

- [x] T007 [P] [US1] [ZOD] Create `src/lib/zodios/schemas/health.schema.ts` — `HealthResponseSchema` (`status: z.string()`, `version: z.string()` both required); export `type HealthResponse`
- [x] T008 [P] [US1] [ZOD] Create `src/lib/zodios/schemas/action-response.schema.ts` — `ActionResponseSchema` (`run_id: z.string().uuid()`, `status: z.string()` both required); export `type ActionResponse`
- [x] T009 [P] [US1] [ZOD] Create `src/lib/zodios/schemas/signal-record.schema.ts` — `SignalRecordSchema` (`timestamp`, `symbol`, `action`: `z.string()`, `conviction_score: z.number()` all required); export `type SignalRecord`
- [x] T010 [P] [US1] [ZOD] Create `src/lib/zodios/schemas/performance-metrics.schema.ts` — `PerformanceMetricsSchema` with all 8 required fields from OpenAPI: `total_return_pct`, `annualized_return_pct`, `max_drawdown_pct`, `sharpe_ratio`, `sortino_ratio`, `win_rate`, `profit_factor` (all `z.number()`), `total_trades` (`z.number().int()`); export `type PerformanceMetrics`
- [x] T011 [P] [US1] [ZOD] Create `src/lib/zodios/schemas/equity-curve.schema.ts` — `EquityCurveSchema` with four required `z.array(z.string()/z.number())` fields: `timestamps`, `equity_values`, `cash_balances`, `drawdowns`; export `type EquityCurve`

### Implementation — Strategy Config Schemas (ordered by dependency)

- [x] T012 [P] [US1] [ZOD] Create `src/lib/zodios/schemas/strategy-config.schema.ts` — define in order within one file: (1) `EntryConfigSchema` (6 fields: `order_type`, `execution_timing`, `commission_model`, `commission_rate`, `slippage_model` required; `slippage_value` optional), (2) `ExitConfigSchema` (8 fields: 4 required booleans/strings + 4 optional numbers), (3) `LiquidityFilterSchema` (4 optional fields), (4) `StrategyConfigSchema` composing all three; export all 4 types

### Implementation — Strategy Schemas (depends on T012)

- [x] T013 [US1] [ZOD] Create `src/lib/zodios/schemas/strategy.schema.ts` — (1) `StrategyResultSchema` (`id: z.string().uuid()`, `name`, `version`, `status: z.string()`, `config: StrategyConfigSchema` all required); (2) `PagedStrategyResultSchema` using `pagedSchema(StrategyResultSchema)`; export both schemas and types; depends on T012, T005

### Implementation — Backtest Run Schemas

- [x] T014 [P] [US1] [ZOD] Create `src/lib/zodios/schemas/backtest-run.schema.ts` — (1) `BacktestConfigSchema` (6 required fields + 3 optional slippage overrides per OpenAPI); (2) `BacktestRunResultSchema` (5 required fields + 2 optional datetime strings); (3) `PagedBacktestRunResultSchema` using `pagedSchema`; export all schemas and types; depends on T005

### Implementation — TradeRecord Schema (update existing)

- [x] T015 [US1] [ZOD] Create `src/lib/zodios/schemas/trade-record.schema.ts` — `TradeRecordSchema` with 10 required OpenAPI snake_case fields (`trade_id`, `symbol`, `side`, `entry_timestamp`, `exit_timestamp`, `entry_price`, `exit_price`, `quantity`, `pnl_absolute`, `pnl_pct`) and 1 optional field (`exit_reason`); export `type TradeRecord`
- [x] T016 [US1] Update `src/lib/schemas/trade-record.schema.ts` — replace existing camelCase schema body with: import and re-export `TradeRecordSchema` and `type TradeRecord` from `$lib/zodios/schemas/trade-record.schema`; preserve the `TradeRecordSchema` export name so existing imports are not broken

### Implementation — BacktestResult Schemas (depends on T009–T011, T015)

- [x] T017 [US1] [ZOD] Create `src/lib/zodios/schemas/backtest-result.schema.ts` — (1) `BacktestResultResourceSchema` (8 fields: `id`, `run_id`, `label`, `created_at` + `performance_metrics`, `equity_curve`, `execution_log`, `signal_history`); (2) `PagedBacktestResultResourceSchema` using `pagedSchema`; export all; depends on T009, T010, T011, T015, T005
- [x] T018 [US1] Update `src/lib/schemas/backtest-result.schema.ts` — import and re-export `BacktestResultResourceSchema` and `PagedBacktestResultResourceSchema` from `$lib/zodios/schemas/backtest-result.schema`; add a `BacktestResultSchema` alias for backward compatibility if existing tests reference that name

### Implementation — Request Body Schemas (depends on T012, T014)

- [x] T019 [P] [US1] [ZOD] Create `src/lib/zodios/schemas/request-bodies.schema.ts` — define all 4 request body schemas: `BacktestRunServiceCreateRequestBodySchema` (strategy_ids, strategy_versions, config required), `StrategyServiceUpsertRequestBodySchema` (name, config required), `StrategyServiceReplaceRequestBodySchema` (name, config required), `StrategyServicePatchRequestBodySchema` (name, config both optional); export all 4 schemas and types; depends on T012, T014

### Barrel File

- [x] T020 [US1] Fill `src/lib/zodios/index.ts` barrel — re-export all schemas and types from all 11 schema files under `src/lib/zodios/schemas/`; this replaces the stub from T006

### Schema Tests

- [x] T021 [P] [US1] Create `src/lib/zodios/__tests__/schemas.test.ts` — vitest tests that call `.parse()` on the OpenAPI example payloads for every schema: HealthResponse, ActionResponse, SignalRecord, PerformanceMetrics, EquityCurve, TradeRecord (snake_case), BacktestResultResource, StrategyResult, BacktestRunResult, and all 4 request body types; assert no ZodError thrown
- [x] T022 [P] [US1] Update `src/lib/schemas/__tests__/trade-record.schema.test.ts` — replace camelCase field fixtures (`tradeId`, `direction`, `entryDate`, etc.) with snake_case OpenAPI fields (`trade_id`, `side`, `entry_timestamp`, etc.); add `exit_reason`, `symbol`, `quantity` fields; remove `commission`, `slippage`, `holdingDays` assertions
- [x] T022b [P] [US1] Create `src/lib/schemas/__tests__/backtest-result.schema.test.ts` — this file does not currently exist; create it to test the re-export compatibility adapter in `src/lib/schemas/backtest-result.schema.ts`: verify `BacktestResultResourceSchema` (or its alias) successfully parses an OpenAPI BacktestResultResource example payload; verify the `PagedBacktestResultResourceSchema` re-export is accessible (SC-005)
- [x] T022c [US1] Confirm FR-008 audit of unchanged schemas — inspect `src/lib/schemas/strategy.schema.ts`, `src/lib/schemas/backtest-runs-card.schema.ts`, `src/lib/schemas/performance-metric-grid.schema.ts` and verify none contain OpenAPI-resource field shapes that conflict with the canonical schemas; document the confirmation in a PR comment; no code changes expected (these are UI abstractions per FR-014)

**Checkpoint**: All 21 schemas parse OpenAPI examples. Existing + updated unit tests pass. TypeScript infers types without `any`.

---

## Phase 4: User Story 2 — Typed Zodios API Client (Priority: P1)

**Goal**: Create a singleton Zodios client with all 15 API endpoints wired to their Zod response schemas.

**Independent Test**: Import `backtestApi` from `$lib/zodios/client`, call `backtestApi.listStrategies({})` — TypeScript infers return as `PagedStrategyResult` without explicit annotation; `tsc --noEmit` passes.

**⚠️ Depends on**: Phase 3 complete (T020 — barrel file filled).

- [x] T023 [US2] Create `src/lib/zodios/client.ts` — instantiate `new Zodios(import.meta.env.PUBLIC_BACKTEST_EAPI_URL, [...])` using all 15 endpoint definitions from `specs/021-zodios-api-client/contracts/endpoints.ts` as the implementation reference; import all schemas from `$lib/zodios/index`; export the instance as `backtestApi` (singleton); throw a clear error at construction time if the env var is missing
- [x] T024 [US2] TypeScript compile check — run `pnpm check` (svelte-kit sync + svelte-check); confirm zero type errors in `src/lib/zodios/`

**Checkpoint**: `backtestApi.listStrategies({})` return type inferred as `PagedStrategyResult`. `pnpm check` passes.

---

## Phase 5: User Stories 3 & 4 — Svelte 5 Rune State Modules (Priority: P2)

**Goal**: Create 3 new `.svelte.ts` state modules in `src/lib/state/` using `$state()` runes. Each holds: typed API payload (or null), loading boolean, optional ErrorResponse error. State is readable/writable without mounting UI.

**Independent Test**: Import `strategyListState` from `$lib/state/strategy-list.svelte`; write a mock `PagedStrategyResult` to `strategyListState.data`; read it back — no UI component mounted.

**⚠️ Depends on**: T020 (barrel file, for schema types).

- [x] T025 [P] [US3] [US4] Create `src/lib/state/strategy-list.svelte.ts` — export `strategyListState` as a `$state` object with shape `{ data: PagedStrategyResult | null, loading: boolean, error: ErrorResponse | null }` initialised to `{ data: null, loading: false, error: null }`; import types from `$lib/zodios`
- [x] T026 [P] [US3] [US4] Create `src/lib/state/backtest-run.svelte.ts` — export `backtestRunState` with shape `{ list: PagedBacktestRunResult | null, loading: boolean, error: ErrorResponse | null, results: PagedBacktestResultResource | null, resultsLoading: boolean, resultsError: ErrorResponse | null }` initialised with all nulls/false
- [x] T027 [P] [US3] [US4] Create `src/lib/state/backtest-result.svelte.ts` — export `backtestResultState` with shape `{ data: BacktestResultResource | null, loading: boolean, error: ErrorResponse | null }` initialised to all nulls/false
- [x] T027b [P] [US3] [US4] Create `src/lib/state/health.svelte.ts` — export `healthState` with shape `{ data: HealthResponse | null, loading: boolean, error: ErrorResponse | null }` initialised to all nulls/false (required by US3 AC-1: spec explicitly lists "and health" as a required state file)
- [x] T028 [US3] [US4] Create `src/lib/state/__tests__/state.test.ts` — vitest tests that: (a) import each state module and verify initial values are null/false without mounting any UI component, (b) write mock API payload to `strategyListState.data` and read it back, (c) write a mock `ErrorResponse` to `strategyListState.error` and verify all 5 RFC 7807 fields are present

**Checkpoint**: All 3 state modules importable. `state.test.ts` passes. No RxJS import in any file under `src/lib/state/`.

---

## Phase 6: Organism Updates (FR-012 & FR-013)

**Goal**: Update 4 existing organism components to use OpenAPI-aligned prop types. Organisms receive data only via `$props()`. No organism imports state modules directly.

**⚠️ Depends on**: T020 (barrel file for schema types).

### TradeLotTable (FR-012)

- [x] T029 [STORYBOOK] [US1] Update `src/lib/components/organisms/TradeLotTable.svelte` — change `$props()` type to accept `trades: TradeRecord[]` (imported from `$lib/zodios`); replace all template field references from camelCase to snake_case (`trade_id`, `side`, `entry_timestamp`, `exit_timestamp`, `entry_price`, `exit_price`, `pnl_absolute`, `pnl_pct`); remove `commission`, `slippage`, `holdingDays` columns from table; add `exit_reason` column; **remove any `$lib/shared-mockdata/*` import** — default prop value MUST be `[]`, not a mock sample
- [x] T030 [STORYBOOK] [US1] Update Storybook story for `TradeLotTable.svelte` — update fixture data to use snake_case TradeRecord fields; remove commission/slippage/holdingDays from mock data; add exit_reason to mock trade records

### Performance Organisms (FR-013)

- [x] T031 [STORYBOOK] [US1] Update `src/lib/components/organisms/PerformanceSummary.svelte` — change `$props()` to accept four separate props: `performanceMetrics: PerformanceMetrics`, `equityCurve: EquityCurve`, `executionLog: TradeRecord[]`, `signalHistory: SignalRecord[]`; update all template references to use the new decomposed prop fields (e.g., `performanceMetrics.total_return_pct` instead of monolithic `backtestResult.totalReturn`); **remove any `$lib/shared-mockdata/*` import** — props have no mock defaults
- [x] T032 [STORYBOOK] [US1] Update `src/lib/components/organisms/PerformanceMetricGrid.svelte` — change `$props()` to accept `performanceMetrics: PerformanceMetrics`; keep interactive UI state (`draggedIndex`, `editingTileId`, `editValue`, `modalOpen`) as local `$state()` inside the component — do NOT move to `src/lib/state/`; update template to use `performanceMetrics.*` fields; **remove any `$lib/shared-mockdata/*` import** — prop has no mock default
- [x] T033 [STORYBOOK] [US1] Update `src/lib/components/organisms/PerformancdeChartTabs.svelte` — change `$props()` to accept four separate props: `performanceMetrics: PerformanceMetrics`, `equityCurve: EquityCurve`, `executionLog: TradeRecord[]`, `signalHistory: SignalRecord[]`; update template accordingly (note: filename typo `PerformancdeChartTabs` is intentional — do not rename); **remove any `$lib/shared-mockdata/*` import** — props have no mock defaults
- [x] T034 [STORYBOOK] [US1] Update Storybook stories for PerformanceSummary, PerformanceMetricGrid, and PerformancdeChartTabs — split single `backtestResult` mock arg into four separate mock args matching the new decomposed prop types

**Checkpoint**: All 4 organism files updated. `pnpm storybook` builds without errors. No organism imports `strategyListState`, `backtestRunState`, or `backtestResultState`.

---

## Phase 6b: Remove shared-mockdata Imports from Remaining Organisms (FR-011)

**Purpose**: The 6 organisms below are not in the OpenAPI resource scope but still import `$lib/shared-mockdata/*` directly, violating FR-011. Each must be converted to receive its data via `$props()` with a sensible typed default (empty array or `undefined`). Storybook stories supply mock data; organisms do not.

**Note**: `StrategyOutputPanel.svelte` is excluded (FR-014 freeze — deferred to a follow-on feature).

- [ ] T041 [P] [FR-011] Update `src/lib/components/organisms/AIReviewPanel.svelte` — remove `sampleAIReview` import from `$lib/shared-mockdata/strategy`; add `review` prop typed to match the existing usage; default to `undefined`; update Storybook story to pass mock data via prop
- [ ] T042 [FR-011] [FR-016] Refactor `DashboardMetricGrid.svelte` and wire `market-metric` state — three steps:
  - **T042a** Create `src/lib/state/market-metric.svelte.ts` — class with `metrics = $state<MarketMetric[]>([])`, `loading = $state(false)`, `error = $state<string | null>(null)` (FR-007); state module imports nothing from shared-mockdata
  - **T042b** Update `src/lib/components/organisms/DashboardMetricGrid.svelte` — remove local `$state` declaration, remove `sampleMarketMetrics` import, remove `DashboardMetricGridSchema.parse({})` initialisation; accept `metrics: MarketMetric[]` via `$props()` (default `[]`); render from prop; update Storybook story to pass mock metrics via prop
  - **T042c** Update `src/routes/research-workbench/+page.svelte` — import `marketMetricState` from `$lib/state/market-metric.svelte`; import `sampleMarketMetrics` from `$lib/shared-mockdata/market`; assign `marketMetricState.metrics = sampleMarketMetrics` on mount; pass `metrics={marketMetricState.metrics}` to `<DashboardMetricGrid />`
- [ ] T043 [P] [FR-011] Update `src/lib/components/organisms/QuickActionsPanel.svelte` — remove `sampleTrades` and `tradesToCsv` imports from `$lib/shared-mockdata/trades`; add `trades` prop typed as `TradeRecord[]` (from `$lib/zodios`); default to `[]`; update Storybook story
- [ ] T044 [P] [FR-011] Update `src/lib/components/organisms/RegimeBreakdownTable.svelte` — remove `sampleRegimeBreakdown` import from `$lib/shared-mockdata/performance`; add `breakdown` prop typed to match existing usage; default to `[]`; update Storybook story
- [ ] T045 [P] [FR-011] Update `src/lib/components/organisms/ResourceCostPanel.svelte` — remove `sampleResourceUsage` import from `$lib/shared-mockdata/strategy`; add `resourceUsage` prop typed to match existing usage; default to `undefined`; update Storybook story
- [ ] T046 [P] [FR-011] Update `src/lib/components/organisms/ScreenerResultTable.svelte` — remove `sampleScreenerResults` import from `$lib/shared-mockdata/market`; add `results` prop typed to match existing usage; default to `[]`; update Storybook story

**Checkpoint**: `grep -r 'shared-mockdata' src/lib/components/organisms/` returns zero hits (excluding `StrategyOutputPanel.svelte`). `pnpm storybook` builds without errors.

---

## Phase 6c: Remove Direct State Imports from Form Config Organisms (FR-011)

**Purpose**: `UniverseCapitalConfig.svelte` and `ScheduleExecutionConfig.svelte` import state modules directly, violating FR-011. FR-011 applies to all `$lib/state/*` imports in organisms — including form/config state, not just API response state. The page owns the state; organisms receive values via `$props()` using `bind:` for two-way form bindings.

- [ ] T047 [FR-011] Update `src/lib/components/organisms/UniverseCapitalConfig.svelte` — remove direct import of `universeCapitalConfigState`; define `$props()` to accept `mode: string`, `universe: string`, `initialCapital: string/number` with `bind:`-compatible prop pattern; update template `bind:value` to use props; update `src/routes/backtest-engine/+page.svelte` to pass all three props from `universeCapitalConfigState` using `bind:` syntax so the prefill `$effect` continues to work
- [ ] T048 [FR-011] Update `src/lib/components/organisms/ScheduleExecutionConfig.svelte` — remove direct import of `scheduleExecutionConfigState`; define `$props()` to accept `startDate`, `endDate`, `timeframe`, `direction` with `bind:`-compatible prop pattern; update `src/routes/backtest-engine/+page.svelte` to pass all four props from `scheduleExecutionConfigState`

**Checkpoint**: `grep -r 'universeCapitalConfigState\|scheduleExecutionConfigState' src/lib/components/organisms/` returns zero hits. `pnpm check` passes. `pnpm dev` renders `/backtest-engine` without errors.

---

## Phase 6d: Add market-regime State Module and Wire Page (FR-016)

**Purpose**: `src/routes/market-regime/+page.svelte` sources `sampleMarketRegimes` directly from `$lib/shared-mockdata/market` and passes it to `<RegimeCardsGrid>`. Introduce a `marketRegimeState` module so the data path is `state → page → organism`. When ReactiveX/OpenAPI is implemented for market regimes, only `market-regime.svelte.ts` needs to change — the page-to-organism contract is already correct.

- [ ] T049 [FR-016] Create `src/lib/state/market-regime.svelte.ts` — declare `marketRegimeState` using a class with `regimes = $state<MarketRegime[]>([])`, `loading = $state(false)`, and `error = $state<string | null>(null)` (FR-007 pattern); the state module holds ONLY the rune declarations with empty/null initial values — it does NOT import or seed from `sampleMarketRegimes`. Update `src/routes/market-regime/+page.svelte` to: (1) import `marketRegimeState` from `$lib/state/market-regime.svelte`; (2) import `sampleMarketRegimes` from `$lib/shared-mockdata/market`; (3) load mock data into state on mount — `marketRegimeState.regimes = sampleMarketRegimes` (this assignment is what a real API call will replace in a future feature); (4) pass `marketRegimeState.regimes` to `<RegimeCardsGrid regimes={marketRegimeState.regimes} />`. The page remains the sole data-loading site.

**Checkpoint**: `grep 'sampleMarketRegimes' src/routes/market-regime/+page.svelte` returns zero hits. `pnpm dev` renders `/market-regime` with regime cards visible.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Full compilation check, lint, and test suite validation across all changed files.

- [x] T035 Run `pnpm check` (svelte-kit sync + svelte-check) — assert zero TypeScript errors across `src/lib/zodios/`, `src/lib/state/`, `TradeLotTable.svelte`, `PerformanceSummary.svelte`, `PerformanceMetricGrid.svelte`, `PerformancdeChartTabs.svelte` (SC-001)
- [x] T036 [P] Run `pnpm lint` — assert zero ESLint errors and Prettier format violations across all changed files
- [x] T037 [P] Run `pnpm test:unit` — assert all vitest tests pass, including updated `trade-record.schema.test.ts`, new `schemas.test.ts`, and new `state.test.ts` (SC-002, SC-005)
- [x] T038 Verify SC-003 (15 endpoints): audit `src/lib/zodios/client.ts` to confirm all 15 endpoint aliases are present (healthz, listStrategies, upsertStrategy, getStrategy, replaceStrategy, deleteStrategy, patchStrategy, listBacktestRuns, createBacktestRun, getBacktestRun, deleteBacktestRun, triggerBacktestRun, cancelBacktestRun, listBacktestResults, getBacktestResult)
- [x] T039 Verify SC-004 and FR-011: (a) grep `src/lib/components/organisms/` for direct imports of `strategyListState`, `backtestRunState`, `backtestResultState` — assert zero hits; (b) grep `src/lib/components/organisms/` for `shared-mockdata` imports across the 4 organisms updated in this feature (`TradeLotTable`, `PerformanceSummary`, `PerformanceMetricGrid`, `PerformancdeChartTabs`) — assert zero hits; (c) grep `src/lib/components/organisms/` for `universeCapitalConfigState` and `scheduleExecutionConfigState` imports — assert zero hits (covered by T047/T048)
- [x] T040 Verify SC-006: run the state test added in T028 without a browser/JSDOM — assert it passes in a pure Node environment using `pnpm test:unit`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 Schemas)**: Depends on Phase 2 (T004, T005, T006)
- **Phase 4 (US2 Client)**: Depends on T020 (barrel complete)
- **Phase 5 (US3+US4 State)**: Depends on T020 (barrel complete) — can run in parallel with Phase 4
- **Phase 6 (Organisms)**: Depends on T020 (barrel complete) — can run after Phase 3
- **Phase 7 (Polish)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2. Core schema work.
- **US2 (P1)**: Depends on US1 barrel (T020). Can start immediately after T020.
- **US3+US4 (P2)**: Depends on US1 barrel (T020). Can run in parallel with US2.
- **Organism updates (FR-012/FR-013)**: Depends on US1 barrel (T020).

### Within Each Phase

- Schemas marked `[P]` in Phase 3 can run in parallel (different files, no shared deps beyond T005)
- T013 (StrategyResult) depends on T012 (StrategyConfig)
- T017 (BacktestResultResource) depends on T009–T011, T015
- T019 (request bodies) depends on T012, T014
- T020 (barrel) depends on all schema tasks completing

---

## Parallel Execution Examples

### Phase 3 — US1 Schema Tasks (in parallel after T004, T005, T006)

```
T007 health.schema.ts          ─┐
T008 action-response.schema.ts  ├─ All parallelizable (different files)
T009 signal-record.schema.ts    ├─
T010 performance-metrics.schema.ts ├─
T011 equity-curve.schema.ts     ─┘

T012 strategy-config.schema.ts ─── (standalone)
T014 backtest-run.schema.ts    ─── (standalone, uses pagedSchema)
T015 trade-record.schema.ts    ─── (standalone)

T013 strategy.schema.ts        ──── waits for T012
T017 backtest-result.schema.ts ──── waits for T009–T011, T015
T019 request-bodies.schema.ts  ──── waits for T012, T014

T021 schemas.test.ts           ─┐  (after all schemas)
T022 trade-record.test.ts      ─┘
T020 index.ts barrel           ──── (after all schemas)
```

### Phase 5 — State Modules (in parallel after T020)

```
T025 strategy-list.svelte.ts   ─┐
T026 backtest-run.svelte.ts     ├─ All parallelizable
T027 backtest-result.svelte.ts  ─┘
T028 state.test.ts             ──── waits for T025–T027
```

### Phase 6 — Organism Updates (in parallel after T020)

```
T029 TradeLotTable.svelte      ─┐
T031 PerformanceSummary.svelte  ├─ Different files — parallelizable
T032 PerformanceMetricGrid.svelte ├─
T033 PerformancdeChartTabs.svelte ─┘
T030, T034 Storybook stories   ──── parallelizable, after their organism task
```

---

## Implementation Strategy

### MVP (US1 + US2 — Schemas + Client)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (ErrorResponse, paged factory, barrel stub)
3. Complete Phase 3: All 21 schemas + barrel (T007–T022)
4. Complete Phase 4: Zodios client (T023–T024)
5. **STOP and VALIDATE**: `pnpm check` + `pnpm test:unit` pass; `backtestApi` exposes 15 typed endpoints
6. Demo/review before proceeding to state and organism work

### Full Delivery

1. MVP first (as above)
2. Phase 5: Add state modules (US3+US4)
3. Phase 6: Update organisms (FR-012, FR-013)
4. Phase 7: Full CI gate validation

---

## Task Count Summary

| Phase | Tasks | Parallelizable |
|-------|-------|----------------|
| Phase 1: Setup | 4 (T001, T001b, T002, T003) | 0 |
| Phase 2: Foundational | 3 | 0 |
| Phase 3: US1 Schemas | 19 (T007–T022c) | 11 |
| Phase 4: US2 Client | 2 | 0 |
| Phase 5: US3+US4 State | 5 (T025–T028, T027b) | 4 |
| Phase 6: Organisms | 6 | 4 |
| Phase 7: Polish | 6 | 2 |
| **Total** | **45** | **21** |

---

## Notes

- `[P]` tasks operate on different files with no shared incomplete dependencies — safe to run concurrently
- `[BDD]` task (T001) **must** precede all implementation — Constitution Rule 6
- `[STORYBOOK]` tasks in Phase 6 must complete before marking organism tasks done — Constitution Rule 12
- `[ZOD]` tasks indicate new canonical schema files in `src/lib/zodios/schemas/`
- The filename typo `PerformancdeChartTabs.svelte` is intentional — do NOT rename the file in this feature
- SC-003 corrected to 15 endpoints (spec.md said 13; OpenAPI has 15)
- StrategyInputPanel, StrategyOutputPanel, BacktestRunsCard are **NOT** touched in this feature (FR-014)
