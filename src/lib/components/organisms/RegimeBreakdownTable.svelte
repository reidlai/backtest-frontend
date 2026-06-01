<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { RegimeBreakdownSchema } from '$lib/schemas/regime-breakdown.schema';
	import { sampleRegimeBreakdown } from '$lib/shared-mockdata/performance';

	const rows = $state(sampleRegimeBreakdown.filter((row) => RegimeBreakdownSchema.safeParse(row).success));
</script>

<div class="space-y-4">
	<h2 class="text-xl font-semibold">Regime Breakdown</h2>
	<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Regime</Table.Head>
					<Table.Head>Return</Table.Head>
					<Table.Head>Max DD</Table.Head>
					<Table.Head>Win Rate</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if rows.length === 0}
					<Table.Row>
						<Table.Cell colspan={4} class="text-center text-muted-foreground">No data available</Table.Cell>
					</Table.Row>
				{:else}
					{#each rows as row (row.regime)}
						<Table.Row>
							<Table.Cell class="font-medium">{row.regime}</Table.Cell>
							<Table.Cell class={row.returnPct > 0 ? 'text-green-400' : 'text-red-400'}>
								{row.returnPct}%
							</Table.Cell>
							<Table.Cell class="text-red-400">{row.maxDrawdown}%</Table.Cell>
							<Table.Cell>{row.winRate}%</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>
