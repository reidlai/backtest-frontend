<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RegimeBreakdownTable from '$lib/components/organisms/RegimeBreakdownTable.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/RegimeBreakdownTable',
		component: RegimeBreakdownTable,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<!-- Default: renders the organism with its internal mock data (4 regime rows) -->
<Story name="Default" />
