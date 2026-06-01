<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TokenUsageCard from '$lib/components/organisms/TokenUsageCard.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/TokenUsageCard',
		component: TokenUsageCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});
</script>

<Story name="Default (Valid Data)" args={{ tokensUsed: 4250, tokensTotal: 10000 }} />

<Story name="Full Quota (100%)" args={{ tokensUsed: 10000, tokensTotal: 10000 }} />

<Story name="Empty (Zero Usage)" args={{ tokensUsed: 0, tokensTotal: 10000 }} />

<Story name="Invalid Data (Schema Failure)" args={{ tokensUsed: 99999, tokensTotal: 100 }} />
