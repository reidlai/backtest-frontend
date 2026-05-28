<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import UniverseCapitalConfig from '$lib/components/organisms/UniverseCapitalConfig.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/UniverseCapitalConfig',
		component: UniverseCapitalConfig,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

<Story name="Default" />
