<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PerformanceSummary from '$lib/components/organisms/PerformanceSummary.svelte';
	import { sampleBacktestResult } from '$lib/shared-mockdata/performance';

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

<!-- Default: renders with internal samplePerfSummary mock (no props) -->
<Story name="Default" />

<!-- WithData: receives decomposed OpenAPI props -->
<Story
	name="WithData"
	args={{
		performanceMetrics: sampleBacktestResult.performance_metrics,
		equityCurve: sampleBacktestResult.equity_curve,
		executionLog: sampleBacktestResult.execution_log,
		signalHistory: sampleBacktestResult.signal_history
	}}
/>
