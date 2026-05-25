<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as m from '$lib/paraglide/messages';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import { appState } from '$lib/state/app.svelte';
	import { backtestState } from '$lib/state/backtest.svelte';
	import { OrderTypeSchema } from '$lib/schemas';

	type OrderType = z.infer<typeof OrderTypeSchema>;

	const orderTypes: OrderType[] = [
		'Market',
		'Limit',
		'Stop',
		'Stop-Limit',
		'Trailing Stop',
		'Bracket',
		'OCO',
		'Short Sell'
	];

	$effect(() => {
		if (appState.backtestPrefillSymbol) {
			backtestState.universe = appState.backtestPrefillSymbol;
		}
	});

	function handleRun() {
		toast.info('Backtest queued and processing...');
	}
</script>

<div class="space-y-6 p-6">
	<h1 class="text-3xl font-bold tracking-tight">{m.backtest_engine()}</h1>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Config Column 1 -->
		<div class="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
			<h2 class="text-lg font-semibold">Universe & Capital</h2>
			<div class="space-y-2">
				<Label>Backtest Mode</Label>
				<Select.Root type="single" bind:value={backtestState.mode}>
					<Select.Trigger>{backtestState.mode}</Select.Trigger>
					<Select.Content>
						<Select.Item value="Single Stock">Single Stock</Select.Item>
						<Select.Item value="Watchlist">Watchlist</Select.Item>
						<Select.Item value="Screener Result">Screener Result</Select.Item>
						<Select.Item value="Index Universe">Index Universe</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-2">
				<Label>Universe / Symbol</Label>
				<Input bind:value={backtestState.universe} />
			</div>
			<div class="space-y-2">
				<Label>Initial Capital ($)</Label>
				<Input bind:value={backtestState.initialCapital} />
			</div>
		</div>

		<!-- Config Column 2 -->
		<div class="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
			<h2 class="text-lg font-semibold">Schedule & Execution</h2>
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Start Date</Label>
					<Input type="date" bind:value={backtestState.startDate} />
				</div>
				<div class="space-y-2">
					<Label>End Date</Label>
					<Input type="date" bind:value={backtestState.endDate} />
				</div>
			</div>
			<div class="space-y-2">
				<Label>Timeframe</Label>
				<Select.Root type="single" bind:value={backtestState.timeframe}>
					<Select.Trigger>{backtestState.timeframe}</Select.Trigger>
					<Select.Content>
						<Select.Item value="Minute">Minute</Select.Item>
						<Select.Item value="Hourly">Hourly</Select.Item>
						<Select.Item value="Daily">Daily</Select.Item>
						<Select.Item value="Weekly">Weekly</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-2">
				<Label>Direction</Label>
				<Select.Root type="single" bind:value={backtestState.direction}>
					<Select.Trigger>{backtestState.direction}</Select.Trigger>
					<Select.Content>
						<Select.Item value="Long">Long Only</Select.Item>
						<Select.Item value="Short">Short Only</Select.Item>
						<Select.Item value="Both">Long & Short</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<!-- Config Column 3 -->
		<div class="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
			<h2 class="text-lg font-semibold">Order Types</h2>
			<div class="grid grid-cols-2 gap-y-3">
				{#each orderTypes as type (type)}
					<div class="flex items-center space-x-2">
						<input
							type="checkbox"
							id={type}
							checked={backtestState.selectedOrderTypes.has(type)}
							onchange={(e) => {
								if ((e.target as HTMLInputElement).checked)
									backtestState.selectedOrderTypes.add(type);
								else backtestState.selectedOrderTypes.delete(type);
							}}
							class="h-4 w-4 cursor-pointer rounded border border-input accent-primary"
						/>
						<Label for={type} class="cursor-pointer text-sm font-normal">{type}</Label>
					</div>
				{/each}
			</div>
			<div class="pt-4">
				<Button class="w-full" onclick={handleRun}>Run Backtest</Button>
			</div>
		</div>
	</div>
</div>
