# Feature Specification: RxJS State Management

**Feature Branch**: `022-rxjs-state-management`

**Created**: 2026-06-07

**Status**: Draft

**Input**: User description: "read new /v1/market-metric endpoint from attached updated OpenAPI spec and create new state, implement ReactiveX (RxJS) Behaviour Subject and related scripts at src/lib/rxjs/ and use RxJS to call zodios api client and read response payload to update state by subscribing behaviour subject for market metric, strategy and backtest runs resource"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Market Metrics Live Data Feed (Priority: P1)

A developer wants the market metrics panel (SP500, NDX100, HSI, VIX, US10Y) to be populated with live data from the backend API. When the application loads, a RxJS BehaviorSubject automatically fetches all five canonical market indicators via the Zodios client and pushes the result into a reactive state. Components subscribed to the subject always display the latest snapshot.

**Why this priority**: Market metrics are the primary top-bar data surface visible to users on page load. Without this data the UI shows empty or stale mock values.

**Independent Test**: Open the app — the market metrics top-bar shows five populated tiles (symbol, value, change, change_pct) fetched from the real API.

**Acceptance Scenarios**:

1. **Given** the app initialises, **When** the market-metrics BehaviorSubject is subscribed, **Then** the Zodios client calls `GET /v1/market-metrics` and pushes the `MarketMetricCollectionResult` payload into application state.
2. **Given** the API returns a 401 or network error, **When** the subscription emits an error, **Then** state reflects an error condition and the component renders a fallback/empty state without crashing.
3. **Given** a successful response, **When** the `stale` flag on any item is `true`, **Then** the state retains the stale indicator so the UI can surface a warning.

---

### User Story 2 - Strategy List Reactive State (Priority: P2)

A developer wants the strategy list to be driven by a RxJS BehaviorSubject so that any future component can subscribe to the latest strategy collection without triggering extra API calls.

**Why this priority**: Strategies are the core domain object; reactive state avoids prop-drilling and redundant fetches across sibling components.

**Independent Test**: Navigate to the strategies page — the list populates from a single BehaviorSubject-backed fetch, and re-subscribing from a second component yields the same cached value without a second network request.

**Acceptance Scenarios**:

1. **Given** the strategy-list BehaviorSubject emits, **When** `GET /v1/strategies` succeeds, **Then** `PagedStrategyResult` is pushed into state and all subscribers receive the update.
2. **Given** a subscriber joins after the first fetch, **When** the BehaviorSubject already holds a value, **Then** the subscriber immediately receives the last emitted value (BehaviorSubject replay semantics).

---

### User Story 3 - Backtest Runs Reactive State (Priority: P3)

A developer wants the backtest runs list to follow the same RxJS pattern so that run status changes (e.g., pending → running → completed) can be streamed reactively.

**Why this priority**: Backtest runs have lifecycle transitions; a reactive pattern enables future polling or WebSocket push without component rewrites.

**Independent Test**: Trigger a backtest run creation — the backtest-runs BehaviorSubject emits the updated list and the UI reflects the new run without a full page refresh.

**Acceptance Scenarios**:

1. **Given** the backtest-runs BehaviorSubject initialises, **When** `GET /v1/backtest-runs` succeeds, **Then** `PagedBacktestRunResult` is pushed into state.
2. **Given** a run is created, **When** `createBacktestRun` completes, **Then** the BehaviorSubject re-fetches and emits the updated list.

---

### Edge Cases

- What happens when the JWT token is absent or expired? API calls must propagate a 401 error through the BehaviorSubject error channel so UI can redirect to login.
- How does the system handle concurrent subscriptions to the same BehaviorSubject? The subject must be a singleton per resource so state is shared, not duplicated.
- What happens if `GET /v1/market-metrics` returns fewer than five items? State stores whatever the API returns; components must handle a partial collection gracefully.
- How does the system handle rapid successive refresh triggers? Subsequent calls should cancel the in-flight request (switchMap semantics) to avoid stale response ordering.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST add a Zodios API client endpoint for `GET /v1/market-metrics` (collection, alias `listMarketMetrics`) and `GET /v1/market-metrics/{symbol}` (model, alias `getMarketMetric`). The RxJS stream layer wraps the collection endpoint only (`listMarketMetrics`); `getMarketMetric` is registered in the Zodios client for future use but has no dedicated stream or Svelte state in this feature.
- **FR-002**: System MUST define a Zod schema for `MarketMetricResult` and `MarketMetricCollectionResult` matching the OpenAPI spec (symbol, name, value, change, change_pct, as_of, stale fields).
- **FR-003**: System MUST implement a `src/lib/rxjs/` directory containing RxJS BehaviorSubject-based observable streams for market metrics, strategies, and backtest runs.
- **FR-004**: Each resource (market metrics, strategies, backtest runs) MUST have three BehaviorSubjects: `data$` holding the latest API response payload or null, `error$` holding the latest error or null, and `loading$` holding the current fetch status — all initialised on module load.
- **FR-005**: Each BehaviorSubject MUST expose a `refresh()` trigger function that calls the appropriate Zodios client method using `switchMap` to cancel in-flight requests. The initial fetch MUST NOT fire on module import; it fires only when `refresh()` is explicitly called (e.g., from `onMount` or the app entry point).
- **FR-006**: Subscribers MUST receive the last emitted value immediately upon subscription (BehaviorSubject replay semantics).
- **FR-007**: System MUST create a market-metric state module at `src/lib/state/market-metric.svelte.ts` that subscribes to the RxJS stream and writes API response data into Svelte 5 rune-based `$state`.
- **FR-008**: Subscription glue that bridges RxJS streams to Svelte $state MUST live at the layout or app entry-point level (e.g., `src/routes/+layout.svelte` `onMount`). Existing strategy and backtest-run state modules (`strategy-list.svelte.ts`, `backtest-run.svelte.ts`) MUST NOT be modified to import from `rxjs` or `$lib/rxjs`; they remain RxJS-free singletons whose `$state` properties are written to by the layout subscription glue.
- **FR-009**: Error states (network failure, 401, 404) MUST be captured in the BehaviorSubject error path and reflected in component state without crashing the application. The stream MUST remain in the error state until an explicit `refresh()` call is made — no auto-retry.
- **FR-010**: The `src/lib/rxjs/` module MUST export a single index that exposes all BehaviorSubjects and refresh functions for tree-shaking-friendly imports.

