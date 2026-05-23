<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import { Chart, Spline, Tooltip, Axis } from 'layerchart';
	import {
		sampleBacktestResult,
	} from '$lib/data/performance';
	import type { ChartTab } from '$lib/types';
	import { scaleTime } from 'd3';
  
  let activeChartTab = $state<ChartTab>('equity-curve');
</script>
<div class="rounded-xl border bg-card p-6 shadow-sm">
  <Tabs.Root value={activeChartTab} onValueChange={(v) => (activeChartTab = v as ChartTab)}>
    <div class="mb-6 flex items-center justify-between">
      <Tabs.List>
        <Tabs.Trigger value="equity-curve">Equity Curve</Tabs.Trigger>
        <Tabs.Trigger value="drawdown">Drawdown</Tabs.Trigger>
        <Tabs.Trigger value="benchmark-overlay">Benchmark Overlay</Tabs.Trigger>
        <Tabs.Trigger value="monthly-heatmap">Monthly Heatmap</Tabs.Trigger>
      </Tabs.List>
    </div>

    <div class="h-[400px] w-full">
      {#if activeChartTab === 'equity-curve'}
        <Chart
          data={sampleBacktestResult.equityCurve}
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
          Chart tab "{activeChartTab}" implementation placeholder
        </div>
      {/if}
    </div>
  </Tabs.Root>
</div>