<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { getContext } from 'svelte';
	import { appState } from '$lib/state/app.svelte';
	import { sampleTrades, tradesToCsv } from '$lib/data/trades';

	interface OrganismRefs {
		strategyBuilder?: { reset?: () => void };
		backtest?: { reset?: () => void };
	}

	const organismRefs = getContext<OrganismRefs>('organism-refs');

	function handleNewStrategy() {
		organismRefs?.strategyBuilder?.reset?.();
		appState.activeSection = 'strategy-builder';
		toast.success('Strategy Builder reset');
	}

	function handleNewBacktest() {
		organismRefs?.backtest?.reset?.();
		appState.activeSection = 'backtest-engine';
		toast.success('Backtest parameters reset');
	}

	function handleExportCSV() {
		const csv = tradesToCsv(sampleTrades);
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'trade-log.csv';
		a.click();
		URL.revokeObjectURL(url);
		toast.success('CSV Exported');
	}
</script>

<div class="rounded-xl border bg-card/50 p-4 shadow-sm">
	<h3 class="mb-3 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
		Quick Actions
	</h3>
	<div class="grid grid-cols-2 gap-2">
		<Button
			variant="outline"
			size="sm"
			class="h-7 text-[9px] font-bold uppercase"
			onclick={handleNewStrategy}>New Strategy</Button
		>
		<Button
			variant="outline"
			size="sm"
			class="h-7 text-[9px] font-bold uppercase"
			onclick={handleNewBacktest}>New Backtest</Button
		>
		<Button
			variant="outline"
			size="sm"
			class="h-7 text-[9px] font-bold uppercase"
			onclick={() => (appState.activeSection = 'performance-result')}>Report</Button
		>
		<Button
			variant="outline"
			size="sm"
			class="h-7 text-[9px] font-bold uppercase"
			onclick={handleExportCSV}>Export CSV</Button
		>
	</div>
</div>
