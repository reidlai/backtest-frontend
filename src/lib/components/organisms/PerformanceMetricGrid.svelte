<script lang="ts">
	import { z } from 'zod';
	import type { PerformanceMetrics } from '$lib/zodios';
	import MetricTile from '../molecules/MetricTile.svelte';
	import { defaultMetricTiles } from '$lib/shared-mockdata/performance';
	import { PerformanceMetricGridSchema, MetricTileSchema } from '$lib/schemas';

	type MetricTileType = z.infer<typeof MetricTileSchema>;

	let { performanceMetrics = null }: { performanceMetrics?: PerformanceMetrics | null } = $props();

	let state = $state<z.infer<typeof PerformanceMetricGridSchema>>(
		PerformanceMetricGridSchema.parse({})
	);

	// When performanceMetrics prop is provided, derive tiles from it.
	// Otherwise fall back to the internal defaultMetricTiles mock.
	const derivedTiles = $derived(
		performanceMetrics
			? [
					{
						id: 'total-return',
						label: 'Total Return',
						value: `${(performanceMetrics.total_return_pct * 100).toFixed(2)}`,
						unit: '%',
						order: 0
					},
					{
						id: 'annualized-return',
						label: 'Ann. Return',
						value: `${(performanceMetrics.annualized_return_pct * 100).toFixed(2)}`,
						unit: '%',
						order: 1
					},
					{
						id: 'max-drawdown',
						label: 'Max Drawdown',
						value: `${(performanceMetrics.max_drawdown_pct * 100).toFixed(2)}`,
						unit: '%',
						order: 2
					},
					{
						id: 'sharpe-ratio',
						label: 'Sharpe Ratio',
						value: performanceMetrics.sharpe_ratio.toFixed(2),
						unit: '',
						order: 3
					},
					{
						id: 'win-rate',
						label: 'Win Rate',
						value: `${(performanceMetrics.win_rate * 100).toFixed(1)}`,
						unit: '%',
						order: 4
					},
					{
						id: 'profit-factor',
						label: 'Profit Factor',
						value: performanceMetrics.profit_factor.toFixed(2),
						unit: 'x',
						order: 5
					},
					{
						id: 'sortino-ratio',
						label: 'Sortino Ratio',
						value: performanceMetrics.sortino_ratio.toFixed(2),
						unit: '',
						order: 6
					},
					{
						id: 'total-trades',
						label: 'Total Trades',
						value: String(performanceMetrics.total_trades),
						unit: '',
						order: 7
					}
				]
			: defaultMetricTiles
	);

	// Sync derived tiles into mutable state for drag-and-drop
	$effect(() => {
		state.tiles = [...derivedTiles];
	});

	function handleDragStart(index: number) {
		state.draggedIndex = index;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(targetOrder: number) {
		if (state.draggedIndex === null) return;
		const fromIndex = state.tiles.findIndex((t) => t.order === state.draggedIndex);
		const toIndex = state.tiles.findIndex((t) => t.order === targetOrder);

		if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
			const newTiles = [...state.tiles];
			const [moved] = newTiles.splice(fromIndex, 1);
			newTiles.splice(toIndex, 0, moved);
			state.tiles = newTiles.map((t, i) => ({ ...t, order: i }));
		}
		state.draggedIndex = null;
	}

	function handleDoubleClick(tile: MetricTileType) {
		state.editingTileId = tile.id;
		state.editValue = tile.value;
		state.modalOpen = true;
	}
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	{#each state.tiles as tile (tile.id)}
		<MetricTile
			{tile}
			draggable={true}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			onDoubleClick={handleDoubleClick}
		/>
	{/each}
</div>
