# UI Contract: TradeLotTable Organism

**Feature**: `014-trade-lot-table-organism` | **Date**: 2026-06-01

## Component Interface

```typescript
// Props accepted by TradeLotTable
interface TradeLotTableProps {
  trades: unknown[];  // Validated internally; invalid records excluded silently
}
```

## Rendering States

### State 1: Populated Table

**Condition**: `validatedTrades.length > 0`

**Renders**:
- `div.overflow-hidden.rounded-xl.border.bg-card.shadow-sm` wrapper
- `div.overflow-x-auto` inner scroll container
- `Table.Root` with `min-w-[1200px]`
- 14-column header row (fixed order): Trade ID, Symbol, L/S, Entry Date, Entry Price, Exit Date, Exit Price, Qty, Comm., Slip., Net PnL, Return %, Days, Exit Reason
- One `Table.Row` per valid trade, keyed by `trade.tradeId`

**Cell styling rules**:
| Column | Condition | Class |
|---|---|---|
| L/S (direction) | `=== 'Long'` | `text-blue-400` |
| L/S (direction) | `!== 'Long'` | `text-orange-400` |
| Net PnL | `> 0` | `font-semibold text-green-400` |
| Net PnL | `<= 0` | `text-red-400` |
| Return % | `> 0` | `text-green-400` |
| Return % | `<= 0` | `text-red-400` |

### State 2: Empty State

**Condition**: `validatedTrades.length === 0` (no valid records after Zod validation)

**Renders**:
- Same `div.overflow-hidden.rounded-xl.border.bg-card.shadow-sm` wrapper
- `div.m-4.space-y-4.rounded-lg.border-2.border-dashed.bg-muted/20.p-12.text-center`
- `p.font-medium.text-muted-foreground` with text `"No trade records yet."`
- `Button` (`size="sm"`) with label `"Go to Backtest Engine"` that calls `goto('/backtest-engine')`

## Invariants

- The organism MUST NOT render `Table.Root` when no valid trades exist.
- The organism MUST NOT throw or render an error boundary when invalid records are present.
- `console.warn('[TradeLotTable] Invalid trade excluded:', ...)` MUST be called for each excluded record.
- The `trades` prop change MUST reactively re-derive `validatedTrades` without a full re-mount.
