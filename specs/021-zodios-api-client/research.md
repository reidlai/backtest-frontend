# Research: Zodios API Client with OpenAPI-Derived Zod Schemas

**Feature**: `021-zodios-api-client`
**Date**: 2026-06-06

---

## 1. @zodios/core v11 API Surface

**Decision**: Use `@zodios/core` v11 with native fetch adapter.

**Rationale**: v11 drops the Axios dependency and defaults to native `fetch`. The endpoint array pattern maps directly from the OpenAPI paths list. Zod response schemas are inlined per endpoint.

**Key API patterns**:

```typescript
import { Zodios } from "@zodios/core";
import { z } from "zod";

const api = new Zodios("http://localhost:8080", [
  {
    method: "get",
    path: "/v1/strategies",
    alias: "listStrategies",
    response: PagedStrategyResultSchema,
    parameters: [
      { name: "offset", type: "Query", schema: z.number().optional() },
      { name: "limit",  type: "Query", schema: z.number().optional() },
    ],
  },
  // ...
]);

// Call:
const result = await api.listStrategies({ queries: { offset: 0, limit: 20 } });
// result is typed as z.infer<typeof PagedStrategyResultSchema>
```

**v11 install**: `pnpm add @zodios/core` (no `@zodios/plugins` needed for basic native-fetch usage)

**Singleton pattern**: Export a single instance from `src/lib/zodios/client.ts`, reading base URL from `import.meta.env.PUBLIC_BACKTEST_EAPI_URL`.

**Alternatives considered**: Axios-based `@zodios/core` v10 (rejected: introduces Axios dependency), raw `fetch` + hand-written types (rejected: no compile-time type inference from Zod schemas).

---

## 2. Zod v4 Schema Patterns

**Decision**: Use `zod` v4.4.3 (already installed). No migration needed.

**Key patterns used**:

```typescript
import { z } from "zod";

// Optional field (not required in OpenAPI):
z.string().optional()

// Nullable + optional:
z.string().nullable().optional()

// Array:
z.array(z.string())

// Nested object:
const EntryConfigSchema = z.object({ ... });
const StrategyConfigSchema = z.object({
  entry_config: EntryConfigSchema,
  exit_config: ExitConfigSchema,
  liquidity_filter: LiquidityFilterSchema.optional(),
});

// Type inference:
type StrategyResult = z.infer<typeof StrategyResultSchema>;

// Generic paged wrapper:
const PagedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    total: z.number().int(),
    offset: z.number().int().optional(),
    limit:  z.number().int().optional(),
    items:  z.array(itemSchema),
  });
```

**Field naming**: All OpenAPI fields are snake_case. Schemas use snake_case. Existing `src/lib/schemas/` files that use camelCase are the conflict targets — they will be updated to snake_case in this feature.

---

## 3. Svelte 5 Rune State Module Pattern

**Decision**: `$state()` in `.svelte.ts` files, consistent with existing state files.

**Pattern**:

```typescript
// src/lib/state/strategy-list.svelte.ts
import type { z } from "zod";
import type { PagedStrategyResultSchema } from "$lib/zodios/schemas/strategy.schema";
import type { ErrorResponseSchema }       from "$lib/zodios/schemas/error-response.schema";

type PagedStrategyResult = z.infer<typeof PagedStrategyResultSchema>;
type ErrorResponse       = z.infer<typeof ErrorResponseSchema>;

export const strategyListState = $state<{
  data:    PagedStrategyResult | null;
  loading: boolean;
  error:   ErrorResponse | null;
}>({
  data:    null,
  loading: false,
  error:   null,
});
```

**Reading without UI**: Works in any `.ts` or `.svelte.ts` context because `$state()` in `.svelte.ts` is a module-level rune — no component mounting needed.

**Alternatives considered**: Svelte stores (`writable()`) — rejected because existing codebase already uses Svelte 5 runes; mixing the two patterns adds cognitive overhead.

---

## 4. All 15 API Endpoints (SC-003 correction: spec said 13, OpenAPI has 15)

