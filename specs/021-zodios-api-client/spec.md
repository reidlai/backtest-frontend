# Feature Specification: Zodios API Client with OpenAPI-Derived Zod Schemas

**Feature Branch**: `021-zodios-api-client`

**Created**: 2026-06-06

**Status**: Draft

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Validate API Responses with Zod Schemas (Priority: P1)

When data arrives from the backtest-eapi backend, the frontend validates it against Zod schemas derived directly from the OpenAPI spec. If the backend sends unexpected shapes (extra fields, wrong types, missing required fields), the schemas catch the mismatch at the boundary rather than silently propagating bad data into the UI.

**Why this priority**: Data integrity at the API boundary prevents hard-to-debug UI failures. All downstream state and rendering depends on trustworthy typed data.

**Independent Test**: Given a running frontend, intercept the response from `GET /v1/strategies` and replace a required field with a wrong type. Confirm the application surfaces a validation error rather than rendering corrupt data.

**Acceptance Scenarios**:

1. **Given** a valid API response from `GET /health`, **When** the client receives it, **Then** a `HealthResponse`-shaped object is returned with `status` and `version` fields typed as strings.
2. **Given** the API returns a `StrategyResult` with a missing required field, **When** the Zod schema parses it, **Then** a parse error is thrown before the result reaches state.
3. **Given** a valid `BacktestRunResult` response, **When** it is parsed, **Then** all required fields (`id`, `strategy_ids`, `strategy_versions`, `status`, `config`) are present and correctly typed.

---

### User Story 2 - Typed Zodios API Client for All Endpoints (Priority: P1)

Frontend code calls the backtest-eapi via a single Zodios client instance. All endpoints are described with their request parameters, request bodies, and response Zod schemas. This gives TypeScript end-to-end type safety from call site to rendered value with no manual type casting.

**Why this priority**: A typed client is the prerequisite for all features that read or mutate backend resources. Without it, every feature must manage its own fetch logic and types.

**Independent Test**: Import the Zodios client and call `listStrategies()`. TypeScript must infer the return type as `PagedStrategyResult` without explicit annotation. Compile succeeds; no `any` types introduced.

**Acceptance Scenarios**:

1. **Given** the Zodios client is initialised, **When** `GET /v1/strategies` is called, **Then** the return type is inferred as `PagedStrategyResult` with `total: number` and `items: StrategyResult[]`.
2. **Given** `POST /v1/backtest-runs` is called with a valid body, **When** the server responds 201, **Then** the return is typed as `BacktestRunResult`.
3. **Given** `POST /v1/backtest-runs/{run_id}/run` is called, **When** the server responds 202, **Then** the return is typed as `ActionResponse` with `run_id` and `status`.
4. **Given** `GET /v1/backtest-runs/{run_id}/results/{result_id}` is called, **When** the server responds 200, **Then** the return includes fully-typed `performance_metrics`, `equity_curve`, `execution_log`, and `signal_history`.

---

### User Story 3 - Centralised State Structures for API Resources (Priority: P2)

All application state that mirrors or wraps an API resource lives in `src/lib/state/`, not inside individual organism components. Each state module holds only API response data: the last-fetched payload, pagination metadata, loading status, and error information for one API resource domain. Pages and layouts read from state and pass data down to organisms via Svelte 5 `$props()` — organisms never import state directly and hold no API-response-shaped local state.

**Why this priority**: Decoupling state from UI components enables cross-component sharing and testability without mounting any UI. Passing data via props keeps organisms pure and reusable.

**Independent Test**: Import a state module from `src/lib/state/`. Write a mock `PagedStrategyResult` to it. Confirm a page component that reads from state passes the data to a child organism via props, and the organism renders it correctly.

**Acceptance Scenarios**:

1. **Given** the state modules are imported, **When** inspected, **Then** `src/lib/state/` contains dedicated state files for strategies (`strategy-list.svelte.ts`), backtest runs (`backtest-run.svelte.ts`), backtest results (`backtest-result.svelte.ts`), and health (`health.svelte.ts`) — each holding only API response data.
2. **Given** a strategy list is fetched and written to state, **When** a page reads from state, **Then** it passes the list to child organisms via `$props()` — no organism imports the state module directly.
3. **Given** an API call fails, **When** the error is written to state, **Then** the state's error field is typed as `ErrorResponse` matching the RFC 7807 schema.

---

### User Story 4 - Svelte 5 Rune-Based State for API Resources (Priority: P2)

