<script lang="ts">
	import { z } from 'zod';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Chart, Spline, Tooltip, Axis } from 'layerchart';
	import { sampleBacktestResult } from '$lib/shared-mockdata/performance';
	import { scaleTime } from 'd3';
	import { PerformanceChartTabsSchema } from '$lib/schemas';
	import type { PerformanceMetrics, EquityCurve, TradeRecord, SignalRecord } from '$lib/zodios';

	/* eslint-disable @typescript-eslint/no-unused-vars */
	let {
		performanceMetrics: _performanceMetrics = null,
		equityCurve = null,
		executionLog: _executionLog = null,
		signalHistory: _signalHistory = null
	}: {
		performanceMetrics?: PerformanceMetrics | null;
		equityCurve?: EquityCurve | null;
		executionLog?: TradeRecord[] | null;
		signalHistory?: SignalRecord[] | null;
	} = $props();
	/* eslint-enable @typescript-eslint/no-unused-vars */

	let state = $state<z.infer<typeof PerformanceChartTabsSchema>>(
		PerformanceChartTabsSchema.parse({})
	);

	// Use equityCurve prop if provided; fall back to sampleBacktestResult.equity_curve
	const activeEquityCurve = $derived(equityCurve ?? sampleBacktestResult.equity_curve);

	// Convert OpenAPI equity_curve arrays to { date, value }[] for layerchart
	const equityCurveData = $derived(
		(activeEquityCurve.timestamps ?? []).map((ts: string, i: number) => ({
			date: new Date(ts),
			value: activeEquityCurve.equity_values[i] ?? 0
		}))
	);
</script>

<div class="rounded-xl border bg-card p-6 shadow-sm">
	<Tabs.Root
		value={state.activeChartTab}
		onValueChange={(v) => (state.activeChartTab = v as typeof state.activeChartTab)}
	>
		<div class="mb-6 flex items-center justify-between">
			<Tabs.List>
				<Tabs.Trigger value="equity-curve">Equity Curve</Tabs.Trigger>
				<Tabs.Trigger value="drawdown">Drawdown</Tabs.Trigger>
				<Tabs.Trigger value="benchmark-overlay">Benchmark Overlay</Tabs.Trigger>
				<Tabs.Trigger value="monthly-heatmap">Monthly Heatmap</Tabs.Trigger>
			</Tabs.List>
		</div>

		<div class="h-[400px] w-full">
			{#if state.activeChartTab === 'equity-curve'}
				<Chart
					data={equityCurveData}
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
			{:else}
				<div
					class="flex h-full items-center justify-center rounded border border-dashed text-muted-foreground"
				>
					Chart tab "{state.activeChartTab}" implementation placeholder
				</div>
			{/if}
		</div>
	</Tabs.Root>
</div>
