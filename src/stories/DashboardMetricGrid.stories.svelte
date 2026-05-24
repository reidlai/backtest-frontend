<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DashboardMetricGrid from '$lib/components/organisms/DashboardMetricGrid.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/DashboardMetricGrid',
		component: DashboardMetricGrid,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story name="Default" />
