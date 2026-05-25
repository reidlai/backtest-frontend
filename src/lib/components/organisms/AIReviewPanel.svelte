<script lang="ts">
	import { z } from 'zod';
	import { Badge } from '$lib/components/ui/badge';
	import { sampleAIReview } from '$lib/shared-mockdata/strategy';
	import { AIReviewPanelSchema } from '$lib/schemas';
	import RiskFlagItem from '../molecules/RiskFlagItem.svelte';

	let state = $state<z.infer<typeof AIReviewPanelSchema>>(AIReviewPanelSchema.parse({}));
	state.review = sampleAIReview;
</script>

<div class="space-y-4 rounded-xl border bg-card/50 p-4 shadow-sm">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold tracking-wider text-muted-foreground uppercase">AI Review</h3>
		<Badge variant="outline" class="border-primary/20 bg-primary/5 text-[10px] text-primary">
			CONFIDENCE: {state.review.confidence.toUpperCase()}
		</Badge>
	</div>

	<div class="flex items-center gap-4">
		<div
			class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl font-black text-primary ring-4 ring-primary/5"
		>
			{state.review.grade}
		</div>
		<div class="space-y-1">
			<p class="text-xs font-medium">Strategy Grade</p>
			<p class="line-clamp-1 text-[10px] text-muted-foreground">Last assessment: Just now</p>
		</div>
	</div>

	<div class="space-y-3 pt-2">
		{#each state.review.riskFlags as flag (flag.id)}
			<RiskFlagItem {flag} />
		{/each}
	</div>
</div>