### Key Entities

- **MarketMetricResult**: Single market indicator snapshot — symbol (SP500 | NDX100 | HSI | VIX | US10Y), name, value (number), change (number), change_pct (number), as_of (ISO 8601), stale (boolean).
- **MarketMetricCollectionResult**: Fixed collection of five MarketMetricResult items plus a top-level as_of timestamp.
- **BehaviorSubject\<T\>**: RxJS reactive primitive holding the last emitted value of type T (or null); all three resources are typed separately.
- **ResourceStream**: Per-resource module encapsulating a BehaviorSubject, a fetch function wired to the Zodios client, and a refresh trigger.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All five market metric tiles display live values on initial page load; the fetch is triggered automatically by the `onMount`-level `refreshMarketMetrics()` call in the layout entry point (not on module import). While the fetch is in-flight (`marketMetricState.loading === true`), five skeleton placeholder cards are shown. If the fetch fails (`marketMetricState.error !== null`), an inline error banner with a retry affordance is rendered in place of the tiles; clicking retry calls `refreshMarketMetrics()`. If the API returns an empty collection, a "no data available" message is shown.
- **SC-002**: A second component subscribing to the same BehaviorSubject receives the cached value without issuing a second network request.
- **SC-003**: A 401 API response causes the BehaviorSubject error stream to emit before the next macrotask (within the same microtask flush); no unhandled promise rejection reaches the console.
- **SC-004**: Rapid successive refresh calls result in exactly one completed network request (earlier in-flight requests are cancelled).
- **SC-005**: All new Zod schemas pass runtime validation against the example payloads from the OpenAPI spec.
- **SC-006**: The `src/lib/rxjs/` module adds no runtime code to components that do not import it (tree-shaking verified via bundle analysis).

## Clarifications

### Session 2026-06-07

- Q: After a fetch error, should the stream auto-retry or wait for a manual refresh call? → A: Error state persists; only an explicit `refresh()` call clears it and re-fetches. (See also Edge Cases — no-auto-retry rule is authoritative there.)
- Q: When should the initial API fetch be triggered for each resource stream? → A: Fetch fires only when an explicit `refresh()` / `init()` is called from the app entry point or `onMount` hook — not on module import.
- Analysis remediation (I1): FR-008 rewritten — subscription glue lives in layout, not in state modules, to preserve RxJS-free constraint on `src/lib/state/`.
- Analysis remediation (I2): FR-001 clarified — `getMarketMetric` registered in Zodios but has no RxJS stream in this feature scope.
- Analysis remediation (I4): tasks.md updated — T010 → T013 → T016 sequential dependency on `+layout.svelte` explicitly noted.
- Analysis remediation (A1): SC-003 rephrased — "before the next macrotask" replaces untestable "one event loop tick."
- Analysis remediation (U1): Assumptions updated — 401 redirect is out of scope; error propagation only.
- Analysis remediation (I1/SC-006): Assumptions updated — tree-shaking is a Vite/Rollup build-system guarantee; no manual bundle analysis task needed.
- Analysis remediation (U2): T011 updated — test approach specified (vi.fn + firstValueFrom; TestScheduler for marble assertions).

## Assumptions

- The Zodios client singleton (`src/lib/zodios/client.ts`) is already initialised and available as `apiClient`; this feature adds new endpoints to it rather than creating a new client.
- JWT token injection into request headers is handled by the existing Zodios client configuration; the RxJS layer does not need to manage auth headers directly.
- RxJS (`rxjs`) is not yet a declared dependency; it will be added to `package.json` as part of this feature.
- The `src/lib/rxjs/` directory does not yet exist; this feature creates it from scratch.
- Svelte 5 rune-based state (`$state`) is the canonical state primitive; the RxJS layer feeds into it via subscription rather than replacing it.
- The market-metric schema at `src/lib/schemas/market-metric.schema.ts` uses a different shape (UI-centric) than the API schema; a new API-aligned Zod schema will be added to `src/lib/zodios/schemas/market-metric.schema.ts` without modifying the UI schema.
- Polling interval, if needed in future, is out of scope for this feature; only on-demand refresh is required.
- Redirect to login on 401 is handled by a separate auth guard feature; this feature propagates the 401 error through the BehaviorSubject error channel only and does not perform navigation.
- Tree-shaking of `src/lib/rxjs/` is guaranteed by Vite/Rollup's ES module static analysis when barrel exports use named re-exports; no explicit bundle analysis task is required for this feature (SC-006 is a build-system guarantee, not a manual verification step).
