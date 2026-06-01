<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TradeLotTable from '$lib/components/organisms/TradeLotTable.svelte';
	import { sampleTrades } from '$lib/shared-mockdata/trades';

	const { Story } = defineMeta({
		title: 'Organisms/TradeLotTable',
		component: TradeLotTable,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story name="Default" args={{ trades: sampleTrades }} />

<Story name="Empty" args={{ trades: [] }} />

<Story
	name="WithInvalidRecords"
	args={{
		trades: [sampleTrades[0], { tradeId: 'bad', symbol: 123, direction: 'Unknown' }]
	}}
/>
