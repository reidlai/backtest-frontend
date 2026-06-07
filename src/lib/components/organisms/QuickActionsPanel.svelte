<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { strategyState } from '$lib/state/strategy.svelte';
	import { universeCapitalConfigState } from '$lib/state/universe-capital-config.svelte';
	import { scheduleExecutionConfigState } from '$lib/state/schedule-execution-config.svelte';
	import { orderTypesConfigState } from '$lib/state/order-types-config';
	import { sampleTrades, tradesToCsv } from '$lib/shared-mockdata/trades';

	function handleNewStrategy() {
		strategyState.reset();
		goto('/strategy-builder');
		toast.success('Strategy Builder reset');
	}

	function handleNewBacktest() {
		universeCapitalConfigState.reset();
		scheduleExecutionConfigState.reset();
		orderTypesConfigState.reset();
		goto('/backtest-engine');
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
			onclick={() => goto('/performance-result')}>Report</Button
		>
		<Button
			variant="outline"
			size="sm"
			class="h-7 text-[9px] font-bold uppercase"
			onclick={handleExportCSV}>Export CSV</Button
		>
	</div>
</div>
