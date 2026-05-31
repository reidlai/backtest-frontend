<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MarketEnvironmentSummary from '$lib/components/organisms/MarketEnvironmentSummary.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/MarketEnvironmentSummary',
		component: MarketEnvironmentSummary,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story
	name="Default"
	args={{
		summary:
			'The current market is characterized by a strong Bull Trend in major US indices, supported by low volatility and positive momentum. However, High Volatility warnings are present in Asian markets due to regional economic shifts. Risk-On sentiment remains dominant as capital continues to flow into technology and growth sectors.'
	}}
/>

<Story name="Empty" args={{ summary: '' }} />
