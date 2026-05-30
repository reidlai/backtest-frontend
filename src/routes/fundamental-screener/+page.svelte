<script module lang="ts">
	export { snapshot } from '$lib/components/organisms/ScreenerFilterPanel.svelte';
</script>

<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import ScreenerFilterPanel from '$lib/components/organisms/ScreenerFilterPanel.svelte';
	import ScreenerResultTable from '$lib/components/organisms/ScreenerResultTable.svelte';
	import { goto } from '$app/navigation';
	import { appState } from '$lib/state/app.svelte';

	function handleBacktest(symbol: string) {
		appState.backtestPrefillSymbol = symbol;
		goto('/backtest-engine');
	}
</script>

<div class="space-y-6 p-6">
	<h1 class="text-3xl font-bold tracking-tight">{m.fundamental_screener()}</h1>

	<ScreenerFilterPanel />

	<ScreenerResultTable onBacktest={handleBacktest} />
</div>
