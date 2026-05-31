<script lang="ts">
	import { z } from 'zod';
	import RegimeCard from '$lib/components/molecules/RegimeCard.svelte';
	import { RegimeCardsGridSchema } from '$lib/schemas';

	let { regimes = [] }: z.infer<typeof RegimeCardsGridSchema> = $props();
</script>

{#if regimes.length === 0}
	<p class="text-sm text-muted-foreground">No regime data available</p>
{:else}
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each regimes as regime (regime.id)}
			<RegimeCard {regime} />
		{/each}
	</div>
{/if}
