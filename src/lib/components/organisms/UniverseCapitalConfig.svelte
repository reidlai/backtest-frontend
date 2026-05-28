<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { universeCapitalConfigState } from '$lib/state/universe-capital-config.svelte';
</script>

<div class="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
	<h2 class="text-lg font-semibold">Universe & Capital</h2>
	<div class="space-y-2">
		<Label>Backtest Mode</Label>
		<Select.Root type="single" bind:value={universeCapitalConfigState.mode}>
			<Select.Trigger>{universeCapitalConfigState.mode}</Select.Trigger>
			<Select.Content>
				<Select.Item value="Single Stock">Single Stock</Select.Item>
				<Select.Item value="Watchlist">Watchlist</Select.Item>
				<Select.Item value="Screener Result">Screener Result</Select.Item>
				<Select.Item value="Index Universe">Index Universe</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>
	<div class="space-y-2">
		<Label for="universe-symbol">Universe / Symbol</Label>
		<Input id="universe-symbol" bind:value={universeCapitalConfigState.universe} />
	</div>
	<div class="space-y-2">
		<Label for="initial-capital">Initial Capital ($)</Label>
		<Input id="initial-capital" bind:value={universeCapitalConfigState.initialCapital} />
	</div>
</div>
