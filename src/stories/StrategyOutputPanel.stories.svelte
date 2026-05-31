<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StrategyOutputPanel from '$lib/components/organisms/StrategyOutputPanel.svelte';
	import { sampleBacktestResult } from '$lib/shared-mockdata/performance';

	const { Story } = defineMeta({
		title: 'Organisms/StrategyOutputPanel',
		component: StrategyOutputPanel,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<!-- Empty: no result, no loading, no error -->
<Story name="Empty" args={{ result: null, isLoading: false, error: null }} />

<!-- Loading: skeleton state while backtest runs -->
<Story name="Loading" args={{ result: null, isLoading: true, error: null }} />

<!-- Result: full result with metrics, chart, trades -->
<Story name="Result" args={{ result: sampleBacktestResult, isLoading: false, error: null }} />

<!-- Error: inline error message -->
<Story
	name="Error"
	args={{ result: null, isLoading: false, error: 'Backtest failed: invalid strategy' }}
/>
