<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages';
	import MetricTile from '../molecules/MetricTile.svelte';
	import FunctionGatewayCard from '../molecules/FunctionGatewayCard.svelte';
	import { sampleMarketMetrics } from '$lib/data/market';
	import { appState } from '$lib/state/app.svelte';
	import type { FunctionGatewayCard as IFunctionGatewayCard, SectionId } from '$lib/types';
	import { cn } from '$lib/utils';

	let aiText = $state('');
	let validationError = $state(false);

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

	function handleConvertToStrategy() {
		if (!aiText.trim()) {
			validationError = true;
			return;
		}
		validationError = false;
		appState.strategyInputText = aiText;
		appState.activeSection = 'strategy-builder';
	}

	function handleQuickAction(id: SectionId) {
		appState.activeSection = id;
	}
</script>

<div class="space-y-8 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">{m.dashboard_title()}</h1>
	</div>

	<!-- Metric Grid -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		{#each sampleMarketMetrics as tile (tile.id)}
			<MetricTile {tile} />
		{/each}
	</div>

	<div class="grid gap-8 lg:grid-cols-2">
		<!-- AI Research Box -->
		<div class="space-y-4">
			<div class="rounded-xl border bg-card p-6 shadow-sm">
				<h2 class="mb-4 text-xl font-semibold">AI Research Box</h2>
				<Textarea
					placeholder={m.ai_research_box_placeholder()}
					bind:value={aiText}
					class={cn(
						'min-h-[200px] resize-none',
						validationError && 'border-destructive ring-destructive'
					)}
				/>
				{#if validationError}
					<p class="mt-2 text-sm text-destructive">{m.ai_research_box_error()}</p>
				{/if}
				<Button class="mt-4 w-full" onclick={handleConvertToStrategy}>
					{m.convert_to_strategy()}
				</Button>
			</div>

			<!-- Quick Actions -->
			<div class="flex flex-wrap gap-2">
				<Button variant="outline" size="sm" onclick={() => handleQuickAction('strategy-builder')}>
					{m.quick_action_new_strategy()}
				</Button>
				<Button variant="outline" size="sm" onclick={() => handleQuickAction('backtest-engine')}>
					{m.quick_action_new_backtest()}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => handleQuickAction('fundamental-screener')}
				>
					{m.quick_action_screener()}
				</Button>
				<Button variant="outline" size="sm" onclick={() => handleQuickAction('performance-result')}>
					{m.quick_action_report()}
				</Button>
			</div>
		</div>

		<!-- Function Gateways -->
		<div class="grid gap-4 sm:grid-cols-2">
			{#each gatewayCards as card (card.id)}
				<FunctionGatewayCard {card} onClick={() => handleQuickAction(card.id)} />
			{/each}
		</div>
	</div>
</div>
