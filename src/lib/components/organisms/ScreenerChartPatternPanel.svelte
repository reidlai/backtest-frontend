<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import { SCREENER_PATTERNS } from '$lib/schemas';

	interface Props {
		selectedPatterns?: Set<string>;
		availablePatterns?: string[];
		ontoggle?: (pattern: string, selected: boolean) => void;
	}

	let {
		selectedPatterns = $bindable(new Set<string>()),
		availablePatterns = [...SCREENER_PATTERNS],
		ontoggle
	}: Props = $props();

	function togglePattern(pattern: string) {
		if (selectedPatterns.has(pattern)) {
			selectedPatterns.delete(pattern);
			ontoggle?.(pattern, false);
		} else {
			selectedPatterns.add(pattern);
			ontoggle?.(pattern, true);
		}
	}
</script>

<div class="space-y-4 rounded-xl border bg-card p-6 shadow-sm" aria-label={m.screener_chart_patterns()}>
	<h2 class="text-lg font-semibold">{m.screener_chart_patterns()}</h2>
	<div class="flex flex-wrap gap-2">
		{#each availablePatterns as pattern (pattern)}
			<Button
				variant={selectedPatterns.has(pattern) ? 'default' : 'outline'}
				size="sm"
				class="h-7 text-[10px] font-bold uppercase"
				aria-pressed={selectedPatterns.has(pattern)}
				onclick={() => togglePattern(pattern)}
			>
				{pattern}
			</Button>
		{/each}
	</div>
</div>
