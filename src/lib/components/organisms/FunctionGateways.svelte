<script lang="ts">
	import { appState } from '$lib/state/app.svelte';
	import type { FunctionGatewayCard as IFunctionGatewayCard, SectionId } from '$lib/types';
	import FunctionGatewayCard from '../molecules/FunctionGatewayCard.svelte';
	const gatewayCards: IFunctionGatewayCard[] = [
		{
			id: 'strategy-builder',
			titleKey: 'gateway_card_strategy_builder_title',
			descriptionKey: 'gateway_card_strategy_builder_desc',
			icon: 'zap'
		},
		{
			id: 'fundamental-screener',
			titleKey: 'gateway_card_fundamental_title',
			descriptionKey: 'gateway_card_fundamental_desc',
			icon: 'search'
		},
		{
			id: 'technical-screener',
			titleKey: 'gateway_card_technical_title',
			descriptionKey: 'gateway_card_technical_desc',
			icon: 'trending-up'
		},
		{
			id: 'backtest-engine',
			titleKey: 'gateway_card_backtest_title',
			descriptionKey: 'gateway_card_backtest_desc',
			icon: 'play'
		},
		{
			id: 'market-regime',
			titleKey: 'gateway_card_regime_title',
			descriptionKey: 'gateway_card_regime_desc',
			icon: 'activity'
		},
		{
			id: 'sentiment-events',
			titleKey: 'gateway_card_sentiment_title',
			descriptionKey: 'gateway_card_sentiment_desc',
			icon: 'message-square'
		}
	];	

	function handleQuickAction(id: SectionId) {
		appState.activeSection = id;
	}

</script>
<div class="grid gap-4 sm:grid-cols-2">
  {#each gatewayCards as card (card.id)}
    <FunctionGatewayCard {card} onClick={() => handleQuickAction(card.id)} />
  {/each}
</div>