| # | Method | Path | Alias | Response Schema |
|---|--------|------|-------|----------------|
| 1 | GET | `/health` | `healthz` | `HealthResponseSchema` |
| 2 | GET | `/v1/strategies` | `listStrategies` | `PagedStrategyResultSchema` |
| 3 | POST | `/v1/strategies` | `upsertStrategy` | `StrategyResultSchema` |
| 4 | GET | `/v1/strategies/{id}` | `getStrategy` | `StrategyResultSchema` |
| 5 | PUT | `/v1/strategies/{id}` | `replaceStrategy` | `StrategyResultSchema` |
| 6 | DELETE | `/v1/strategies/{id}` | `deleteStrategy` | `z.void()` |
| 7 | PATCH | `/v1/strategies/{id}` | `patchStrategy` | `StrategyResultSchema` |
| 8 | GET | `/v1/backtest-runs` | `listBacktestRuns` | `PagedBacktestRunResultSchema` |
| 9 | POST | `/v1/backtest-runs` | `createBacktestRun` | `BacktestRunResultSchema` |
| 10 | GET | `/v1/backtest-runs/{run_id}` | `getBacktestRun` | `BacktestRunResultSchema` |
| 11 | DELETE | `/v1/backtest-runs/{run_id}` | `deleteBacktestRun` | `z.void()` |
| 12 | POST | `/v1/backtest-runs/{run_id}/run` | `triggerBacktestRun` | `ActionResponseSchema` |
| 13 | POST | `/v1/backtest-runs/{run_id}/cancel` | `cancelBacktestRun` | `ActionResponseSchema` |
| 14 | GET | `/v1/backtest-runs/{run_id}/results` | `listBacktestResults` | `PagedBacktestResultResourceSchema` |
| 15 | GET | `/v1/backtest-runs/{run_id}/results/{result_id}` | `getBacktestResult` | `BacktestResultResourceSchema` |

---

## 5. Schema Migration Conflicts

| Existing File | Existing Field (camelCase) | OpenAPI Field (snake_case) | Action |
|--------------|--------------------------|--------------------------|--------|
| `trade-record.schema.ts` | `tradeId` | `trade_id` | Rename to snake_case |
| `trade-record.schema.ts` | `direction` | `side` | Rename to `side` |
| `trade-record.schema.ts` | `entryDate` | `entry_timestamp` | Rename to `entry_timestamp` |
| `trade-record.schema.ts` | `exitDate` | `exit_timestamp` | Rename to `exit_timestamp` |
| `trade-record.schema.ts` | `entryPrice` | `entry_price` | Rename |
| `trade-record.schema.ts` | `exitPrice` | `exit_price` | Rename |
| `trade-record.schema.ts` | `netPnl` | `pnl_absolute` | Rename |
| `trade-record.schema.ts` | `netPnlPct` | `pnl_pct` | Rename |
| `trade-record.schema.ts` | `commission` | (removed) | Delete field |
| `trade-record.schema.ts` | `slippage` | (removed) | Delete field |
| `trade-record.schema.ts` | `holdingDays` | (removed) | Delete field |
| `trade-record.schema.ts` | (absent) | `exit_reason` | Add field |
| `trade-record.schema.ts` | (absent) | `symbol` | Add field |
| `trade-record.schema.ts` | (absent) | `quantity` | Add field |
| `backtest-result.schema.ts` | monolithic `BacktestResultSchema` | decomposed into 4 schemas | Decompose; re-export compat alias |
| `strategy.schema.ts` | UI abstraction (market, fundamentalFilter, etc.) | N/A — different domain | Unchanged |
| `backtest-runs-card.schema.ts` | billing UI state | N/A — different domain | Unchanged |
| `performance-metric-grid.schema.ts` | UI interaction state | N/A — interaction state | Unchanged (UI state stays local) |

All conflicts above were explicitly approved by the user in the clarification session (2026-06-06).

---

## 6. PerformanceMetrics OpenAPI Fields

From OpenAPI `definitions.PerformanceMetrics`:

| Field | Type | Required |
|-------|------|----------|
| `total_return_pct` | number | yes |
| `annualized_return_pct` | number | yes |
| `max_drawdown_pct` | number | yes |
| `sharpe_ratio` | number | yes |
| `sortino_ratio` | number | yes |
| `win_rate` | number | yes |
| `profit_factor` | number | yes |
| `total_trades` | integer | yes |

---

## 7. Unresolved Items

None. All NEEDS CLARIFICATION items resolved:
- `@zodios/core` v11 native fetch confirmed
- Error handling via RFC 7807 ErrorResponse confirmed
- Organisms receive data via `$props()` only confirmed
- Schema migration approach (in-place update + re-export) confirmed
- Field conflict resolution (all conflicts user-approved) confirmed
- Endpoint count corrected to 15
