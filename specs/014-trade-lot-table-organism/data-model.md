# Data Model: Trade Lot Table Organism

**Feature**: `014-trade-lot-table-organism` | **Date**: 2026-06-01

## Entities

### TradeRecord

Source of truth: `src/lib/schemas/trade-record.schema.ts` — `TradeRecordSchema`

| Field | Type | Constraints | Display |
|---|---|---|---|
| `tradeId` | `string` | required | Font-mono, xs text |
| `symbol` | `string` | required | Font-bold |
| `direction` | `'Long' \| 'Short'` | enum via `TradeDirectionSchema` | `text-blue-400` (Long) / `text-orange-400` (Short) |
| `entryDate` | `string` | required | Plain text |
| `entryPrice` | `number` | required | Prefixed `$` |
| `exitDate` | `string` | required | Plain text |
| `exitPrice` | `number` | required | Prefixed `$` |
| `quantity` | `number` | required | Plain text |
| `commission` | `number` | required | Prefixed `$` |
| `slippage` | `number` | required | Prefixed `$` |
| `netPnl` | `number` | required | `toLocaleString()`, `text-green-400` if `> 0` else `text-red-400` |
| `returnPct` | `number` | required | Suffixed `%`, `text-green-400` if `> 0` else `text-red-400` |
| `holdingDays` | `number` | required | Plain text |
| `exitReason` | `string` | required | xs text, muted-foreground |

### Validation Rules

- All fields are required; any missing field causes the record to fail `safeParse` and be excluded.
- `direction` must be exactly `'Long'` or `'Short'`; any other value fails validation.
- Numeric fields (`entryPrice`, `exitPrice`, `quantity`, `commission`, `slippage`, `netPnl`, `returnPct`, `holdingDays`) must be JavaScript `number` type; strings that look like numbers will fail.
- `netPnl === 0` and `returnPct === 0` use red styling (condition is strictly `> 0`).

## Component Props

### TradeLotTable

| Prop | Type | Description |
|---|---|---|
| `trades` | `unknown[]` | Raw trade records from parent; validated internally via `TradeRecordSchema.safeParse` |

### Internal Derived State

| State | Type | Description |
|---|---|---|
| `validatedTrades` | `TradeRecord[]` | `$derived` array of records that pass `TradeRecordSchema.safeParse`; invalid entries logged and excluded |
