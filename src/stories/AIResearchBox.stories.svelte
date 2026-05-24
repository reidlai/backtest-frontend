<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AIResearchBox from '$lib/components/organisms/AIResearchBox.svelte';
	import * as nav from '$app/navigation';
	// Navigation is suppressed in Storybook — goto calls are no-ops
	(nav as unknown as Record<string, unknown>).goto = () => {};

	const { Story } = defineMeta({
		title: 'Organisms/AIResearchBox',
		component: AIResearchBox,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story name="Default" />
