<script module lang="ts">
	import { z } from 'zod';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FunctionGatewayCard from '$lib/components/molecules/FunctionGatewayCard.svelte';
	import { FunctionGatewayCardSchema } from '$lib/schemas';

	type IFunctionGatewayCard = z.infer<typeof FunctionGatewayCardSchema>;

	const { Story } = defineMeta({
		title: 'Molecules/FunctionGatewayCard',
		component: FunctionGatewayCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});

	const strategyCard: IFunctionGatewayCard = {
		id: 'strategy-builder',
		titleKey: 'gateway_card_strategy_builder_title',
		descriptionKey: 'gateway_card_strategy_builder_desc',
		icon: 'zap'
	};

	const screenerCard: IFunctionGatewayCard = {
		id: 'fundamental-screener',
		titleKey: 'gateway_card_fundamental_title',
		descriptionKey: 'gateway_card_fundamental_desc',
		icon: 'search'
	};
</script>

<Story name="Strategy Builder" args={{ card: strategyCard, onClick: () => {} }} />

<Story name="Fundamental Screener" args={{ card: screenerCard, onClick: () => {} }} />
