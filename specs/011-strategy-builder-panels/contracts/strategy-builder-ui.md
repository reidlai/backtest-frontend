# UI Contract: Strategy Builder Organisms

**Date**: 2026-05-31
**Branch**: `011-strategy-builder-panels`

## StrategyInputPanel

**File**: `src/lib/components/organisms/StrategyInputPanel.svelte`
**Schema**: `src/lib/schemas/strategy-input-panel.schema.ts`

### Props Interface

```typescript
interface StrategyInputPanelProps {
  inputText: string;        // Bound textarea value
  isRunning: boolean;       // Disables Run button when true
  onRun: () => void;        // Called on valid Run click
}
```

### States

| State | Trigger | UI Behaviour |
| ----- | ------- | ------------ |
| Default (empty) | `inputText === ''` | Textarea empty; Run button disabled; no error shown |
| Typing (invalid) | `inputText.length < 10` and textarea touched | Inline error below textarea: "Strategy description must be at least 10 characters"; Run disabled |
| Valid | `inputText.length >= 10` | No error; Run button enabled |
| Running | `isRunning === true` | Run button disabled with loading indicator |

### Emitted Interactions

- `onRun()` — fired on button click when input is valid and `isRunning` is false

---

## StrategyOutputPanel

**File**: `src/lib/components/organisms/StrategyOutputPanel.svelte`
**Schema**: `src/lib/schemas/strategy-output-panel.schema.ts`

### Props Interface

```typescript
interface StrategyOutputPanelProps {
  result: BacktestResult | null;  // Full result; null = empty/loading state
  isLoading: boolean;             // Shows loading skeleton when true
  error: string | null;           // Shows inline error when non-null
}
```

### States

| State | Trigger | UI Behaviour |
| ----- | ------- | ------------ |
| Empty | `result === null && !isLoading && error === null` | Dashed border placeholder with instructional text |
| Loading | `isLoading === true` | Skeleton placeholders for metrics, chart, and table |
| Result | `result !== null && !isLoading` | Performance metric tiles + equity curve chart + trade table |
| Error | `error !== null && !isLoading` | Inline error message card inside panel; previous result (if any) hidden |

### Display Sections (Result state)

1. **Performance Metrics** — 5 metric tiles: Total Return, Sharpe Ratio, Max Drawdown, Win Rate, Profit Factor
2. **Equity Curve** — Line chart of `result.equityCurve` (date → value) using layerchart
3. **Trade Summary Table** — Columns: Symbol, Direction, Entry Date, Exit Date, Net P&L, Return %
