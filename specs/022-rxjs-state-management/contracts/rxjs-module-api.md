# Contract: `src/lib/rxjs` Module Public API

**Feature**: 022-rxjs-state-management
**Date**: 2026-06-07

This document defines the public contract for the `src/lib/rxjs/` module — what it exports, the types each export carries, and the behavioural guarantees consumers can rely on.

---

## Exports from `src/lib/rxjs/index.ts`

```typescript
// Market Metrics stream
export { data$ as marketMetricsData$, error$ as marketMetricsError$, loading$ as marketMetricsLoading$, refresh as refreshMarketMetrics } from './market-metrics.stream.js';

// Strategies stream
export { data$ as strategiesData$, error$ as strategiesError$, loading$ as strategiesLoading$, refresh as refreshStrategies } from './strategies.stream.js';

// Backtest Runs stream
export { data$ as backtestRunsData$, error$ as backtestRunsError$, loading$ as backtestRunsLoading$, refresh as refreshBacktestRuns } from './backtest-runs.stream.js';
```

---

## Behavioural Guarantees

| Guarantee | Detail |
|-----------|--------|
| **Replay on subscribe** | `data$`, `error$`, and `loading$` are `BehaviorSubject`s — new subscribers immediately receive the last emitted value |
| **No auto-fetch** | Streams emit `null` / `false` until `refresh()` is explicitly called |
| **Cancellation** | Calling `refresh()` while a fetch is in flight cancels the prior request (`switchMap` semantics) |
| **Error isolation** | A failed fetch emits on `error$`; `data$` retains its last good value. The stream recovers on the next `refresh()` call |
| **Singleton** | Each stream module is a module-level singleton; all importers share the same `BehaviorSubject` instances |
| **No side effects on import** | Importing the module does not trigger any network request |

---

## Consumer Contract (layout glue example)

```typescript
// +layout.svelte
import { onMount, onDestroy } from 'svelte';
import { refreshMarketMetrics, marketMetricsData$, marketMetricsError$ } from '$lib/rxjs';
import { marketMetricState } from '$lib/state/market-metric.svelte.js';

let subs: { unsubscribe(): void }[] = [];

onMount(() => {
  subs.push(
    marketMetricsData$.subscribe(data => { marketMetricState.data = data; }),
    marketMetricsError$.subscribe(err => { marketMetricState.error = err; })
  );
  refreshMarketMetrics();
});

onDestroy(() => subs.forEach(s => s.unsubscribe()));
```

---

## Constraints

- Consumers MUST call `unsubscribe()` on all subscriptions in `onDestroy` to prevent memory leaks.
- Consumers MUST NOT call `data$.next()` directly — the stream is owned by the RxJS module; only `refresh()` may trigger mutations.
- The `loading$` BehaviorSubject is for UI spinner state only; do not use it to gate business logic.
