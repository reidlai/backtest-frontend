<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PerformanceMetricGrid from '$lib/components/organisms/PerformanceMetricGrid.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/PerformanceMetricGrid',
		component: PerformanceMetricGrid,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story name="Default" />
