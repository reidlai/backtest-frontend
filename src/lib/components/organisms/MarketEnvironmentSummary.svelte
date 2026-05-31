<script lang="ts">
	import { z } from 'zod';
	import { MarketEnvironmentSummarySchema } from '$lib/schemas';

	let { summary = '' }: z.infer<typeof MarketEnvironmentSummarySchema> = $props();
</script>

<div class="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
	<div class="mb-4 flex items-center gap-3">
		<div
			class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground italic"
		>
			AI
		</div>
		<h2 class="text-lg font-semibold tracking-tight">Market Environment Summary</h2>
	</div>
	<p class="text-sm leading-relaxed text-muted-foreground italic">
		"{summary}"
	</p>
</div>
