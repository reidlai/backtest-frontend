<script lang="ts">
	import { z } from 'zod';
	import MetricTile from '../molecules/MetricTile.svelte';
	import { sampleMarketMetrics } from '$lib/shared-mockdata/market';
	import { DashboardMetricGridSchema, MetricCategorySchema } from '$lib/schemas';
	import { useMockData } from '$lib/env.js';
	import { marketMetricState } from '$lib/state/market-metric.svelte.js';
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

	// In mock mode use the UI-formatted sample directly (all 8 tiles including usage).
	// In API mode derive the 5 market tiles from the RxJS-backed state.
	let state = $state<z.infer<typeof DashboardMetricGridSchema>>(
		DashboardMetricGridSchema.parse({})
	);

	$effect(() => {
		if (useMockData) {
			state.metrics = sampleMarketMetrics;
		} else {
			const items = marketMetricState.data?.items ?? [];
			state.metrics = items.map(apiToUiMetric);
		}
	});
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	{#each state.metrics as tile (tile.id)}
		<MetricTile {tile} />
	{/each}
</div>
