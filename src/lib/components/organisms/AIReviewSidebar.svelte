<script lang="ts">
	import { z } from 'zod';
	import { ChatMessageSchema } from '$lib/schemas';
	import AIReviewPanel from './AIReviewPanel.svelte';
	import ResourceCostPanel from './ResourceCostPanel.svelte';
	import AIChatPanel from './AIChatPanel.svelte';
	import QuickActionsPanel from './QuickActionsPanel.svelte';

	type ChatMessage = z.infer<typeof ChatMessageSchema>;

	let { messages = $bindable([]), chatInput = $bindable('') } = $props<{
		messages?: ChatMessage[];
		chatInput?: string;
	}>();
</script>

<aside
	class="flex h-full w-[280px] flex-col space-y-4 overflow-hidden border-l bg-card/30 p-4 backdrop-blur-md"
>
	<AIReviewPanel />
	<ResourceCostPanel />
	<AIChatPanel bind:messages bind:chatInput />
	<QuickActionsPanel />
</aside>
