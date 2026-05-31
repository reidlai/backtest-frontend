<script lang="ts">
	import { Chart, Spline, Tooltip, Axis } from 'layerchart';
	import { scaleTime } from 'd3';
	import * as m from '$lib/paraglide/messages';

	interface ChartPoint {
		date: Date;
		value: number;
	}

	interface Props {
		ticker?: string;
		chartData?: ChartPoint[];
	}

	let { ticker = 'AAPL', chartData = [] }: Props = $props();
</script>

<div
	class="flex h-full flex-col rounded-xl border bg-card p-6 shadow-sm"
	aria-label={m.screener_pattern_preview()}
>
	<h2 class="mb-4 text-lg font-semibold">{m.screener_pattern_preview()} ({ticker})</h2>
	<div class="h-[400px]">
		{#if chartData.length === 0}
			<div class="flex h-full items-center justify-center">
				<p class="text-sm text-muted-foreground">No chart data available.</p>
			</div>
		{:else}
			<Chart
				data={chartData}
				x="date"
				xScale={scaleTime()}
				y="value"
				padding={{ left: 40, bottom: 40 }}
			>
				<Axis placement="bottom" grid />
				<Axis placement="left" grid />
				<Spline class="stroke-primary stroke-2" />
				<Tooltip.Root let:data>
					<Tooltip.Header>{(data as ChartPoint).date.toLocaleDateString()}</Tooltip.Header>
					<Tooltip.Item label="Price" value={(data as ChartPoint).value.toFixed(2)} />
				</Tooltip.Root>
			</Chart>
		{/if}
	</div>
</div>
