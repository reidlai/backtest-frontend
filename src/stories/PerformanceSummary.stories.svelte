<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PerformanceSummary from '$lib/components/organisms/PerformanceSummary.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/PerformanceSummary',
		component: PerformanceSummary,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<!-- Default: renders the organism with its internal samplePerfSummary mock data -->
<Story name="Default" />
