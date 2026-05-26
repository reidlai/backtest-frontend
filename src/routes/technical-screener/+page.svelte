<script lang="ts">
	import type { Snapshot } from '@sveltejs/kit';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import * as m from '$lib/paraglide/messages';
	import { Chart, Spline, Tooltip, Axis } from 'layerchart';
	import { scaleTime } from 'd3';
	import { TechnicalScreenerSchema } from '$lib/schemas';

	// Mock data for chart preview
	const chartData = Array.from({ length: 60 }, (_, i) => ({
		date: new Date(2024, 0, i + 1),
		value: 100 + Math.random() * 20 + Math.sin(i / 5) * 10
	}));

	let selectedPatterns = $state(new Set<string>());
	let trendIndicator = $state('EMA(200)');
	let momentumIndicator = $state('RSI(14)');

	const patterns = [
		'Head & Shoulders',
		'Double Top',
		'Bull Flag',
		'Cup & Handle',
		'Triangle',
		'Wedge',
		'MACD Cross',
		'RSI Oversold'
	];

	export const snapshot: Snapshot = {
		capture: () => ({ selectedPatterns: [...selectedPatterns], trendIndicator, momentumIndicator }),
		restore: (value: unknown) => {
			const result = TechnicalScreenerSchema.safeParse(value);
			if (result.success) {
				selectedPatterns = new Set(result.data.selectedPatterns);
				trendIndicator = result.data.trendIndicator;
				momentumIndicator = result.data.momentumIndicator;
			}
		}
	};

	function togglePattern(pattern: string) {
		if (selectedPatterns.has(pattern)) selectedPatterns.delete(pattern);
		else selectedPatterns.add(pattern);
	}
</script>

<div class="space-y-6 p-6">
	<h1 class="text-3xl font-bold tracking-tight">{m.technical_screener()}</h1>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Config -->
		<div class="space-y-6 lg:col-span-1">
			<div class="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
				<h2 class="text-lg font-semibold">Indicator Selection</h2>
				<div class="space-y-4">
					<div class="space-y-2">
						<label class="text-sm font-medium">Trend</label>
						<Select.Root type="single" bind:value={trendIndicator}>
							<Select.Trigger>{trendIndicator}</Select.Trigger>
							<Select.Content>
								<Select.Item value="EMA(50)">EMA(50)</Select.Item>
								<Select.Item value="EMA(200)">EMA(200)</Select.Item>
								<Select.Item value="Supertrend">Supertrend</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<div class="space-y-2">
						<label class="text-sm font-medium">Momentum</label>
						<Select.Root type="single" bind:value={momentumIndicator}>
							<Select.Trigger>{momentumIndicator}</Select.Trigger>
							<Select.Content>
								<Select.Item value="RSI(14)">RSI(14)</Select.Item>
								<Select.Item value="Stochastic">Stochastic</Select.Item>
								<Select.Item value="MACD">MACD</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				</div>
			</div>

			<div class="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
				<h2 class="text-lg font-semibold">Chart Patterns</h2>
				<div class="flex flex-wrap gap-2">
					{#each patterns as pattern (pattern)}
						<Button
							variant={selectedPatterns.has(pattern) ? 'default' : 'outline'}
							size="sm"
							class="h-7 text-[10px] font-bold uppercase"
							onclick={() => togglePattern(pattern)}
						>
							{pattern}
						</Button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Preview -->
		<div class="space-y-4 lg:col-span-2">
			<div class="flex h-full flex-col rounded-xl border bg-card p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold">Pattern Preview (AAPL)</h2>
				<div class="min-h-[400px] flex-1">
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
							<Tooltip.Header>{data.date.toLocaleDateString()}</Tooltip.Header>
							<Tooltip.Item label="Price" value={data.value.toFixed(2)} />
						</Tooltip.Root>
					</Chart>
				</div>
			</div>
		</div>
	</div>
</div>
