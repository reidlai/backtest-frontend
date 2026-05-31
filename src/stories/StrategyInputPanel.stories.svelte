<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StrategyInputPanel from '$lib/components/organisms/StrategyInputPanel.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/StrategyInputPanel',
		component: StrategyInputPanel,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<!-- Default: empty textarea, Run disabled -->
<Story name="Default" args={{ inputText: '', isRunning: false, onRun: () => {} }} />

<!-- ValidationError: touched with <10 chars -->
<Story
	name="ValidationError"
	args={{ inputText: 'Too short', isRunning: false, onRun: () => {} }}
/>

<!-- Valid: >=10 chars, Run enabled -->
<Story
	name="Valid"
	args={{ inputText: 'Buy AAPL when RSI < 30', isRunning: false, onRun: () => {} }}
/>

<!-- Running: button disabled with loading indicator -->
<Story
	name="Running"
	args={{ inputText: 'Buy AAPL when RSI < 30', isRunning: true, onRun: () => {} }}
/>
