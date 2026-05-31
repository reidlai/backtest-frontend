<script lang="ts">
	import type { Snapshot } from '@sveltejs/kit';
	import * as m from '$lib/paraglide/messages';
	import ScreenerIndicatorSelectionPanel from '$lib/components/organisms/ScreenerIndicatorSelectionPanel.svelte';
	import ScreenerChartPatternPanel from '$lib/components/organisms/ScreenerChartPatternPanel.svelte';
	import ScreenerPreviewPanel from '$lib/components/organisms/ScreenerPreviewPanel.svelte';
	import { TechnicalScreenerSchema } from '$lib/schemas';
	import { SvelteSet } from 'svelte/reactivity';

	// Mock data for chart preview — kept at page level so it can be passed to the organism
	const chartData = Array.from({ length: 60 }, (_, i) => ({
		date: new Date(2024, 0, i + 1),
		value: 100 + Math.random() * 20 + Math.sin(i / 5) * 10
	}));

	let selectedPatterns = new SvelteSet<string>();
	let trendIndicator = $state('EMA(200)');
	let momentumIndicator = $state('RSI(14)');

	export const snapshot: Snapshot = {
		capture: () => ({ selectedPatterns: [...selectedPatterns], trendIndicator, momentumIndicator }),
		restore: (value: unknown) => {
			const result = TechnicalScreenerSchema.safeParse(value);
			if (result.success) {
				selectedPatterns.clear();
				result.data.selectedPatterns.forEach((p) => selectedPatterns.add(p));
				trendIndicator = result.data.trendIndicator;
				momentumIndicator = result.data.momentumIndicator;
			}
		}
	};
</script>

<div class="space-y-6 p-6">
	<h1 class="text-3xl font-bold tracking-tight">{m.technical_screener()}</h1>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Left column: config -->
		<div class="space-y-6 lg:col-span-1">
			<ScreenerIndicatorSelectionPanel bind:trendIndicator bind:momentumIndicator />
			<ScreenerChartPatternPanel bind:selectedPatterns />
		</div>

		<!-- Right column: preview -->
		<div class="space-y-4 lg:col-span-2">
			<ScreenerPreviewPanel {chartData} />
		</div>
	</div>
</div>
