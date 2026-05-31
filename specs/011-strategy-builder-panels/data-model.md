# Data Model: Strategy Builder Input and Output Panels

**Date**: 2026-05-31
**Branch**: `011-strategy-builder-panels`

## Existing Schemas (reused, no changes)

### `BacktestResultSchema` (`src/lib/schemas/backtest-result.schema.ts`)

Fields used by `StrategyOutputPanel`:

| Field | Type | Display |
| ----- | ---- | ------- |
| `totalReturn` | `number` | Metric tile |
| `sharpeRatio` | `number` | Metric tile |
| `maxDrawdown` | `number` | Metric tile |
| `winRate` | `number` | Metric tile |
| `profitFactor` | `number` | Metric tile |
| `equityCurve` | `TimeSeriesPoint[]` | Line chart |

### `TradeRecordSchema` (`src/lib/schemas/trade-record.schema.ts`)

Fields used in trade summary table:

| Field | Type | Display |
| ----- | ---- | ------- |
| `tradeId` | `string` | Row key |
| `symbol` | `string` | Column |
| `direction` | `'Long' \| 'Short'` | Column |
| `entryDate` | `string` | Column |
| `exitDate` | `string` | Column |
| `netPnl` | `number` | Column |
| `returnPct` | `number` | Column |

### `StrategyStateSchema` (`src/lib/schemas/strategy-state.schema.ts`)

Existing fields:

| Field | Type | Usage |
| ----- | ---- | ----- |
| `inputText` | `string` | Bound to Input Panel textarea |
| `parsedStrategy` | `Strategy \| null` | Existing parsed output (unchanged) |

## New Schemas

### `StrategyInputPanelSchema` (`src/lib/schemas/strategy-input-panel.schema.ts`)

Props schema for the `StrategyInputPanel` organism:

| Field | Type | Constraint | Description |
| ----- | ---- | ---------- | ----------- |
| `inputText` | `string` | `min(0)` | Bound value of the strategy textarea |
| `isRunning` | `boolean` | default `false` | Disables Run button during async execution |
| `onRun` | function | required | Callback invoked when Run button is clicked |

### `StrategyOutputPanelSchema` (`src/lib/schemas/strategy-output-panel.schema.ts`)

Props schema for the `StrategyOutputPanel` organism:

| Field | Type | Constraint | Description |
| ----- | ---- | ---------- | ----------- |
| `result` | `BacktestResult \| null` | nullable | Full result object; null triggers empty/loading state |
| `isLoading` | `boolean` | default `false` | When true, shows loading skeleton |
| `error` | `string \| null` | nullable | When non-null, shows inline error message |

## State Extensions (`src/lib/state/strategy.svelte.ts`)

Three new reactive fields added to `StrategyState`:

| Field | Type | Initial Value | Description |
| ----- | ---- | ------------- | ----------- |
| `isRunning` | `boolean` | `false` | True while async backtest call is in flight |
| `backtestResult` | `BacktestResult \| null` | `null` | Populated on successful run; replaced on each new run |
| `runError` | `string \| null` | `null` | Populated on failed run; cleared on next run start |

## State Lifecycle

```
Initial:     isRunning=false, backtestResult=null, runError=null
             → Output Panel shows empty state

On Run click: isRunning=true, runError=null
             → Output Panel shows loading state; Run button disabled

On success:  isRunning=false, backtestResult=<result>, runError=null
             → Output Panel shows metrics + chart + trade table

On failure:  isRunning=false, backtestResult=<previous or null>, runError=<message>
             → Output Panel shows inline error; Input Panel remains editable
```
