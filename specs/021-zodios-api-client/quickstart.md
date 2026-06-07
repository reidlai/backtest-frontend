# Quickstart: Zodios API Client with OpenAPI-Derived Zod Schemas

**Feature**: `021-zodios-api-client`
**Date**: 2026-06-06

---

## Install

```bash
pnpm add @zodios/core
```

No additional peer dependencies — `zod` is already installed.

---

## Directory Layout After This Feature

```
src/lib/zodios/
  schemas/
    _paged.ts                        # Generic paged wrapper factory
    error-response.schema.ts
    health.schema.ts
    strategy.schema.ts               # StrategyResult + PagedStrategyResult
    strategy-config.schema.ts        # EntryConfig, ExitConfig, LiquidityFilter, StrategyConfig
    backtest-run.schema.ts           # BacktestConfig, BacktestRunResult, PagedBacktestRunResult
    backtest-result.schema.ts        # BacktestResultResource, PagedBacktestResultResource
    performance-metrics.schema.ts
    equity-curve.schema.ts
    trade-record.schema.ts
    signal-record.schema.ts
    action-response.schema.ts
    request-bodies.schema.ts         # All 4 request body schemas
  client.ts                          # Zodios singleton
  index.ts                           # Barrel export

src/lib/state/
  strategy-list.svelte.ts            # NEW
  backtest-run.svelte.ts             # NEW
  backtest-result.svelte.ts          # NEW
```

---

## Key Usage Patterns

### 1. Calling an endpoint

```typescript
import { backtestApi } from "$lib/zodios/client";

// List strategies — fully typed return
const result = await backtestApi.listStrategies({ queries: { offset: 0, limit: 20 } });
// result: { total: number, items: StrategyResult[], offset?: number, limit?: number }
```

### 2. Writing to state (from a page `+page.ts` or load function)

```typescript
import { strategyListState } from "$lib/state/strategy-list.svelte";
import { backtestApi }       from "$lib/zodios/client";

strategyListState.loading = true;
try {
  strategyListState.data  = await backtestApi.listStrategies({ queries: {} });
  strategyListState.error = null;
} catch (err) {
  strategyListState.error = err as ErrorResponse;
} finally {
  strategyListState.loading = false;
}
```

### 3. Passing state to an organism via `$props()`

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { strategyListState } from "$lib/state/strategy-list.svelte";
  import StrategyListOrganism from "$lib/components/organisms/StrategyListOrganism.svelte";
</script>

<StrategyListOrganism
  items={strategyListState.data?.items ?? []}
  loading={strategyListState.loading}
  error={strategyListState.error}
/>
```

```svelte
<!-- StrategyListOrganism.svelte -->
<script lang="ts">
  import type { StrategyResult, ErrorResponse } from "$lib/zodios";
  let { items, loading, error }: {
    items: StrategyResult[];
    loading: boolean;
    error: ErrorResponse | null;
  } = $props();
</script>
```

### 4. Testing a state module without UI

```typescript
// src/lib/state/__tests__/state.test.ts
import { strategyListState } from "$lib/state/strategy-list.svelte";

test("strategy list state starts empty", () => {
  expect(strategyListState.data).toBeNull();
  expect(strategyListState.loading).toBe(false);
  expect(strategyListState.error).toBeNull();
});

test("write mock data", () => {
  strategyListState.data = { total: 1, items: [mockStrategy] };
  expect(strategyListState.data.total).toBe(1);
});
```

### 5. Parsing a schema in a test

```typescript
import { TradeRecordSchema } from "$lib/zodios/schemas/trade-record.schema";

const raw = {
  trade_id: "trade-001",
  symbol: "AAPL",
  side: "LONG",
  entry_timestamp: "2024-03-01T09:30:00Z",
  exit_timestamp: "2024-03-12T16:00:00Z",
  entry_price: 175.5,
  exit_price: 182.3,
  quantity: 10,
  pnl_absolute: 68,
  pnl_pct: 0.039,
};

const result = TradeRecordSchema.parse(raw);
// result is typed as TradeRecord — no errors thrown
```

---

## Environment Variable

The Zodios client reads the backend URL from:

```
PUBLIC_BACKTEST_EAPI_URL=http://localhost:8080
```

Set this in `.env.local` for development. The client fails at construction time if this is missing.

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `ZodError: invalid_type at trade_id` | Old camelCase test data used after migration | Update test fixtures to snake_case |
| `Cannot find module "$lib/zodios"` | Barrel file not yet created | Run `pnpm prepare` or create `src/lib/zodios/index.ts` |
| `PUBLIC_BACKTEST_EAPI_URL is undefined` | Missing env var | Add to `.env.local` |
| TypeScript error on organism `$props()` | Prop type mismatch after schema rename | Update organism prop types to new schema fields |
