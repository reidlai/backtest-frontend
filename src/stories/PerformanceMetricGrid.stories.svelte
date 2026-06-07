<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PerformanceMetricGrid from '$lib/components/organisms/PerformanceMetricGrid.svelte';
	import { sampleBacktestResult } from '$lib/shared-mockdata/performance';

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

<!-- Default: renders with internal defaultMetricTiles mock (no props) -->
<Story name="Default" />

<!-- WithData: receives performanceMetrics from OpenAPI BacktestResultResource -->
<Story name="WithData" args={{ performanceMetrics: sampleBacktestResult.performance_metrics }} />
