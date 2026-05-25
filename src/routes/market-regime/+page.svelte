<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import RegimeCard from '$lib/components/molecules/RegimeCard.svelte';
	import { sampleMarketRegimes } from '$lib/shared-mockdata/market';

	const aiSummary =
		'The current market is characterized by a strong Bull Trend in major US indices, supported by low volatility and positive momentum. However, High Volatility warnings are present in Asian markets due to regional economic shifts. Risk-On sentiment remains dominant as capital continues to flow into technology and growth sectors.';
</script>

<div class="space-y-6 p-6">
	<h1 class="text-3xl font-bold tracking-tight">{m.market_regime()}</h1>

	<div class="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
		<div class="mb-4 flex items-center gap-3">
			<div
				class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground italic"
			>
				AI
			</div>
			<h2 class="text-lg font-semibold tracking-tight">Market Environment Summary</h2>
		</div>
		<p class="text-sm leading-relaxed text-muted-foreground italic">
			"{aiSummary}"
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each sampleMarketRegimes as regime (regime.id)}
			<RegimeCard {regime} />
		{/each}
	</div>
</div>
