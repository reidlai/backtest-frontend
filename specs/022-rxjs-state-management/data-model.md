# Data Model: RxJS State Management (022)

**Date**: 2026-06-07
**Feature**: [spec.md](./spec.md)

---

## API-Aligned Zod Schemas (`src/lib/zodios/schemas/`)

### MarketMetricResult

Source: `GET /v1/market-metrics/{symbol}` response body.

| Field        | Type      | Required | Description                                              |
|-------------|-----------|----------|----------------------------------------------------------|
| `symbol`    | `string`  | ✅       | Canonical short code: SP500, NDX100, HSI, VIX, US10Y    |
| `name`      | `string`  | ✅       | Human-readable display label                             |
| `value`     | `number`  | ✅       | Current numeric value (index level, rate %, vol index)   |
| `change`    | `number`  | ✅       | Absolute day-over-day change (positive = up)             |
| `change_pct`| `number`  | ✅       | Percentage day-over-day change (e.g. 1.2 = +1.2%)       |
| `as_of`     | `string`  | ✅       | ISO 8601 UTC timestamp of the data point                 |
| `stale`     | `boolean` | ✅       | `true` when served from cache due to provider unavailability |

### MarketMetricCollectionResult

Source: `GET /v1/market-metrics` response body.

| Field    | Type                    | Required | Description                                      |
|---------|-------------------------|----------|--------------------------------------------------|
| `items` | `MarketMetricResult[]`  | ✅       | All five market metric snapshots                  |
| `as_of` | `string`                | ✅       | ISO 8601 UTC collection-level freshness timestamp |

**Constraint**: Collection is always exactly five items (SP500, NDX100, HSI, VIX, US10Y). Components must gracefully handle fewer items if the API returns a partial set.

---

## RxJS Stream Shape (`src/lib/rxjs/`)

Each resource module exposes the same interface shape:

### ResourceStream\<T\>

| Export       | Type                     | Description                                                     |
|-------------|--------------------------|------------------------------------------------------------------|
| `data$`     | `BehaviorSubject<T \| null>` | Holds latest successful API response, or `null` on init/error    |
| `error$`    | `BehaviorSubject<Error \| null>` | Holds last error, or `null` when data is current            |
| `loading$`  | `BehaviorSubject<boolean>` | `true` while a fetch is in flight                              |
| `refresh()` | `() => void`             | Triggers a new fetch; cancels any in-flight request via switchMap |

### Instantiated streams

| Module file                            | `T` type                    | Zodios alias          |
|---------------------------------------|-----------------------------|-----------------------|
| `src/lib/rxjs/market-metrics.stream.ts` | `MarketMetricCollectionResult` | `listMarketMetrics`  |
| `src/lib/rxjs/strategies.stream.ts`    | `PagedStrategyResult`       | `listStrategies`      |
| `src/lib/rxjs/backtest-runs.stream.ts` | `PagedBacktestRunResult`    | `listBacktestRuns`    |

---

## Svelte State Modules (`src/lib/state/`)

State modules remain **RxJS-free**. They expose Svelte 5 `$state` properties that are written to by layout-level subscription glue.

### MarketMetricState (new)

| Property  | Type                                | Description                        |
|----------|-------------------------------------|------------------------------------|
| `data`   | `MarketMetricCollectionResult \| null` | Latest collection from API        |
| `loading`| `boolean`                           | Whether a fetch is in progress      |
| `error`  | `ErrorResponse \| null`             | Last error from the API, if any     |

### StrategyListState (existing — no schema change)

No structural changes. The existing `data`, `loading`, `error` properties remain. The state is populated by layout subscription rather than direct Zodios calls.

### BacktestRunState (existing — no schema change)

No structural changes. The existing `list`, `loading`, `error`, `results`, `resultsLoading`, `resultsError` properties remain.

---

## State Lifecycle

```
[onMount in +layout.svelte]
  │
  ├─► marketMetricsStream.refresh()   → data$ emits → marketMetricState.data = payload
  ├─► strategiesStream.refresh()      → data$ emits → strategyListState.data = payload
  └─► backtestRunsStream.refresh()    → data$ emits → backtestRunState.list = payload

[on error]
  └─► error$ emits → state.error = error (data$ unchanged, stays at last good value or null)

[on explicit refresh() call]
  └─► refresh$.next() → switchMap cancels in-flight → new fetch begins → data$ / error$ updated
```

---

## Validation Rules

- `symbol` values are open strings; the known set (SP500, NDX100, HSI, VIX, US10Y) is documented but not enforced at the Zod schema level to allow forward compatibility with new symbols.
- `as_of` is validated as a non-empty string (ISO 8601 format asserted in tests, not enforced by Zod to avoid parsing overhead).
- `stale` defaults to `false` in normal operation per the OpenAPI spec.
- `value`, `change`, `change_pct` are typed as `number` (Zod `z.number()`); no range constraints applied.
