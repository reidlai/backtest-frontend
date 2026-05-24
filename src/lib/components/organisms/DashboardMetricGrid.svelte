<script lang="ts">
	import MetricTile from '../molecules/MetricTile.svelte';
	import { sampleMarketMetrics } from '$lib/data/market';
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	{#each sampleMarketMetrics as tile (tile.id)}
		<MetricTile {tile} />
	{/each}
</div>
