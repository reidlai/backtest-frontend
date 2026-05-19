<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as m from '$lib/paraglide/messages';
	import { Chart, Spline, Tooltip, Axis } from 'layerchart';
	import { scaleTime } from 'd3';
	import MetricTile from '../molecules/MetricTile.svelte';
	import {
		defaultMetricTiles,
		sampleBacktestResult,
		sampleRegimeBreakdown,
		samplePerfSummary
	} from '$lib/data/performance';
	import { appState } from '$lib/state/app.svelte';
	import type { MetricTile as IMetricTile, ChartTab } from '$lib/types';

	let tiles = $state([...defaultMetricTiles]);
	let draggedIndex = $state<number | null>(null);
	let activeChartTab = $state<ChartTab>('equity-curve');

	// Edit Modal State
	let modalOpen = $state(false);
	let editingTileId = $state<string | null>(null);
	let editValue = $state('');

	const isValid = $derived(!isNaN(parseFloat(editValue)) && editValue.trim() !== '');

	// Drag handlers
	function handleDragStart(index: number) {
		draggedIndex = index;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(targetOrder: number) {
		if (draggedIndex === null) return;
		const fromIndex = tiles.findIndex((t) => t.order === draggedIndex);
		const toIndex = tiles.findIndex((t) => t.order === targetOrder);

		if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
			const newTiles = [...tiles];
			const [moved] = newTiles.splice(fromIndex, 1);
			newTiles.splice(toIndex, 0, moved);
			// Update orders
			tiles = newTiles.map((t, i) => ({ ...t, order: i }));
		}
		draggedIndex = null;
	}

	function handleDoubleClick(tile: IMetricTile) {
		editingTileId = tile.id;
		editValue = tile.value;
		modalOpen = true;
	}

	function handleApply() {
		if (!isValid) return;
		const index = tiles.findIndex((t) => t.id === editingTileId);
		if (index !== -1) {
			tiles[index] = { ...tiles[index], value: editValue };
		}
		modalOpen = false;
	}

	// Watch simulated metrics
	$effect(() => {
		const totalReturn = appState.simulatedMetrics.totalReturn;
		const maxDrawdown = appState.simulatedMetrics.maxDrawdown;
		const winRate = appState.simulatedMetrics.winRate;

		const trIndex = tiles.findIndex((t) => t.id === 'total-return');
		if (trIndex !== -1) tiles[trIndex].value = totalReturn;

		const mdIndex = tiles.findIndex((t) => t.id === 'max-drawdown');
		if (mdIndex !== -1) tiles[mdIndex].value = maxDrawdown;

		const wrIndex = tiles.findIndex((t) => t.id === 'win-rate');
		if (wrIndex !== -1) tiles[wrIndex].value = winRate;
	});
</script>

<div class="space-y-8 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">{m.performance_result()}</h1>
		<Button variant="outline" onclick={() => (appState.activeSection = 'backtest-engine')}>
			Run New Backtest
		</Button>
	</div>

	<!-- Metric Grid -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		{#each tiles as tile (tile.id)}
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

	<!-- Charts -->
	<div class="rounded-xl border bg-card p-6 shadow-sm">
		<Tabs.Root value={activeChartTab} onValueChange={(v) => (activeChartTab = v as ChartTab)}>
			<div class="mb-6 flex items-center justify-between">
				<Tabs.List>
					<Tabs.Trigger value="equity-curve">Equity Curve</Tabs.Trigger>
					<Tabs.Trigger value="drawdown">Drawdown</Tabs.Trigger>
					<Tabs.Trigger value="benchmark-overlay">Benchmark Overlay</Tabs.Trigger>
					<Tabs.Trigger value="monthly-heatmap">Monthly Heatmap</Tabs.Trigger>
				</Tabs.List>
			</div>

			<div class="h-[400px] w-full">
				{#if activeChartTab === 'equity-curve'}
					<Chart
						data={sampleBacktestResult.equityCurve}
						x="date"
						xScale={scaleTime()}
						y="value"
						yDomain={[0, null]}
						padding={{ left: 60, bottom: 40 }}
					>
						<Axis placement="bottom" grid />
						<Axis placement="left" grid />
						<Spline class="stroke-primary stroke-2" />
						<Tooltip.Root let:data>
							<Tooltip.Header>{data.date}</Tooltip.Header>
							<Tooltip.Item label="Equity" value="${data.value.toLocaleString()}" />
						</Tooltip.Root>
					</Chart>
				{:else}
					<div
						class="flex h-full items-center justify-center rounded border border-dashed text-muted-foreground"
					>
						Chart tab "{activeChartTab}" implementation placeholder
					</div>
				{/if}
			</div>
		</Tabs.Root>
	</div>

	<div class="grid gap-8 lg:grid-cols-2">
		<!-- Regime Breakdown -->
		<div class="space-y-4">
			<h2 class="text-xl font-semibold">Regime Breakdown</h2>
			<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Regime</Table.Head>
							<Table.Head>Return</Table.Head>
							<Table.Head>Max DD</Table.Head>
							<Table.Head>Win Rate</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each sampleRegimeBreakdown as row (row.regime)}
							<Table.Row>
								<Table.Cell class="font-medium">{row.regime}</Table.Cell>
								<Table.Cell class={row.returnPct > 0 ? 'text-green-400' : 'text-red-400'}>
									{row.returnPct}%
								</Table.Cell>
								<Table.Cell class="text-red-400">{row.maxDrawdown}%</Table.Cell>
								<Table.Cell>{row.winRate}%</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</div>

		<!-- Performance Summary -->
		<div class="space-y-4">
			<h2 class="text-xl font-semibold">Statistics Summary</h2>
			<div class="h-full rounded-xl border bg-card p-4 shadow-sm">
				<div class="grid grid-cols-2 gap-x-8 gap-y-2">
					{#each samplePerfSummary as stat (stat.label)}
						<div class="flex justify-between border-b border-muted py-1">
							<span class="text-sm text-muted-foreground">{stat.label}</span>
							<span class="text-sm font-semibold">{stat.value}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Edit Modal -->
<Dialog.Root bind:open={modalOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Metric Value</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="value">New Value</Label>
				<Input id="value" bind:value={editValue} class={!isValid ? 'border-destructive' : ''} />
				{#if !isValid && editValue !== ''}
					<p class="text-xs text-destructive">Please enter a valid numeric value.</p>
				{/if}
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (modalOpen = false)}>Cancel</Button>
			<Button disabled={!isValid} onclick={handleApply}>Apply</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
