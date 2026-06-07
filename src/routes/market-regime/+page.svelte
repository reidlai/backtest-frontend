<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import MarketEnvironmentSummary from '$lib/components/organisms/MarketEnvironmentSummary.svelte';
	import RegimeCardsGrid from '$lib/components/organisms/RegimeCardsGrid.svelte';
	import { marketRegimeState } from '$lib/state/market-regime.svelte';
	import { sampleMarketRegimes } from '$lib/shared-mockdata/market';

	// Seed state from mock data — replace this assignment with an API call in a future feature
	marketRegimeState.regimes = sampleMarketRegimes;

	const aiSummary =
		'The current market is characterized by a strong Bull Trend in major US indices, supported by low volatility and positive momentum. However, High Volatility warnings are present in Asian markets due to regional economic shifts. Risk-On sentiment remains dominant as capital continues to flow into technology and growth sectors.';
</script>

<div class="space-y-6 p-6">
	<h1 class="text-3xl font-bold tracking-tight">{m.market_regime()}</h1>

	<MarketEnvironmentSummary summary={aiSummary} />

	<RegimeCardsGrid regimes={marketRegimeState.regimes} />
</div>
