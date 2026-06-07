# Data Model: Zodios API Client with OpenAPI-Derived Zod Schemas

**Feature**: `021-zodios-api-client`
**Date**: 2026-06-06
**Source**: `/Users/reidlai/GitLocal/backtest-eapi/gen/http/openapi.yaml`

All schemas live under `src/lib/zodios/schemas/`. Types are inferred via `z.infer<typeof Schema>`.

---

## Response Schemas (17)

### ErrorResponse
**File**: `error-response.schema.ts`  
**RFC 7807 Problem Details — all fields required**

| Field | Zod Type | Notes |
|-------|----------|-------|
| `type` | `z.string()` | URI identifying the problem type |
| `title` | `z.string()` | Human-readable summary |
| `status` | `z.number().int()` | HTTP status code |
| `detail` | `z.string()` | Human-readable explanation |
| `instance` | `z.string()` | URI of the specific occurrence |

---

### HealthResponse
**File**: `health.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `status` | `z.string()` | yes |
| `version` | `z.string()` | yes |

---

### EntryConfig
**File**: `strategy-config.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `order_type` | `z.string()` | yes |
| `execution_timing` | `z.string()` | yes |
| `commission_model` | `z.string()` | yes |
| `commission_rate` | `z.number()` | yes |
| `slippage_model` | `z.string()` | yes |
| `slippage_value` | `z.number().optional()` | no |

---

### ExitConfig
**File**: `strategy-config.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `stop_loss_type` | `z.string()` | yes |
| `take_profit_type` | `z.string()` | yes |
| `trailing_stop_enabled` | `z.boolean()` | yes |
| `time_based_exit_enabled` | `z.boolean()` | yes |
| `stop_loss_value` | `z.number().optional()` | no |
| `take_profit_value` | `z.number().optional()` | no |
| `trailing_stop_pct` | `z.number().optional()` | no |
| `max_holding_days` | `z.number().int().optional()` | no |

---

### LiquidityFilter
**File**: `strategy-config.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `min_avg_volume_20d` | `z.number().optional()` | no |
| `min_market_cap` | `z.number().optional()` | no |
| `min_price` | `z.number().optional()` | no |
| `active_listing_only` | `z.boolean().optional()` | no |

---

### StrategyConfig
**File**: `strategy-config.schema.ts`  
_(Composed from EntryConfig, ExitConfig, LiquidityFilter)_

| Field | Zod Type | Required |
|-------|----------|----------|
| `entry_config` | `EntryConfigSchema` | yes |
| `exit_config` | `ExitConfigSchema` | yes |
| `liquidity_filter` | `LiquidityFilterSchema.optional()` | no |
| Additional config sub-objects (ranking, rebalance, signal, sizing, universe) | `z.unknown().optional()` | no |

---

### StrategyResult
**File**: `strategy.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `id` | `z.string().uuid()` | yes |
| `name` | `z.string()` | yes |
| `version` | `z.string()` | yes |
| `status` | `z.string()` | yes |
| `config` | `StrategyConfigSchema` | yes |

---

### PagedStrategyResult
**File**: `strategy.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `total` | `z.number().int()` | yes |
| `offset` | `z.number().int().optional()` | no |
| `limit` | `z.number().int().optional()` | no |
| `items` | `z.array(StrategyResultSchema)` | yes |

---

### BacktestConfig
**File**: `backtest-run.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `start_date` | `z.string()` | yes |
| `end_date` | `z.string()` | yes |
| `initial_capital` | `z.number()` | yes |
| `symbols` | `z.array(z.string())` | yes |
| `commission_rate` | `z.number()` | yes |
| `slippage_model` | `z.string()` | yes |
| `fixed_slippage` | `z.number().optional()` | no |
| `percentage_slippage` | `z.number().optional()` | no |
| `atr_slippage_multiple` | `z.number().optional()` | no |

---

### BacktestRunResult
**File**: `backtest-run.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `id` | `z.string().uuid()` | yes |
| `strategy_ids` | `z.array(z.string())` | yes |
| `strategy_versions` | `z.array(z.string())` | yes |
| `status` | `z.string()` | yes |
| `config` | `BacktestConfigSchema` | yes |
| `start_time` | `z.string().optional()` | no |
| `end_time` | `z.string().optional()` | no |

---

### PagedBacktestRunResult
**File**: `backtest-run.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `total` | `z.number().int()` | yes |
| `offset` | `z.number().int().optional()` | no |
| `limit` | `z.number().int().optional()` | no |
| `items` | `z.array(BacktestRunResultSchema)` | yes |

---

### ActionResponse
**File**: `action-response.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `run_id` | `z.string().uuid()` | yes |
| `status` | `z.string()` | yes |

---

### PerformanceMetrics
**File**: `performance-metrics.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `total_return_pct` | `z.number()` | yes |
| `annualized_return_pct` | `z.number()` | yes |
| `max_drawdown_pct` | `z.number()` | yes |
| `sharpe_ratio` | `z.number()` | yes |
| `sortino_ratio` | `z.number()` | yes |
| `win_rate` | `z.number()` | yes |
| `profit_factor` | `z.number()` | yes |
| `total_trades` | `z.number().int()` | yes |

---

### EquityCurve
**File**: `equity-curve.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `timestamps` | `z.array(z.string())` | yes |
| `equity_values` | `z.array(z.number())` | yes |
| `cash_balances` | `z.array(z.number())` | yes |
| `drawdowns` | `z.array(z.number())` | yes |

