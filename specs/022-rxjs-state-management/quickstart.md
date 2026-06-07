# Quickstart: RxJS State Management (022)

## Prerequisites

- Feature branch `022-rxjs-state-management` checked out
- `pnpm install` run after adding `rxjs` dependency

## 1. Install RxJS

```bash
pnpm add rxjs
```

## 2. Key files added by this feature

| Path | Purpose |
|------|---------|
| `src/lib/zodios/schemas/market-metric.schema.ts` | API-aligned Zod schema for market metrics |
| `src/lib/zodios/client.ts` | Extended with `listMarketMetrics` + `getMarketMetric` endpoints |
| `src/lib/rxjs/market-metrics.stream.ts` | BehaviorSubject stream for market metrics |
| `src/lib/rxjs/strategies.stream.ts` | BehaviorSubject stream for strategies |
| `src/lib/rxjs/backtest-runs.stream.ts` | BehaviorSubject stream for backtest runs |
| `src/lib/rxjs/index.ts` | Barrel export for all streams |
| `src/lib/state/market-metric.svelte.ts` | Svelte 5 $state module for market metrics |
| `features/rxjs-state-management.feature` | BDD Gherkin scenarios |

## 3. Wire streams in your layout

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    refreshMarketMetrics, marketMetricsData$, marketMetricsError$, marketMetricsLoading$,
    refreshStrategies, strategiesData$, strategiesError$,
    refreshBacktestRuns, backtestRunsData$, backtestRunsError$
  } from '$lib/rxjs';
  import { marketMetricState } from '$lib/state/market-metric.svelte.js';
  import { strategyListState } from '$lib/state/strategy-list.svelte.js';
  import { backtestRunState } from '$lib/state/backtest-run.svelte.js';

  let subs: { unsubscribe(): void }[] = [];

  onMount(() => {
    subs.push(
      marketMetricsData$.subscribe(d => { marketMetricState.data = d; }),
      marketMetricsError$.subscribe(e => { marketMetricState.error = e; }),
      marketMetricsLoading$.subscribe(l => { marketMetricState.loading = l; }),

      strategiesData$.subscribe(d => { strategyListState.data = d; }),
      strategiesError$.subscribe(e => { strategyListState.error = e; }),

      backtestRunsData$.subscribe(d => { backtestRunState.list = d; }),
      backtestRunsError$.subscribe(e => { backtestRunState.error = e; })
    );

    refreshMarketMetrics();
    refreshStrategies();
    refreshBacktestRuns();
  });

  onDestroy(() => subs.forEach(s => s.unsubscribe()));
</script>
```

## 4. Manually trigger a refresh

```typescript
import { refreshMarketMetrics } from '$lib/rxjs';
// Call from any component or event handler:
refreshMarketMetrics();
```

## 5. Run unit tests

```bash
pnpm vitest run src/lib/rxjs
```

## 6. Run BDD scenarios (dry-run)

```bash
# When Cucumber step runner is configured:
npx cucumber-js features/rxjs-state-management.feature --dry-run
```
