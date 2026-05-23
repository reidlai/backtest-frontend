<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import QuickActionsPanel from '$lib/components/organisms/QuickActionsPanel.svelte';

	// Note: QuickActionsPanel calls getContext('organism-refs') internally.
	// In Storybook, this context is not set, so getContext returns undefined.
	// All handlers use optional chaining (?.), so buttons render safely and
	// context-dependent actions (New Strategy, New Backtest) gracefully no-op.

	const { Story } = defineMeta({
		title: 'Organisms/QuickActionsPanel',
		component: QuickActionsPanel,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story name="Default" />
