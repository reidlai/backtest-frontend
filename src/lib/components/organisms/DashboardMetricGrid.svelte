<script lang="ts">
	import { z } from 'zod';
	import MetricTile from '../molecules/MetricTile.svelte';
	import { sampleMarketMetrics } from '$lib/shared-mockdata/market';
	import { DashboardMetricGridSchema, MetricCategorySchema } from '$lib/schemas';
	import { useMockData } from '$lib/env.js';
	import { marketMetricState } from '$lib/state/market-metric.svelte.js';
	import { strategyListState } from '$lib/state/strategy-list.svelte.js';
	import { backtestRunState } from '$lib/state/backtest-run.svelte.js';
	import type { MarketMetricResult } from '$lib/zodios';

	type MetricCategory = z.infer<typeof MetricCategorySchema>;

	const symbolCategory: Record<string, MetricCategory> = {
		SP500: 'market',
		NDX100: 'market',
		HSI: 'market',
		VIX: 'risk',
		US10Y: 'rates'
	};

	function formatValue(symbol: string, value: number): string {
		if (symbol === 'US10Y') return `${value.toFixed(2)}%`;
		if (symbol === 'VIX') return value.toFixed(2);
		return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function apiToUiMetric(item: MarketMetricResult) {
		const sign = item.change_pct >= 0 ? '+' : '';
		return {
			id: item.symbol.toLowerCase(),
			label: item.name,
			value: formatValue(item.symbol, item.value),
			delta: `${sign}${item.change_pct.toFixed(1)}%`,
			deltaPositive: item.change_pct >= 0,
			category: (symbolCategory[item.symbol] ?? 'market') as MetricCategory
		};
	}

	// ── Usage tile derivations (from existing RxJS-backed state) ─────────────────
	// Derived using .items[] (pagedSchema shape) — not .data[].
	// No new BehaviorSubjects or Zodios endpoints are created; these read from
	// strategiesData$ and backtestRunsData$ via their Svelte $state sinks.

	/** Previous strategy count — used to compute delta between refreshes. */
	let _prevStrategyCount = 0;
	/** Previous queue size — used to compute delta between refreshes. */
	let _prevQueueCount = 0;

	function buildUsageTiles() {
		// Strategies Saved
		const strategyCount = strategyListState.data?.items.length ?? 0;
		const strategyDelta = strategyCount - _prevStrategyCount;
		_prevStrategyCount = strategyCount;

		// Backtest Queue = pending | running runs
		const allRuns = backtestRunState.list?.items ?? [];
		const queueCount = allRuns.filter((r) => r.status === 'pending' || r.status === 'running').length;
		const queueDelta = queueCount - _prevQueueCount;
		_prevQueueCount = queueCount;

		return [
			{
				id: 'saved_strats',
				label: 'Strategies Saved',
				value: String(strategyCount),
				delta: strategyDelta >= 0 ? `+${strategyDelta}` : String(strategyDelta),
				deltaPositive: strategyDelta >= 0,
				category: 'usage' as MetricCategory
			},
			{
				id: 'bt_queue',
				label: 'Backtest Queue',
				value: String(queueCount),
				delta: queueDelta >= 0 ? `+${queueDelta}` : String(queueDelta),
				deltaPositive: true, // neutral — queue size growing means more work, not a negative signal
				category: 'usage' as MetricCategory
			},
			{
				// Active Alerts: deferred — no endpoint available yet (see spec FR-013).
				// Rendered as a placeholder tile until the API team resolves Option A/B.
				id: 'alerts',
				label: 'Active Alerts',
				value: '--',
				delta: '',
				deltaPositive: true,
				category: 'usage' as MetricCategory
			}
		];
	}

	// In mock mode use the UI-formatted sample directly (all 8 tiles including usage).
	// In API mode: 5 market tiles from marketMetricState + 3 usage tiles derived inline.
	let state = $state<z.infer<typeof DashboardMetricGridSchema>>(
		DashboardMetricGridSchema.parse({})
	);

	$effect(() => {
		if (useMockData) {
			state.metrics = sampleMarketMetrics;
		} else {
			const marketItems = marketMetricState.data?.items ?? [];
			state.metrics = [...marketItems.map(apiToUiMetric), ...buildUsageTiles()];
		}
	});
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	{#if marketMetricState.loading}
		{#each { length: 5 } as _, i (i)}
			<div class="h-24 animate-pulse rounded-lg bg-muted" aria-hidden="true"></div>
		{/each}
	{:else if marketMetricState.error}
		<div class="col-span-full rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
			Failed to load market metrics — <button
				class="underline underline-offset-2"
				onclick={() => { import('$lib/rxjs/market-metrics.stream.js').then(m => m.refreshMarketMetrics()); }}
			>retry</button>
		</div>
	{:else if state.metrics.length === 0}
		<div class="col-span-full rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
			No market metrics available.
		</div>
	{:else}
		{#each state.metrics as tile (tile.id)}
			<MetricTile {tile} />
		{/each}
	{/if}
</div>
