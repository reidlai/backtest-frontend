<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RegimeCard from '$lib/components/molecules/RegimeCard.svelte';
	import type { MarketRegime } from '$lib/types';

	const { Story } = defineMeta({
		title: 'Molecules/RegimeCard',
		component: RegimeCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});

	const activeRegime: MarketRegime = {
		id: 'bull-trend',
		name: 'Bull Trend',
		status: 'active',
		logicDescription:
			'Strong upward price momentum supported by rising volume and positive breadth.',
		indicators: ['SMA200 Rising', 'A/D Line Up', 'New Highs > New Lows']
	};

	const warningRegime: MarketRegime = {
		id: 'high-volatility',
		name: 'High Volatility',
		status: 'warning',
		logicDescription: 'VIX elevated above 20 with intraday price swings exceeding 1.5% average.',
		indicators: ['VIX > 20', 'ATR Expanding', 'Put/Call > 1.0']
	};

	const inactiveRegime: MarketRegime = {
		id: 'bear-trend',
		name: 'Bear Trend',
		status: 'inactive',
		logicDescription: 'Sustained downward momentum with broad market weakness.',
		indicators: ['SMA200 Declining', 'New Lows Expanding', 'Risk-Off Flows']
	};
</script>

<Story name="Active" args={{ regime: activeRegime }} />

<Story name="Warning" args={{ regime: warningRegime }} />

<Story name="Inactive" args={{ regime: inactiveRegime }} />
