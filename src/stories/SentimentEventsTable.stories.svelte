<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SentimentEventsTable from '$lib/components/organisms/SentimentEventsTable.svelte';
	import { sampleSentimentEvents } from '$lib/shared-mockdata/sentiment';

	const { Story } = defineMeta({
		title: 'Organisms/SentimentEventsTable',
		component: SentimentEventsTable,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story name="Default" args={{ events: sampleSentimentEvents }} />

<Story name="Empty" args={{ events: [] }} />

<Story
	name="WithInvalidEvents"
	args={{
		events: [sampleSentimentEvents[0], { id: 'bad', type: 'unknown', headline: 'missing fields' }]
	}}
/>
