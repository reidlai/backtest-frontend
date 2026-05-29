<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ScreenerFilterPanel from '$lib/components/organisms/ScreenerFilterPanel.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/ScreenerFilterPanel',
		component: ScreenerFilterPanel,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

<Story name="Default" />
