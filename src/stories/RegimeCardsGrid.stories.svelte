<script module lang="ts">
	import { z } from 'zod';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RegimeCardsGrid from '$lib/components/organisms/RegimeCardsGrid.svelte';
	import { MarketRegimeSchema } from '$lib/schemas';

	type MarketRegime = z.infer<typeof MarketRegimeSchema>;

	const { Story } = defineMeta({
		title: 'Organisms/RegimeCardsGrid',
		component: RegimeCardsGrid,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});

	const sampleRegimes: MarketRegime[] = [
		{
			id: 'bull-trend',
			name: 'Bull Trend',
			status: 'active',
			logicDescription:
				'Strong upward price momentum supported by rising volume and positive breadth.',
			indicators: ['SMA200 Rising', 'A/D Line Up', 'New Highs > New Lows']
		},
		{
			id: 'high-volatility',
			name: 'High Volatility',
			status: 'warning',
			logicDescription: 'VIX elevated above 20 with intraday price swings exceeding 1.5% average.',
			indicators: ['VIX > 20', 'ATR Expanding', 'Put/Call > 1.0']
		},
		{
			id: 'bear-trend',
			name: 'Bear Trend',
			status: 'inactive',
			logicDescription: 'Sustained downward momentum with broad market weakness.',
			indicators: ['SMA200 Declining', 'New Lows Expanding', 'Risk-Off Flows']
		}
	];
</script>

<Story name="Default" args={{ regimes: sampleRegimes }} />

<Story name="Empty" args={{ regimes: [] }} />

<Story
	name="Mixed Status"
	args={{
		regimes: sampleRegimes
	}}
/>
