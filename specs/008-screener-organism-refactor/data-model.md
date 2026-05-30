# Data Model: Fundamental Screener Organism Refactor

**Branch**: `008-screener-organism-refactor` | **Date**: 2026-05-29

## Entities

### FundamentalScreenerState

Managed internally by `ScreenerFilterPanel`. Not exposed externally.

| Field | Type | Default | Validation |
|---|---|---|---|
| `universe` | `string` | `'S&P 500'` | Non-empty string |
| `peMax` | `string` | `'30'` | Non-empty string |
| `roicMin` | `string` | `'15'` | Non-empty string |
| `revGrowthMin` | `string` | `'10'` | Non-empty string |

**Source**: `FundamentalScreenerSchema` in `src/lib/schemas/fundamental-screener.schema.ts` (unchanged).

**Lifecycle**: Initialised from schema defaults on mount; restored from snapshot on navigation back.

---

### ScreenerResult

Consumed by `ScreenerResultTable`. Sourced from `sampleScreenerResults` in `$lib/shared-mockdata/market`.

| Field | Type | Notes |
|---|---|---|
| `symbol` | `string` | Ticker symbol; used as row key |
| `name` | `string` | Company name |
| `peRatio` | `number` | P/E ratio |
| `evEbitda` | `number` | EV/EBITDA |
| `fcfYield` | `number` | FCF yield (%) |
| `roic` | `number` | Return on invested capital (%) |
| `revenueGrowth` | `number` | Revenue growth (%) |
| `epsGrowth` | `number` | EPS growth (%) |
| `score` | `number` | Composite score |

**Source**: `ScreenerResultSchema` in `src/lib/schemas/screener-result.schema.ts` (unchanged).

---

## Snapshot Contract

`ScreenerFilterPanel` exports a `snapshot` object conforming to SvelteKit's `Snapshot<FundamentalScreenerState>` type:

```ts
capture: () => FundamentalScreenerState   // returns current state
restore: (value: unknown) => void         // validates with FundamentalScreenerSchema.safeParse; applies on success
```

The page re-exports this snapshot object to satisfy SvelteKit's routing contract.

---

## Component Interfaces

### ScreenerFilterPanel

- **Props**: none
- **Exports**: `snapshot: Snapshot<FundamentalScreenerState>`
- **Internal state**: `FundamentalScreenerState` (4 fields)
- **Side effects**: none

### ScreenerResultTable

- **Props**: `onBacktest: (symbol: string) => void`
- **Exports**: none
- **Internal state**: `results: ScreenerResult[]` (sourced from `sampleScreenerResults`)
- **Side effects**: calls `onBacktest(symbol)` when Backtest button clicked
