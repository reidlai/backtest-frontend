<script lang="ts">
	import type { PerformanceMetrics, EquityCurve, TradeRecord, SignalRecord } from '$lib/zodios';
	import { samplePerfSummary } from '$lib/shared-mockdata/performance';

	/* eslint-disable @typescript-eslint/no-unused-vars */
	let {
		performanceMetrics = null,
		equityCurve: _equityCurve = null,
		executionLog: _executionLog = null,
		signalHistory: _signalHistory = null
	}: {
		performanceMetrics?: PerformanceMetrics | null;
		equityCurve?: EquityCurve | null;
		executionLog?: TradeRecord[] | null;
		signalHistory?: SignalRecord[] | null;
	} = $props();
	/* eslint-enable @typescript-eslint/no-unused-vars */

	/**
	 * When performanceMetrics is provided via $props(), derive summary rows from it.
	 * Otherwise fall back to the internal samplePerfSummary mock.
	 */
	const stats = $derived(
		performanceMetrics
			? [
					{
						label: 'Total Return',
						value: `${(performanceMetrics.total_return_pct * 100).toFixed(2)}%`
					},
					{
						label: 'Annualised Return',
						value: `${(performanceMetrics.annualized_return_pct * 100).toFixed(2)}%`
					},
					{
						label: 'Max Drawdown',
						value: `${(performanceMetrics.max_drawdown_pct * 100).toFixed(2)}%`
					},
					{ label: 'Sharpe Ratio', value: performanceMetrics.sharpe_ratio.toFixed(2) },
					{ label: 'Sortino Ratio', value: performanceMetrics.sortino_ratio.toFixed(2) },
					{
						label: 'Win Rate',
						value: `${(performanceMetrics.win_rate * 100).toFixed(1)}%`
					},
					{ label: 'Profit Factor', value: performanceMetrics.profit_factor.toFixed(2) },
					{ label: 'Total Trades', value: String(performanceMetrics.total_trades) }
				]
			: samplePerfSummary
	);
</script>

<div class="space-y-4">
	<h2 class="text-xl font-semibold">Statistics Summary</h2>
	<div class="h-full rounded-xl border bg-card p-4 shadow-sm">
		{#if stats.length === 0}
			<p class="text-sm text-muted-foreground">No statistics available</p>
		{:else}
			<div class="grid grid-cols-2 gap-x-8 gap-y-2">
				{#each stats as stat (stat.label)}
					<div class="flex justify-between border-b border-muted py-1">
						<span class="text-sm text-muted-foreground">{stat.label}</span>
						<span class="text-sm font-semibold">{stat.value}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
