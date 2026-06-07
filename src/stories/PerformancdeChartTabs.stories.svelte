<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PerformancdeChartTabs from '$lib/components/organisms/PerformancdeChartTabs.svelte';
	import { sampleBacktestResult } from '$lib/shared-mockdata/performance';

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

<!-- Default: renders with internal sampleBacktestResult mock (no props) -->
<Story name="Default" />

<!-- WithData: receives four decomposed OpenAPI props -->
<Story
	name="WithData"
	args={{
		performanceMetrics: sampleBacktestResult.performance_metrics,
		equityCurve: sampleBacktestResult.equity_curve,
		executionLog: sampleBacktestResult.execution_log,
		signalHistory: sampleBacktestResult.signal_history
	}}
/>
