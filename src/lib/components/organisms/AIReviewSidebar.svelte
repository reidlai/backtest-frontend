<script lang="ts">
	import AIReviewPanel from './AIReviewPanel.svelte';
	import ResourceCostPanel from './ResourceCostPanel.svelte';
	import AIChatPanel from './AIChatPanel.svelte';
	import QuickActionsPanel from './QuickActionsPanel.svelte';
</script>

<aside
	class="flex h-full w-[280px] flex-col space-y-4 overflow-hidden border-l bg-card/30 p-4 backdrop-blur-md"
>
	<AIReviewPanel />
	<ResourceCostPanel />
	<AIChatPanel />
	<QuickActionsPanel />
</aside>
