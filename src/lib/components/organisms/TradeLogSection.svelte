<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as m from '$lib/paraglide/messages';
	import { sampleTrades } from '$lib/data/trades';
	import { appState } from '$lib/state/app.svelte';

	let trades = $state([...sampleTrades]);
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">{m.trade_log()}</h1>
		<Button variant="outline" onclick={() => (appState.activeSection = 'backtest-engine')}>
			New Backtest
		</Button>
	</div>

	<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
		{#if trades.length > 0}
			<div class="overflow-x-auto">
				<Table.Root class="min-w-[1200px]">
					<Table.Header>
						<Table.Row>
							<Table.Head>Trade ID</Table.Head>
							<Table.Head>Symbol</Table.Head>
							<Table.Head>L/S</Table.Head>
							<Table.Head>Entry Date</Table.Head>
							<Table.Head>Entry Price</Table.Head>
							<Table.Head>Exit Date</Table.Head>
							<Table.Head>Exit Price</Table.Head>
							<Table.Head>Qty</Table.Head>
							<Table.Head>Comm.</Table.Head>
							<Table.Head>Slip.</Table.Head>
							<Table.Head>Net PnL</Table.Head>
							<Table.Head>Return %</Table.Head>
							<Table.Head>Days</Table.Head>
							<Table.Head>Exit Reason</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each trades as trade (trade.tradeId)}
							<Table.Row>
								<Table.Cell class="font-mono text-xs">{trade.tradeId}</Table.Cell>
								<Table.Cell class="font-bold">{trade.symbol}</Table.Cell>
								<Table.Cell>
									<span class={trade.direction === 'Long' ? 'text-blue-400' : 'text-orange-400'}>
										{trade.direction}
									</span>
								</Table.Cell>
								<Table.Cell>{trade.entryDate}</Table.Cell>
								<Table.Cell>${trade.entryPrice}</Table.Cell>
								<Table.Cell>{trade.exitDate}</Table.Cell>
								<Table.Cell>${trade.exitPrice}</Table.Cell>
								<Table.Cell>{trade.quantity}</Table.Cell>
								<Table.Cell>${trade.commission}</Table.Cell>
								<Table.Cell>${trade.slippage}</Table.Cell>
								<Table.Cell
									class={trade.netPnl > 0 ? 'font-semibold text-green-400' : 'text-red-400'}
								>
									${trade.netPnl.toLocaleString()}
								</Table.Cell>
								<Table.Cell class={trade.returnPct > 0 ? 'text-green-400' : 'text-red-400'}>
									{trade.returnPct}%
								</Table.Cell>
								<Table.Cell>{trade.holdingDays}</Table.Cell>
								<Table.Cell class="text-xs text-muted-foreground">{trade.exitReason}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{:else}
			<div class="m-4 space-y-4 rounded-lg border-2 border-dashed bg-muted/20 p-12 text-center">
				<p class="font-medium text-muted-foreground">No trade records yet.</p>
				<Button size="sm" onclick={() => (appState.activeSection = 'backtest-engine')}>
					Go to Backtest Engine
				</Button>
			</div>
		{/if}
	</div>
</div>