---

### TradeRecord
**File**: `trade-record.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `trade_id` | `z.string()` | yes |
| `symbol` | `z.string()` | yes |
| `side` | `z.string()` | yes |
| `entry_timestamp` | `z.string()` | yes |
| `exit_timestamp` | `z.string()` | yes |
| `entry_price` | `z.number()` | yes |
| `exit_price` | `z.number()` | yes |
| `quantity` | `z.number()` | yes |
| `pnl_absolute` | `z.number()` | yes |
| `pnl_pct` | `z.number()` | yes |
| `exit_reason` | `z.string().optional()` | no |

---

### SignalRecord
**File**: `signal-record.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `timestamp` | `z.string()` | yes |
| `symbol` | `z.string()` | yes |
| `action` | `z.string()` | yes |
| `conviction_score` | `z.number()` | yes |

---

### BacktestResultResource
**File**: `backtest-result.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `id` | `z.string().uuid()` | yes |
| `run_id` | `z.string().uuid()` | yes |
| `label` | `z.string()` | yes |
| `created_at` | `z.string()` | yes |
| `performance_metrics` | `PerformanceMetricsSchema` | yes |
| `equity_curve` | `EquityCurveSchema` | yes |
| `execution_log` | `z.array(TradeRecordSchema)` | yes |
| `signal_history` | `z.array(SignalRecordSchema)` | yes |

---

### PagedBacktestResultResource
**File**: `backtest-result.schema.ts`

| Field | Zod Type | Required |
|-------|----------|----------|
| `total` | `z.number().int()` | yes |
| `offset` | `z.number().int().optional()` | no |
| `limit` | `z.number().int().optional()` | no |
| `items` | `z.array(BacktestResultResourceSchema)` | yes |

---

## Request Body Schemas (4)

**File**: `request-bodies.schema.ts`

### BacktestRunServiceCreateRequestBody

| Field | Zod Type | Required |
|-------|----------|----------|
| `strategy_ids` | `z.array(z.string())` | yes |
| `strategy_versions` | `z.array(z.string())` | yes |
| `config` | `BacktestConfigSchema` | yes |

---

### StrategyServiceUpsertRequestBody

Same shape as `StrategyServiceReplaceRequestBody` but used for POST (create-or-upsert). Contains all `StrategyConfig` sub-fields.

| Field | Zod Type | Required |
|-------|----------|----------|
| `name` | `z.string()` | yes |
| `config` | `StrategyConfigSchema` | yes |

---

### StrategyServiceReplaceRequestBody

Full replacement body for PUT `/v1/strategies/{id}`.

| Field | Zod Type | Required |
|-------|----------|----------|
| `name` | `z.string()` | yes |
| `config` | `StrategyConfigSchema` | yes |

---

### StrategyServicePatchRequestBody

Partial update body for PATCH `/v1/strategies/{id}`. All fields optional.

| Field | Zod Type | Required |
|-------|----------|----------|
| `name` | `z.string().optional()` | no |
| `config` | `StrategyConfigSchema.partial().optional()` | no |

---

## State Modules (4 new `.svelte.ts` files)

**Location**: `src/lib/state/`

### strategy-list.svelte.ts

```typescript
{
  data:    PagedStrategyResult | null;  // $state
  loading: boolean;                     // $state
  error:   ErrorResponse | null;        // $state
}
```

### backtest-run.svelte.ts

```typescript
{
  // Collection state
  list:    PagedBacktestRunResult | null;  // $state — paged list
  loading: boolean;                        // $state
  error:   ErrorResponse | null;           // $state
  // Active run's results sub-state
  results: PagedBacktestResultResource | null;  // $state
  resultsLoading: boolean;                      // $state
  resultsError:   ErrorResponse | null;         // $state
}
```

### backtest-result.svelte.ts

```typescript
{
  data:    BacktestResultResource | null;  // $state — single detail view
  loading: boolean;                        // $state
  error:   ErrorResponse | null;           // $state
}
```

### health.svelte.ts _(optional, low priority)_

```typescript
{
  data:    HealthResponse | null;  // $state
  loading: boolean;                // $state
  error:   ErrorResponse | null;   // $state
}
```

---

## Generic Pagination Wrapper

A shared `PagedSchema<T>` factory avoids repetition across the three paged types:

```typescript
// src/lib/zodios/schemas/_paged.ts
import { z } from "zod";

export const pagedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    total:  z.number().int(),
    offset: z.number().int().optional(),
    limit:  z.number().int().optional(),
    items:  z.array(itemSchema),
  });
```

Used by `PagedStrategyResult`, `PagedBacktestRunResult`, `PagedBacktestResultResource`.

---

## Schema Dependency Graph

```
ErrorResponse          (standalone)
HealthResponse         (standalone)
ActionResponse         (standalone)
SignalRecord           (standalone)
PerformanceMetrics     (standalone)
EquityCurve            (standalone)
TradeRecord            (standalone)
EntryConfig            (standalone)
ExitConfig             (standalone)
LiquidityFilter        (standalone)
StrategyConfig         → EntryConfig, ExitConfig, LiquidityFilter
StrategyResult         → StrategyConfig
PagedStrategyResult    → StrategyResult
BacktestConfig         (standalone)
BacktestRunResult      → BacktestConfig
PagedBacktestRunResult → BacktestRunResult
BacktestResultResource → PerformanceMetrics, EquityCurve, TradeRecord, SignalRecord
PagedBacktestResult... → BacktestResultResource
```
