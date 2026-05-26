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
		},
		argTypes: {
			messages: { control: 'object', description: 'Bindable messages array' },
			chatInput: { control: 'text', description: 'Bindable chat input value' }
		}
	});
</script>

<Story name="Default" />

<Story
	name="WithHistory"
	args={{
		messages: [
			{
				id: 'msg-1',
				role: 'user',
				content: 'What is the optimal RSI period for swing trading?',
				timestamp: '10:30 AM'
			},
			{
				id: 'msg-2',
				role: 'assistant',
				content:
					"For swing trading, RSI(14) is the standard. Consider RSI(9) for more sensitive signals on higher-volatility assets.",
				timestamp: '10:30 AM'
			}
		],
		chatInput: 'Follow-up question about MACD...'
	}}
/>
