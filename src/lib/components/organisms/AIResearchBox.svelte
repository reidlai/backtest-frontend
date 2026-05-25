<script lang="ts">
	import { z } from 'zod';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { strategyState } from '$lib/state/strategy.svelte';
	import { AIResearchBoxSchema } from '$lib/schemas';

	let state = $state<z.infer<typeof AIResearchBoxSchema>>(AIResearchBoxSchema.parse({}));

	function handleConvertToStrategy() {
		if (!state.aiText.trim()) {
			state.validationError = true;
			return;
		}
		state.validationError = false;

		//TODO: Use more generic method to pass strategy text to strategy builder
		strategyState.inputText = state.aiText.trim();
		goto('/strategy-builder');
	}
</script>

<div class="space-y-4">
	<div class="rounded-xl border bg-card p-6 shadow-sm">
		<h2 class="mb-4 text-xl font-semibold">AI Research Box</h2>
		<Textarea
			placeholder={m.ai_research_box_placeholder()}
			bind:value={state.aiText}
			class={cn(
				'min-h-[200px] resize-none',
				state.validationError && 'border-destructive ring-destructive'
			)}
		/>
		{#if state.validationError}
			<p class="mt-2 text-sm text-destructive">{m.ai_research_box_error()}</p>
		{/if}
		<Button class="mt-4 w-full" onclick={handleConvertToStrategy}>
			{m.convert_to_strategy()}
		</Button>
	</div>

	<!-- Quick Actions -->
	<div class="flex flex-wrap gap-2">
		<Button variant="outline" size="sm" onclick={() => goto('/strategy-builder')}>
			{m.quick_action_new_strategy()}
		</Button>
		<Button variant="outline" size="sm" onclick={() => goto('/backtest-engine')}>
			{m.quick_action_new_backtest()}
		</Button>
		<Button variant="outline" size="sm" onclick={() => goto('/fundamental-screener')}>
			{m.quick_action_screener()}
		</Button>
		<Button variant="outline" size="sm" onclick={() => goto('/performance-result')}>
			{m.quick_action_report()}
		</Button>
	</div>
</div>
