<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import { defaultMetricTiles } from '$lib/shared-mockdata/performance';
	import { goto } from '$app/navigation';
	import { appState } from '$lib/state/app.svelte';

	import PerformanceMetricGrid from '$lib/components/organisms/PerformanceMetricGrid.svelte';
	import PerformancdeChartTabs from '$lib/components/organisms/PerformancdeChartTabs.svelte';
	import RegimeBreakdownTable from '$lib/components/organisms/RegimeBreakdownTable.svelte';
	import PerformanceSummary from '$lib/components/organisms/PerformanceSummary.svelte';
	import EditMetricModal from '$lib/components/organisms/EditMetricModal.svelte';

	let tiles = $state([...defaultMetricTiles]);

	// Edit Modal State (owned by parent; internal form state is inside EditMetricModal)
	let modalOpen = $state(false);
	let editingTileId = $state<string | null>(null);

	const editingTileInitialValue = $derived(
		tiles.find((t) => t.id === editingTileId)?.value ?? ''
	);

	function handleApply(newValue: string) {
		const index = tiles.findIndex((t) => t.id === editingTileId);
		if (index !== -1) {
			tiles[index] = { ...tiles[index], value: newValue };
		}
		modalOpen = false;
	}

	// Watch simulated metrics
	$effect(() => {
		const totalReturn = appState.simulatedMetrics.totalReturn;
		const maxDrawdown = appState.simulatedMetrics.maxDrawdown;
		const winRate = appState.simulatedMetrics.winRate;

		const trIndex = tiles.findIndex((t) => t.id === 'total-return');
		if (trIndex !== -1) tiles[trIndex].value = String(totalReturn);

		const mdIndex = tiles.findIndex((t) => t.id === 'max-drawdown');
		if (mdIndex !== -1) tiles[mdIndex].value = String(maxDrawdown);

		const wrIndex = tiles.findIndex((t) => t.id === 'win-rate');
		if (wrIndex !== -1) tiles[wrIndex].value = String(winRate);
	});
</script>

<div class="space-y-8 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">{m.performance_result()}</h1>
		<Button variant="outline" onclick={() => goto('/backtest-engine')}>Run New Backtest</Button>
	</div>

	<PerformanceMetricGrid />

	<PerformancdeChartTabs />

	<div class="grid gap-8 lg:grid-cols-2">
		<RegimeBreakdownTable />

		<PerformanceSummary />
	</div>
</div>

<EditMetricModal
	open={modalOpen}
	tileId={editingTileId}
	initialValue={editingTileInitialValue}
	onApply={handleApply}
	onClose={() => (modalOpen = false)}
/>
