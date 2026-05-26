<script lang="ts">
	import { z } from 'zod';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ChatMessageSchema } from '$lib/schemas';

	type ChatMessage = z.infer<typeof ChatMessageSchema>;

	let { messages = $bindable([]), chatInput = $bindable('') } = $props<{
		messages?: ChatMessage[];
		chatInput?: string;
	}>();

	function handleSendMessage() {
		if (!chatInput.trim()) return;

		const userMsg: ChatMessage = {
			id: Math.random().toString(36).substring(7),
			role: 'user',
			content: chatInput,
			timestamp: new Date().toLocaleTimeString()
		};

		const assistantMsg: ChatMessage = {
			id: Math.random().toString(36).substring(7),
			role: 'assistant',
			content:
				"I've analyzed your request. Based on current market regimes, the strategy seems viable but carries moderate overfitting risk.",
			timestamp: new Date().toLocaleTimeString()
		};

		messages = [...messages, userMsg, assistantMsg];
		chatInput = '';
	}
</script>

<div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card/50 shadow-sm">
	<div class="border-b bg-muted/10 p-3">
		<h3 class="text-sm font-semibold tracking-wider text-muted-foreground uppercase">AI Chat</h3>
	</div>

	<div class="scrollbar-hide flex-1 space-y-3 overflow-y-auto p-3">
		{#if messages.length === 0}
			<p class="mt-8 px-4 text-center text-[11px] text-muted-foreground">
				Ask me about your strategy parameters or optimization tips.
			</p>
		{/if}
		{#each messages as msg (msg.id)}
			<div class={msg.role === 'user' ? 'ml-4' : 'mr-4'}>
				<div
					class={msg.role === 'user'
						? 'rounded-l-lg rounded-tr-lg bg-primary text-primary-foreground'
						: 'rounded-tl-lg rounded-r-lg bg-muted'}
				>
					<p class="p-2 text-[11px] leading-snug">{msg.content}</p>
				</div>
				<p class="mt-0.5 text-[8px] text-muted-foreground uppercase">
					{msg.role} • {msg.timestamp}
				</p>
			</div>
		{/each}
	</div>

	<div class="space-y-2 border-t bg-muted/10 p-3">
		<Textarea
			bind:value={chatInput}
			placeholder="Ask AI..."
			class="min-h-[60px] border-none bg-background text-[11px] ring-offset-0 focus-visible:ring-1"
		/>
		<Button size="sm" class="h-8 w-full text-[11px]" onclick={handleSendMessage}>
			Send Message
		</Button>
	</div>
</div>

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