All state modules in `src/lib/state/` use Svelte 5 runes (`$state()`) in `.svelte.ts` files, consistent with the existing state files (`strategy.svelte.ts`, `app.svelte.ts`, etc.). Pages and layouts read from these reactive state objects and pass data to organisms via `$props()` — organisms never import state directly.

**Why this priority**: Consistency with the existing codebase pattern ensures organisms can subscribe reactively without additional wiring. ReactiveX integration is a separate, future feature.

**Independent Test**: Import a state module (e.g., `strategyListState`). Write a mock `PagedStrategyResult` to it. Confirm a Svelte component that reads from it re-renders with the new value. No RxJS dependency required.

**Acceptance Scenarios**:

1. **Given** a `.svelte.ts` state file is imported, **When** its `$state()` value is updated, **Then** any Svelte component reading from it reactively reflects the new value.
2. **Given** the state modules are compiled, **Then** they compile without any RxJS dependency present.

---

### Edge Cases

- What happens when the API returns a 4xx or 5xx response (including 401, 404, 409, 410, 422)? The error is caught, parsed into a typed `ErrorResponse` (RFC 7807 Problem Details: `type`, `title`, `status`, `detail`, `instance`), written to the corresponding state `error` field, and the exception is swallowed — callers never need `try/catch`; organisms react to the `error` field in state.
- What happens when `strategy_ids` and `strategy_versions` arrays have different lengths in a `BacktestRunResult`? The Zod schema treats them as independent arrays (equal-length is a server-enforced invariant not validated client-side).
- What happens when optional fields (`start_time`, `end_time`) are absent from a `BacktestRunResult`? The schema marks them optional so parse does not fail.
- What happens when `symbols` is an empty array in `BacktestConfig`? The schema accepts it (non-empty enforcement is a server concern).
- What happens when the base URL is not configured? The Zodios client fails at construction time with a clear error, not silently at call time.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST define a Zod schema for every named OpenAPI response type: `HealthResponse`, `StrategyResult`, `PagedStrategyResult`, `BacktestRunResult`, `PagedBacktestRunResult`, `BacktestConfig`, `ActionResponse`, `BacktestResultResource`, `PagedBacktestResultResource`, `PerformanceMetrics`, `EquityCurve`, `TradeRecord`, `SignalRecord`, `ErrorResponse`, `EntryConfig`, `ExitConfig`, `LiquidityFilter`. The system MUST also define Zod schemas for all OpenAPI request body types: `BacktestRunServiceCreateRequestBody`, `StrategyServiceUpsertRequestBody`, `StrategyServiceReplaceRequestBody`, `StrategyServicePatchRequestBody`. All schemas (request and response) live in `src/lib/zodios/schemas/`.
- **FR-002**: The system MUST define a Zodios API client covering all OpenAPI paths: `GET /health`, `GET/POST /v1/strategies`, `GET/PUT/DELETE/PATCH /v1/strategies/{id}`, `GET/POST /v1/backtest-runs`, `GET/DELETE /v1/backtest-runs/{run_id}`, `POST /v1/backtest-runs/{run_id}/run`, `POST /v1/backtest-runs/{run_id}/cancel`, `GET /v1/backtest-runs/{run_id}/results`, `GET /v1/backtest-runs/{run_id}/results/{result_id}`.
- **FR-003**: The Zodios client MUST associate the correct Zod response schema with each endpoint so that call results are automatically parsed and typed.
- **FR-004**: Zod schemas MUST be placed under `src/lib/zodios/schemas/` and re-exported from a `src/lib/zodios/index.ts` barrel file.
- **FR-005**: The Zodios client instance MUST be built using `@zodios/core` v11 (native fetch adapter, no Axios dependency), placed under `src/lib/zodios/`, and exported as a singleton.
- **FR-006**: State structures for API resources MUST be created as Svelte 5 rune files (`*.svelte.ts`) in `src/lib/state/` — not in any organism component. State modules hold ONLY API response data; UI selection state is not stored here.
- **FR-007**: Each state module MUST use `$state()` and hold at minimum: the last-fetched payload typed by its Zod-inferred type, a loading boolean, and an optional `ErrorResponse`-typed error field.
- **FR-016**: Routes that currently source display data from `$lib/shared-mockdata/*` and pass it to organisms via `$props()` SHOULD be refactored to route data through a `$lib/state/*.svelte.ts` module. The correct pattern is: (1) the state module declares the `$state()` rune with an empty/null initial value — it does NOT import or embed mock data; (2) the page imports the state module AND the mock data separately; (3) the page assigns mock data into state on mount (`state.field = mockData`) — this assignment is the exact line a real API call will replace in a future feature; (4) the page passes state fields to organisms via `$props()`. This creates a stable API seam where only the page's data-loading site changes, not the state module or organism. New state modules MUST follow FR-006 and FR-007. This pattern applies to every schema in `src/lib/schemas/` that backs an organism's primary display data — not only API-resource schemas. Concrete examples in this feature: (1) `src/lib/state/market-regime.svelte.ts` backing `RegimeCardsGrid` via `src/routes/market-regime/+page.svelte`; (2) `src/lib/state/market-metric.svelte.ts` backing `DashboardMetricGrid` via `src/routes/research-workbench/+page.svelte`.
- **FR-011**: Organism components MUST receive all data exclusively via Svelte 5 `$props()` from their parent page or layout. Organisms MUST NOT import any `$lib/state/*` module directly — this applies to all state regardless of whether it holds API response data or form/configuration values (e.g. `universeCapitalConfigState`, `scheduleExecutionConfigState`). Organisms MUST NOT import `$lib/shared-mockdata/*` directly. The page or layout is the sole owner of state; it passes values down to organisms as props (using `bind:propName` for two-way form bindings where needed).
- **FR-008**: Existing Zod schemas in `src/lib/schemas/` MUST be audited against the OpenAPI spec. Schemas that overlap MUST be updated in-place to match the canonical OpenAPI shape and re-export from the new `src/lib/zodios/schemas/` source — preserving all existing import paths. New schemas with no existing counterpart are added only in `src/lib/zodios/schemas/`. Any field-level conflict between an existing schema and the OpenAPI spec MUST be flagged for explicit human decision before the schema is changed.
- **FR-009**: State modules for strategies and backtest runs MUST support pagination metadata (`total`, current offset, current limit).
- **FR-010**: The backtest run state MUST include a sub-state for the currently loaded run's `BacktestResultResource` list (the paged results for a given `run_id`). Selection of which run is active is the page's concern, not the state module's.
- **FR-012**: `TradeLotTable.svelte` MUST be updated in this feature to use the new OpenAPI-aligned `TradeRecord` field names (snake_case: `trade_id`, `side`, `entry_timestamp`, `exit_timestamp`, `entry_price`, `exit_price`, `pnl_absolute`, `pnl_pct`, `exit_reason`). Columns for `commission`, `slippage`, and `holdingDays` (absent from the OpenAPI spec) MUST be removed. An `exit_reason` column MUST be added.
- **FR-013**: `PerformanceSummary.svelte`, `PerformanceMetricGrid.svelte`, and `PerformancdeChartTabs.svelte` MUST be updated in this feature to replace the single monolithic `BacktestResultSchema` prop with four separate OpenAPI-aligned props: `performanceMetrics: PerformanceMetrics`, `equityCurve: EquityCurve`, `executionLog: TradeRecord[]`, and `signalHistory: SignalRecord[]`. Interactive UI state in `PerformanceMetricGrid.svelte` (`draggedIndex`, `editingTileId`, `editValue`, `modalOpen`) MUST remain as local `$state()` inside the organism — it is interaction state, not API data, and is not passed via props or stored in `src/lib/state/`.
- **FR-014**: `StrategyInputPanel.svelte`, `StrategyOutputPanel.svelte`, and `BacktestRunsCard.svelte` are intentional UI abstractions unrelated to the OpenAPI resource types and MUST NOT be changed in this feature. Their existing schemas are retained as-is. Note: `StrategyOutputPanel.svelte` currently imports `sampleTrades` from `$lib/shared-mockdata/trades`; removing this import is deferred to a follow-on feature as it requires its own prop-contract redesign outside this feature's scope.

