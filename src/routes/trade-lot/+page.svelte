<script lang="ts">
	import TradeLotTable from '$lib/components/organisms/TradeLotTable.svelte';
	import * as m from '$lib/paraglide/messages';
	import { sampleTrades } from '$lib/shared-mockdata/trades';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';

	let trades = $state([...sampleTrades]);
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">{m.trade_log()}</h1>
		<Button variant="outline" onclick={() => goto('/backtest-engine')}>New Backtest</Button>
	</div>

	<TradeLotTable {trades} />
</div>
