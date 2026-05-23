<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AIReviewPanel from '$lib/components/organisms/AIReviewPanel.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/AIReviewPanel',
		component: AIReviewPanel,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story name="Default" />
