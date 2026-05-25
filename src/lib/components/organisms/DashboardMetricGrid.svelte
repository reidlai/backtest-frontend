<script lang="ts">
	import { z } from 'zod';
	import MetricTile from '../molecules/MetricTile.svelte';
	import { sampleMarketMetrics } from '$lib/shared-mockdata/market';
	import { DashboardMetricGridSchema } from '$lib/schemas';

	let state = $state<z.infer<typeof DashboardMetricGridSchema>>(
		DashboardMetricGridSchema.parse({})
	);
	state.metrics = sampleMarketMetrics;
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	{#each state.metrics as tile (tile.id)}
		<MetricTile {tile} />
	{/each}
</div>
