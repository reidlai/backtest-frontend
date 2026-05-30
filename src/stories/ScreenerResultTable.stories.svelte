<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ScreenerResultTable from '$lib/components/organisms/ScreenerResultTable.svelte';
	import * as nav from '$app/navigation';
	// Navigation is suppressed in Storybook — goto calls are no-ops
	(nav as unknown as Record<string, unknown>).goto = () => {};

	const { Story } = defineMeta({
		title: 'Organisms/ScreenerResultTable',
		component: ScreenerResultTable,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			onBacktest: (symbol: string) => {
				console.log('Backtest requested for:', symbol);
			}
		}
	});
</script>

<Story name="Default" />
