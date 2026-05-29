<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import ScreenerResultRow from '$lib/components/molecules/ScreenerResultRow.svelte';
	import { sampleScreenerResults } from '$lib/shared-mockdata/market';

	let { onBacktest }: { onBacktest: (symbol: string) => void } = $props();
</script>

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
				<ScreenerResultRow {result} {onBacktest} />
			{/each}
		</Table.Body>
	</Table.Root>
</div>