### Key Entities

- **StrategyResult**: A strategy record returned by the API. Fields: `id` (UUID), `name`, `version`, `status`, `config` (structured object containing `entry_config: EntryConfig`, `exit_config: ExitConfig`, and optional `liquidity_filter: LiquidityFilter`). Paged variant: `PagedStrategyResult`.
- **BacktestRunResult**: A backtest run record. Fields: `id`, `strategy_ids`, `strategy_versions`, `status`, `config` (BacktestConfig), optional `start_time`/`end_time`.
- **BacktestConfig**: Run configuration. Required: `start_date`, `end_date`, `initial_capital`, `symbols`, `commission_rate`, `slippage_model`. Optional slippage sub-fields.
- **BacktestResultResource**: Per-symbol/per-period result. Fields: `id`, `run_id`, `label`, `created_at`, `performance_metrics`, `equity_curve`, `execution_log`, `signal_history`.
- **PerformanceMetrics**: Eight numeric fields summarising backtest performance.
- **EquityCurve**: Four parallel arrays (`timestamps`, `equity_values`, `cash_balances`, `drawdowns`) of equal length.
- **TradeRecord**: A single completed round-trip trade with entry/exit details and P&L.
- **SignalRecord**: A single algorithm signal with `timestamp`, `symbol`, `action`, and `conviction_score`.
- **ErrorResponse**: RFC 7807 Problem Details shape returned for all error responses (400, 401, 404, 409, 410, 422, 5xx). Fields: `type` (URI identifying the problem type), `title` (human-readable summary), `status` (HTTP status code as integer), `detail` (human-readable explanation of this specific occurrence), `instance` (URI of the specific occurrence, format `urn:request:{X-Request-ID}`). All five fields are required.
- **ActionResponse**: Lightweight confirmation for run/cancel actions — `run_id` and `status`.
- **EntryConfig**: Entry execution configuration nested inside `StrategyResult.config`. Required fields: `order_type`, `execution_timing`, `commission_model`, `commission_rate`, `slippage_model`. Optional: `slippage_value`.
- **ExitConfig**: Exit execution rules nested inside `StrategyResult.config`. Required fields: `stop_loss_type`, `take_profit_type`, `trailing_stop_enabled`, `time_based_exit_enabled`. Optional: `stop_loss_value`, `take_profit_value`, `trailing_stop_pct`, `max_holding_days`.
- **LiquidityFilter**: Optional pre-screen filter nested inside `StrategyResult.config`. Optional fields: `min_avg_volume_20d`, `min_market_cap`, `min_price`, `active_listing_only`. Entire sub-object is optional on `StrategyResult.config`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: TypeScript compilation completes with zero type errors across all files in `src/lib/zodios/`, `src/lib/state/`, and all organism files updated in this feature (`TradeLotTable.svelte`, `PerformanceSummary.svelte`, `PerformanceMetricGrid.svelte`, `PerformancdeChartTabs.svelte`).
- **SC-002**: Every OpenAPI-defined response type AND every request body type has a corresponding Zod schema that successfully parses the example payloads from the spec.
- **SC-003**: All 15 API endpoints are represented in the Zodios client definition; no endpoint requires a raw fetch call to access. (Note: FR-002 lists 15 endpoints; the original draft said 13, which was an arithmetic error — corrected in plan research.md.)
- **SC-004**: All API-response-shaped state previously stored in organism local state is migrated to `src/lib/state/`; no organism component owns such state after this feature.
- **SC-005**: Unit tests for schemas that are **not** changed in this feature continue to pass without modification. Unit tests for schemas that **are** changed MUST be updated or created to validate the new OpenAPI-aligned field shapes and pass after the migration: (a) `src/lib/schemas/__tests__/trade-record.schema.test.ts` — update existing test to snake_case fields; (b) `src/lib/schemas/__tests__/backtest-result.schema.test.ts` — create this file (it does not currently exist) to test the re-export compatibility adapter in `src/lib/schemas/backtest-result.schema.ts`. Note: `BacktestResultSchema` in `src/lib/schemas/` is the legacy re-export adapter; the canonical new schema is `BacktestResultResourceSchema` in `src/lib/zodios/schemas/backtest-result.schema.ts`.
- **SC-006**: A developer can import any state module and read or write its current value without mounting a UI component.

