<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AIChatPanel from '$lib/components/organisms/AIChatPanel.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/AIChatPanel',
		component: AIChatPanel,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story name="Default" />
