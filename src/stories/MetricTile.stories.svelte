<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MetricTile from '$lib/components/molecules/MetricTile.svelte';
	import type { MetricTile as IMetricTile, MarketMetric } from '$lib/types';

	const { Story } = defineMeta({
		title: 'Molecules/MetricTile',
		component: MetricTile,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});

	const sampleTile: IMetricTile = {
		id: 'total-return',
		label: 'Total Return',
		value: '42.8%',
		unit: '%',
		order: 0
	};

	const marketMetric: MarketMetric = {
		id: 'sp500',
		label: 'S&P 500',
		value: '5,234.18',
		delta: '+1.2%',
		deltaPositive: true,
		category: 'market'
	};

	const negativeDelta: MarketMetric = {
		id: 'vix',
		label: 'VIX',
		value: '18.5',
		delta: '+3.2%',
		deltaPositive: false,
		category: 'risk'
	};
</script>

<Story name="Performance Tile" args={{ tile: sampleTile }} />

<Story name="Market Metric with Positive Delta" args={{ tile: marketMetric }} />

<Story name="Market Metric with Negative Delta" args={{ tile: negativeDelta }} />

<Story
	name="Draggable Tile"
	args={{
		tile: sampleTile,
		draggable: true
	}}
/>
