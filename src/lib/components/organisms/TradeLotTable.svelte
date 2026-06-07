<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { TradeRecordSchema } from '$lib/schemas';
	import { goto } from '$app/navigation';
	import type { z } from 'zod';

	type TradeRecord = z.infer<typeof TradeRecordSchema>;

	let { trades }: { trades: unknown[] } = $props();

	const validatedTrades = $derived(
		trades.flatMap((e) => {
			const result = TradeRecordSchema.safeParse(e);
			if (!result.success) {
				console.warn('[TradeLotTable] Invalid trade excluded:', result.error.issues, e);
				return [];
			}
			return [result.data as TradeRecord];
		})
	);
</script>

<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
	{#if validatedTrades.length > 0}
		<div class="overflow-x-auto">
			<Table.Root class="min-w-[1000px]">
				<Table.Header>
					<Table.Row>
						<Table.Head>Trade ID</Table.Head>
						<Table.Head>Symbol</Table.Head>
						<Table.Head>Side</Table.Head>
						<Table.Head>Entry Time</Table.Head>
						<Table.Head>Entry Price</Table.Head>
						<Table.Head>Exit Time</Table.Head>
						<Table.Head>Exit Price</Table.Head>
						<Table.Head>Qty</Table.Head>
						<Table.Head>PnL ($)</Table.Head>
						<Table.Head>Return %</Table.Head>
						<Table.Head>Exit Reason</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each validatedTrades as trade (trade.trade_id)}
						<Table.Row>
							<Table.Cell class="font-mono text-xs">{trade.trade_id}</Table.Cell>
							<Table.Cell class="font-bold">{trade.symbol}</Table.Cell>
							<Table.Cell>
								<span class={trade.side === 'LONG' ? 'text-blue-400' : 'text-orange-400'}>
									{trade.side}
								</span>
							</Table.Cell>
							<Table.Cell>{trade.entry_timestamp}</Table.Cell>
							<Table.Cell>${trade.entry_price}</Table.Cell>
							<Table.Cell>{trade.exit_timestamp}</Table.Cell>
							<Table.Cell>${trade.exit_price}</Table.Cell>
							<Table.Cell>{trade.quantity}</Table.Cell>
							<Table.Cell
								class={trade.pnl_absolute > 0 ? 'font-semibold text-green-400' : 'text-red-400'}
							>
								${trade.pnl_absolute.toLocaleString()}
							</Table.Cell>
							<Table.Cell class={trade.pnl_pct > 0 ? 'text-green-400' : 'text-red-400'}>
								{trade.pnl_pct}%
							</Table.Cell>
							<Table.Cell class="text-xs text-muted-foreground"
								>{trade.exit_reason ?? '—'}</Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{:else}
		<div class="m-4 space-y-4 rounded-lg border-2 border-dashed bg-muted/20 p-12 text-center">
			<p class="font-medium text-muted-foreground">No trade records yet.</p>
			<Button size="sm" onclick={() => goto('/backtest-engine')}>Go to Backtest Engine</Button>
		</div>
	{/if}
</div>
