# Component Contract: ScreenerResultTable

**Type**: Svelte 5 Organism Component  
**File**: `src/lib/components/organisms/ScreenerResultTable.svelte`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `onBacktest` | `(symbol: string) => void` | Yes | Called when user clicks Backtest for a row |

## Exports (module-level)

None.

## Data Sourcing

Imports `sampleScreenerResults` from `$lib/shared-mockdata/market` internally. The page does not supply or know about this data.

## Rendered UI

Renders a full `Table` with:

| Column | Source Field |
|---|---|
| Symbol | `result.symbol` |
| Name | `result.name` |
| P/E | `result.peRatio` |
| EV/EBITDA | `result.evEbitda` |
| FCF Yield | `result.fcfYield` |
| ROIC | `result.roic` |
| Rev Growth | `result.revenueGrowth` |
| EPS Growth | `result.epsGrowth` |
| Score | `result.score` |
| Action | Backtest button → calls `onBacktest(result.symbol)` |

## Empty State

When `sampleScreenerResults` is empty: table header renders, body is empty. No crash.

## Constraints

- Must not import any screener data at the page level
- Must preserve existing `ScreenerResultRow` molecule (passes `result` and `onBacktest` props to it)
- Must preserve existing Tailwind layout classes from the original inline results block
