<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PerformancdeChartTabs from '$lib/components/organisms/PerformancdeChartTabs.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/PerformancdeChartTabs',
		component: PerformancdeChartTabs,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story name="Default" />
