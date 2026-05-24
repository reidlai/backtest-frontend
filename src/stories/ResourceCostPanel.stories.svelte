<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ResourceCostPanel from '$lib/components/organisms/ResourceCostPanel.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/ResourceCostPanel',
		component: ResourceCostPanel,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story name="Default" />
