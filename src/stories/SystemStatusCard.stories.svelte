<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SystemStatusCard from '$lib/components/organisms/SystemStatusCard.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/SystemStatusCard',
		component: SystemStatusCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story
	name="Default (Valid Data)"
	args={{ queuePosition: 2, complexityScore: 67, estimatedRuntime: '~42s' }}
/>

<Story
	name="High Complexity"
	args={{ queuePosition: 5, complexityScore: 95, estimatedRuntime: '~3m 20s' }}
/>

<Story
	name="Zero Values"
	args={{ queuePosition: 0, complexityScore: 0, estimatedRuntime: 'N/A' }}
/>

<Story
	name="Invalid Data (Schema Failure)"
	args={{ queuePosition: 1, complexityScore: 150, estimatedRuntime: '' }}
/>
