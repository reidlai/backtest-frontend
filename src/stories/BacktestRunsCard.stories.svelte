<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BacktestRunsCard from '$lib/components/organisms/BacktestRunsCard.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/BacktestRunsCard',
		component: BacktestRunsCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story
	name="Default (Valid Data)"
	args={{ backtestsUsed: 3, backtestsTotal: 10, planName: 'Pro Plan' }}
/>

<Story
	name="Zero Runs Used"
	args={{ backtestsUsed: 0, backtestsTotal: 10, planName: 'Pro Plan' }}
/>

<Story
	name="Full Quota (100%)"
	args={{ backtestsUsed: 10, backtestsTotal: 10, planName: 'Pro Plan' }}
/>

<Story
	name="Invalid Data (Schema Failure)"
	args={{ backtestsUsed: 20, backtestsTotal: 5, planName: '' }}
/>
