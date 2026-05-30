<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { toast } from 'svelte-sonner';
	import { appState } from '$lib/state/app.svelte';
	import { universeCapitalConfigState } from '$lib/state/universe-capital-config.svelte';
	import UniverseCapitalConfig from '$lib/components/organisms/UniverseCapitalConfig.svelte';
	import ScheduleExecutionConfig from '$lib/components/organisms/ScheduleExecutionConfig.svelte';
	import OrderTypesConfig from '$lib/components/organisms/OrderTypesConfig.svelte';

	$effect(() => {
		if (appState.backtestPrefillSymbol) {
			universeCapitalConfigState.universe = appState.backtestPrefillSymbol;
		}
	});

	function handleRun() {
		toast.info('Backtest queued and processing...');
	}
</script>

<div class="space-y-6 p-6">
	<h1 class="text-3xl font-bold tracking-tight">{m.backtest_engine()}</h1>

	<div class="grid gap-6 lg:grid-cols-3">
		<UniverseCapitalConfig />
		<ScheduleExecutionConfig />
		<OrderTypesConfig onRun={handleRun} />
	</div>
</div>
