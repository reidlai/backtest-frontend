<script lang="ts">
	import { z } from 'zod';
	import { StrategyInputPanelSchema } from '$lib/schemas';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';

	type Props = z.infer<typeof StrategyInputPanelSchema> & { onRun: () => void };

	let { inputText = $bindable(''), isRunning = false, onRun }: Props = $props();

	let touched = $state(false);

	const isValid = $derived(inputText.length >= 10);
	const showError = $derived(touched && !isValid);
	const runDisabled = $derived(!isValid || isRunning);
</script>

<div class="space-y-4">
	<div class="rounded-xl border bg-card p-6 shadow-sm">
		<h2 class="mb-4 text-xl font-semibold">Strategy Description</h2>
		<Textarea
			placeholder="Describe your strategy in detail..."
			bind:value={inputText}
			onblur={() => (touched = true)}
			class="min-h-[300px] resize-none"
			aria-describedby={showError ? 'input-error' : undefined}
		/>
		{#if showError}
			<p id="input-error" class="mt-2 text-sm text-destructive">
				Strategy description must be at least 10 characters
			</p>
		{/if}
		<Button class="mt-4 w-full" onclick={onRun} disabled={runDisabled}>
			{#if isRunning}
				<span
					class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
				></span>
				Running...
			{:else}
				Run
			{/if}
		</Button>
	</div>
</div>