## Assumptions

- The backtest-eapi base URL is provided via an existing environment variable (e.g., `PUBLIC_BACKTEST_EAPI_URL`); environment variable setup is out of scope.
- JWT token injection into the `Authorization` header is deferred to a subsequent feature; this feature defines the client structure only.
- Canonical OpenAPI-derived schemas live in `src/lib/zodios/schemas/`. Existing files in `src/lib/schemas/` are updated to re-export from the canonical source, preserving import paths for backward compatibility. Field-level conflicts between existing schemas and the OpenAPI spec are flagged and resolved before implementation proceeds.
- `StrategyResult.config` is a structured object typed as `{ entry_config: EntryConfig, exit_config: ExitConfig, liquidity_filter?: LiquidityFilter }` — not opaque. All three sub-schemas are created in `src/lib/zodios/schemas/`.
- A generic paginated wrapper type may be shared across `PagedStrategyResult`, `PagedBacktestRunResult`, and `PagedBacktestResultResource`.
- ReactiveX (RxJS) integration is fully out of scope for this feature and will be addressed in a dedicated future feature. State modules use Svelte 5 runes only and introduce no RxJS dependency.

## Clarifications

### Session 2026-06-06

- Q: What reactive primitive should state modules in `src/lib/state/` use? → A: Svelte 5 runes (`$state()` in `.svelte.ts` files). ReactiveX integration is deferred to a separate feature; this feature focuses on Zodios client, Zod schemas, and Svelte rune-based state only.
- Q: Which package should the Zodios API client use? → A: `@zodios/core` — the official Zodios npm package with typed endpoint definitions and automatic Zod response parsing.
- Q: What is the error handling contract when an API call fails? → A: Catch the error, parse it as RFC 7807 `ErrorResponse` (fields: `type`, `title`, `status`, `detail`, `instance` — all required), write to state `error` field, and swallow the exception. Organisms react to state; no `try/catch` needed at call sites. Applies to all error status codes (401, 404, 409, 410, 422, 5xx).
- Q: How should existing schemas in `src/lib/schemas/` be migrated? → A: Update existing schemas in-place to match the OpenAPI spec and re-export from `src/lib/zodios/schemas/` as the canonical source — preserving all existing import paths. New schemas go in `src/lib/zodios/schemas/` only. Any field-level conflict between an existing schema and the OpenAPI spec must be flagged for human decision before changing.
- Q: Should UI selection state (e.g., selectedRunId) live in `src/lib/state/` alongside API data? → A: No. State modules hold only API response data. Organisms receive all data via Svelte 5 `$props()` from parent pages/layouts. No organism imports state directly; no selection state lives in `src/lib/state/`.
- Q: Which version and HTTP adapter should `@zodios/core` use? → A: `@zodios/core` v11 with the native fetch adapter — latest version, no Axios dependency introduced.
- Q: Should Zod schemas be created for request bodies (POST/PUT/PATCH) as well as response types? → A: Yes. Zod schemas are created for all OpenAPI request body types (`BacktestRunServiceCreateRequestBody`, `StrategyServiceUpsertRequestBody`, `StrategyServiceReplaceRequestBody`, `StrategyServicePatchRequestBody`) alongside all response schemas in `src/lib/zodios/schemas/`.
- Q: Should `EntryConfig`, `ExitConfig`, `LiquidityFilter` be used to fully type `StrategyResult.config`, or remain as standalone schemas without being applied? → A: Use them to fully type `StrategyResult.config` as `{ entry_config: EntryConfig, exit_config: ExitConfig, liquidity_filter?: LiquidityFilter }`. All three schemas are created and applied; `config` is no longer opaque.
- Q: When `TradeRecordSchema` is updated to match the OpenAPI spec, should `TradeLotTable.svelte` also be updated in this feature? → A: Yes. Update `TradeLotTable.svelte` in this feature to use snake_case field names, remove `commission`/`slippage`/`holdingDays` columns, and add an `exit_reason` column.
- Q: When `BacktestResultSchema` is decomposed into four separate OpenAPI types, should `PerformanceSummary.svelte`, `PerformanceMetricGrid.svelte`, and `PerformancdeChartTabs.svelte` also be updated in this feature? → A: Yes. Update all three organisms to accept four separate props (`performanceMetrics`, `equityCurve`, `executionLog`, `signalHistory`) matching the OpenAPI-aligned types.
- Q: Should `StrategyInputPanel.svelte` and `StrategyOutputPanel.svelte` be updated to use `StrategyResult` from the API? → A: No. Both are intentional UI abstractions; their schemas are unrelated to the `StrategyResult` API resource and remain unchanged in this feature.
- Q: Should `BacktestRunsCard.svelte` be updated to derive run counts from API state? → A: No. It is a billing UI card wired to a different data source (`backtestsUsed`, `backtestsTotal`, `planName`); out of scope for this feature.
- Q: Should SC-005 (existing unit tests pass unmodified) be revised given that `TradeRecordSchema` and `BacktestResultSchema` are being significantly changed? → A: Yes. SC-005 is revised: tests for unchanged schemas continue to pass without modification; tests for changed schemas (`TradeRecordSchema`, `BacktestResultSchema`) must be updated to validate the new OpenAPI-aligned field shapes.
- Q: What happens to `PerformanceMetricGrid.svelte`'s interactive UI state fields (`draggedIndex`, `editingTileId`, `editValue`, `modalOpen`) when the organism is updated to accept `performanceMetrics` as a prop? → A: They remain as local `$state()` inside the organism — interaction state is not moved to `src/lib/state/` and is not passed via props.
