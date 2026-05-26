<script lang="ts">
	import type { Snapshot } from '@sveltejs/kit';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import * as m from '$lib/paraglide/messages';
	import ScreenerResultRow from '$lib/components/molecules/ScreenerResultRow.svelte';
	import { sampleScreenerResults } from '$lib/shared-mockdata/market';
	import { goto } from '$app/navigation';
	import { appState } from '$lib/state/app.svelte';
	import { FundamentalScreenerSchema } from '$lib/schemas';

	let universe = $state('S&P 500');
	let peMax = $state('30');
	let roicMin = $state('15');
	let revGrowthMin = $state('10');

	export const snapshot: Snapshot = {
		capture: () => ({ universe, peMax, roicMin, revGrowthMin }),
		restore: (value: unknown) => {
			const result = FundamentalScreenerSchema.safeParse(value);
			if (result.success) {
				universe = result.data.universe;
				peMax = result.data.peMax;
				roicMin = result.data.roicMin;
				revGrowthMin = result.data.revGrowthMin;
			}
		}
	};

	function handleBacktest(symbol: string) {
		appState.backtestPrefillSymbol = symbol;
		goto('/backtest-engine');
	}
</script>

<div class="space-y-6 p-6">
	<h1 class="text-3xl font-bold tracking-tight">{m.fundamental_screener()}</h1>

	<!-- Filters -->
	<div class="grid items-end gap-4 rounded-xl border bg-card p-6 shadow-sm md:grid-cols-4">
		<div class="space-y-2">
			<Label>Universe</Label>
			<Select.Root type="single" bind:value={universe}>
				<Select.Trigger>{universe}</Select.Trigger>
				<Select.Content>
					<Select.Item value="S&P 500">S&P 500</Select.Item>
					<Select.Item value="Nasdaq 100">Nasdaq 100</Select.Item>
					<Select.Item value="Russell 2000">Russell 2000</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		<div class="space-y-2">
			<Label>PE Ratio ≤</Label>
			<Input bind:value={peMax} />
		</div>
		<div class="space-y-2">
			<Label>ROIC (%) ≥</Label>
			<Input bind:value={roicMin} />
		</div>
		<div class="space-y-2">
			<Label>Rev Growth (%) ≥</Label>
			<Input bind:value={revGrowthMin} />
		</div>
	</div>

	<!-- Results -->
	<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Symbol</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>P/E</Table.Head>
					<Table.Head>EV/EBITDA</Table.Head>
					<Table.Head>FCF Yield</Table.Head>
					<Table.Head>ROIC</Table.Head>
					<Table.Head>Rev Growth</Table.Head>
					<Table.Head>EPS Growth</Table.Head>
					<Table.Head>Score</Table.Head>
					<Table.Head>Action</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each sampleScreenerResults as result (result.symbol)}
					<ScreenerResultRow {result} onBacktest={handleBacktest} />
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
