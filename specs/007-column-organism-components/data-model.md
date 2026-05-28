# Data Model: Backtest Engine Column Organism Components

**Phase**: 1 — Design
**Date**: 2026-05-28

## Schema Entities

### 1. `UniverseCapitalConfigSchema`

**File**: `src/lib/schemas/universe-capital-config.schema.ts`

**Description**: Zod schema for the Universe & Capital column organism state. Also owns `BacktestModeSchema` (moved from `backtest-state.schema.ts`).

| Field | Zod Type | Default | Validation |
| --- | --- | --- | --- |
| `mode` | `BacktestModeSchema` (z.enum) | `'Single Stock'` | Must be one of: `'Single Stock'`, `'Watchlist'`, `'Screener Result'`, `'Index Universe'`, `'Strategy Comparison'`, `'Benchmark Comparison'` |
| `universe` | `z.string()` | `'SPY'` | Non-empty string |
| `initialCapital` | `z.string()` | `'100000'` | String representation of numeric capital amount |

**Exported identifiers**:
- `BacktestModeSchema` — the mode enum schema
- `BacktestMode` — inferred TypeScript type (`z.infer<typeof BacktestModeSchema>`)
- `UniverseCapitalConfigSchema` — the full object schema
- `UniverseCapitalConfig` — inferred TypeScript type

---

### 2. `ScheduleExecutionConfigSchema`

**File**: `src/lib/schemas/schedule-execution-config.schema.ts`

**Description**: Zod schema for the Schedule & Execution column organism state.

| Field | Zod Type | Default | Validation |
| --- | --- | --- | --- |
| `startDate` | `z.string()` | `'2020-01-01'` | ISO 8601 date string |
| `endDate` | `z.string()` | `'2024-12-31'` | ISO 8601 date string |
| `timeframe` | `z.string()` | `'Daily'` | One of: `'Minute'`, `'Hourly'`, `'Daily'`, `'Weekly'` |
| `direction` | `z.enum(['Long', 'Short', 'Both'])` | `'Long'` | Must be one of the three values |

**Exported identifiers**:
- `ScheduleExecutionConfigSchema` — the full object schema
- `ScheduleExecutionConfig` — inferred TypeScript type

---

### 3. `OrderTypesConfigSchema`

**File**: `src/lib/schemas/order-types-config.schema.ts`

**Description**: Zod schema for the Order Types column organism state. Also owns `OrderTypeSchema` (moved from `backtest-state.schema.ts`).

| Field | Zod Type | Default | Validation |
| --- | --- | --- | --- |
| `selectedOrderTypes` | `z.array(OrderTypeSchema)` | `['Market']` | Array of valid `OrderType` enum values |

**Exported identifiers**:
- `OrderTypeSchema` — the order type enum schema
- `OrderType` — inferred TypeScript type (`z.infer<typeof OrderTypeSchema>`)
- `OrderTypesConfigSchema` — the full object schema
- `OrderTypesConfig` — inferred TypeScript type

**Order type enum values**: `'Market'`, `'Limit'`, `'Stop'`, `'Stop-Limit'`, `'Trailing Stop'`, `'Bracket'`, `'OCO'`, `'Short Sell'`

---

## State Singleton Entities

### 4. `UniverseCapitalConfigState`

**File**: `src/lib/state/universe-capital-config.svelte.ts`
**Exported instance**: `universeCapitalConfigState`

| Property | Type | Description |
| --- | --- | --- |
| `mode` | `BacktestMode` | `$state` — selected backtest mode |
| `universe` | `string` | `$state` — symbol or universe identifier |
| `initialCapital` | `string` | `$state` — initial capital as string |

**Methods**:
| Method | Signature | Description |
| --- | --- | --- |
| `reset()` | `() => void` | Resets all fields to `UniverseCapitalConfigSchema.parse({})` defaults |

**Initialization**: Fields initialized from `UniverseCapitalConfigSchema.parse({})` defaults, mirroring the `BacktestState` pattern.

---

### 5. `ScheduleExecutionConfigState`

**File**: `src/lib/state/schedule-execution-config.svelte.ts`
**Exported instance**: `scheduleExecutionConfigState`

| Property | Type | Description |
| --- | --- | --- |
| `startDate` | `string` | `$state` — backtest start date (ISO 8601) |
| `endDate` | `string` | `$state` — backtest end date (ISO 8601) |
| `timeframe` | `string` | `$state` — candle timeframe |
| `direction` | `'Long' \| 'Short' \| 'Both'` | `$state` — trading direction |

**Methods**:
| Method | Signature | Description |
| --- | --- | --- |
| `reset()` | `() => void` | Resets all fields to `ScheduleExecutionConfigSchema.parse({})` defaults |

---

### 6. `OrderTypesConfigState`

**File**: `src/lib/state/order-types-config.svelte.ts`
**Exported instance**: `orderTypesConfigState`

| Property | Type | Description |
| --- | --- | --- |
| `selectedOrderTypes` | `SvelteSet<OrderType>` | Reactive set of currently selected order types |

**Methods**:
| Method | Signature | Description |
| --- | --- | --- |
| `reset()` | `() => void` | Clears set and re-populates from `OrderTypesConfigSchema.parse({})` defaults |

**Note**: `selectedOrderTypes` is a `SvelteSet` (not `$state` array) to preserve `.has()`, `.add()`, `.delete()` semantics used in the checkbox binding, matching the existing `BacktestState` implementation.

---

## Removed Entities

### `BacktestState` (REMOVED)

**File**: `src/lib/state/backtest.svelte.ts` — **DELETED**

All fields migrated to the three new per-organism state singletons above. All import sites updated:
- `src/routes/backtest-engine/+page.svelte` — imports 3 new singletons
- `src/lib/components/organisms/QuickActionsPanel.svelte` — imports 3 new singletons for `reset()`

### `BacktestStateSchema` (REMOVED)

**File**: `src/lib/schemas/backtest-state.schema.ts` — **DELETED**

All schemas migrated to the three new schema files. `BacktestModeSchema` and `OrderTypeSchema` re-exported from new files via `src/lib/schemas/index.ts`.

---

## `index.ts` Barrel Changes

**File**: `src/lib/schemas/index.ts`

**Exports to remove**:
- `BacktestStateSchema`, `BacktestState` (type)
- `BacktestModeSchema`, `BacktestMode` (type)
- `OrderTypeSchema`, `OrderType` (type)

**Exports to add**:
- From `universe-capital-config.schema.ts`: `BacktestModeSchema`, `BacktestMode`, `UniverseCapitalConfigSchema`, `UniverseCapitalConfig`
- From `schedule-execution-config.schema.ts`: `ScheduleExecutionConfigSchema`, `ScheduleExecutionConfig`
- From `order-types-config.schema.ts`: `OrderTypeSchema`, `OrderType`, `OrderTypesConfigSchema`, `OrderTypesConfig`
