<script lang="ts">
	import { z } from 'zod';
	import { StrategyOutputPanelSchema } from '$lib/schemas';
	import { Chart, Spline, Tooltip, Axis } from 'layerchart';
	import { scaleTime } from 'd3';
	import * as Table from '$lib/components/ui/table';
	import { sampleTrades } from '$lib/shared-mockdata/trades';

	type Props = z.infer<typeof StrategyOutputPanelSchema>;

	let { result = null, isLoading = false, error = null }: Props = $props();

	const metrics = $derived(
		result
			? [
					{
						id: 'total-return',
						label: 'Total Return',
						value: `${(result.totalReturn * 100).toFixed(2)}%`
					},
					{ id: 'sharpe', label: 'Sharpe Ratio', value: result.sharpeRatio.toFixed(2) },
					{
						id: 'max-drawdown',
						label: 'Max Drawdown',
						value: `${(result.maxDrawdown * 100).toFixed(2)}%`
					},
					{ id: 'win-rate', label: 'Win Rate', value: `${(result.winRate * 100).toFixed(1)}%` },
					{ id: 'profit-factor', label: 'Profit Factor', value: result.profitFactor.toFixed(2) }
				]
			: []
	);
</script>

<div class="space-y-4">
	{#if isLoading}
		<!-- Loading state (T016) -->
		<div class="rounded-xl border bg-card p-6 shadow-sm">
			<div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
				{#each [1, 2, 3, 4, 5] as i (i)}
					<div class="h-20 animate-pulse rounded-lg bg-muted"></div>
				{/each}
			</div>
			<div class="mb-4 h-[300px] animate-pulse rounded-lg bg-muted"></div>
			<div class="space-y-2">
				{#each [1, 2, 3, 4] as i (i)}
					<div class="h-8 animate-pulse rounded bg-muted"></div>
				{/each}
			</div>
		</div>
	{:else if error}
		<!-- Error state (T017) -->
		<div class="rounded-xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
			<p class="text-sm font-medium text-destructive">Backtest Error</p>
			<p class="mt-1 text-sm text-destructive/80">{error}</p>
		</div>
	{:else if result}
		<!-- Result state (T018–T020) -->
		<div class="rounded-xl border bg-card p-6 shadow-sm">
			<!-- Performance metrics (T018) -->
			<h2 class="mb-4 text-xl font-semibold">Performance Metrics</h2>
			<div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
				{#each metrics as metric (metric.id)}
					<div class="rounded-lg border bg-muted/30 p-3 text-center">
						<p class="text-xs text-muted-foreground">{metric.label}</p>
						<p class="mt-1 text-lg font-semibold">{metric.value}</p>
					</div>
				{/each}
			</div>

			<!-- Equity curve chart (T019) -->
			<h3 class="mb-2 text-base font-semibold">Equity Curve</h3>
			<div class="mb-6 h-[280px] w-full">
				<Chart
					data={result.equityCurve}
					x="date"
					xScale={scaleTime()}
					y="value"
					yDomain={[0, null]}
					padding={{ left: 60, bottom: 40 }}
				>
					<Axis placement="bottom" grid />
					<Axis placement="left" grid />
					<Spline class="stroke-primary stroke-2" />
					<Tooltip.Root let:data>
						<Tooltip.Header>{data.date}</Tooltip.Header>
						<Tooltip.Item label="Equity" value="${data.value.toLocaleString()}" />
					</Tooltip.Root>
				</Chart>
			</div>

			<!-- Trade summary table (T020) — uses sampleTrades; BacktestResultSchema has no trades field -->
			<h3 class="mb-2 text-base font-semibold">Trade Summary</h3>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Symbol</Table.Head>
						<Table.Head>Direction</Table.Head>
						<Table.Head>Entry Date</Table.Head>
						<Table.Head>Exit Date</Table.Head>
						<Table.Head class="text-right">Net P&L</Table.Head>
						<Table.Head class="text-right">Return %</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each sampleTrades as trade (trade.tradeId)}
						<Table.Row>
							<Table.Cell class="font-medium">{trade.symbol}</Table.Cell>
							<Table.Cell>{trade.direction}</Table.Cell>
							<Table.Cell>{trade.entryDate}</Table.Cell>
							<Table.Cell>{trade.exitDate}</Table.Cell>
							<Table.Cell class="text-right">${trade.netPnl.toFixed(2)}</Table.Cell>
							<Table.Cell class="text-right">{trade.returnPct.toFixed(2)}%</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{:else}
		<!-- Empty state (T015) -->
		<div
			class="flex h-full min-h-[400px] items-center justify-center rounded-xl border border-dashed bg-muted/20 p-12"
		>
			<p class="text-center text-muted-foreground">
				Enter your strategy description and click <br />
				<span class="font-semibold text-foreground">"Run"</span> to see backtest results.
			</p>
		</div>
	{/if}
</div>
