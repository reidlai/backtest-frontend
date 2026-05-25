<script lang="ts">
	import { z } from 'zod';
	import { Progress } from '$lib/components/ui/progress';
	import { sampleResourceUsage } from '$lib/shared-mockdata/strategy';
	import { ResourceCostPanelSchema } from '$lib/schemas';

	let state = $state<z.infer<typeof ResourceCostPanelSchema>>(ResourceCostPanelSchema.parse({}));
	state.resourceUsage = sampleResourceUsage;
</script>

<div class="space-y-4 rounded-xl border bg-card/50 p-4 shadow-sm">
	<h3 class="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
		Resource & Cost
	</h3>

	<div class="space-y-3">
		<div class="space-y-1.5">
			<div class="flex justify-between text-[10px] font-medium text-muted-foreground uppercase">
				<span>Tokens Used</span>
				<span>{state.resourceUsage.tokensUsed} / {state.resourceUsage.tokensTotal}</span>
			</div>
			<Progress
				value={(state.resourceUsage.tokensUsed / state.resourceUsage.tokensTotal) * 100}
				class="h-1"
			/>
		</div>

		<div class="space-y-1.5">
			<div class="flex justify-between text-[10px] font-medium text-muted-foreground uppercase">
				<span>Backtests</span>
				<span>{state.resourceUsage.backtestsUsed} / {state.resourceUsage.backtestsTotal}</span>
			</div>
			<Progress
				value={(state.resourceUsage.backtestsUsed / state.resourceUsage.backtestsTotal) * 100}
				class="h-1"
			/>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-2 pt-1">
		<div class="rounded border bg-muted/30 p-2">
			<p class="mb-0.5 text-[9px] text-muted-foreground uppercase">Est. Runtime</p>
			<p class="text-xs font-bold">{state.resourceUsage.estimatedRuntime}</p>
		</div>
		<div class="rounded border bg-muted/30 p-2">
			<p class="mb-0.5 text-[9px] text-muted-foreground uppercase">Plan Impact</p>
			<p class="text-xs font-bold text-yellow-500 capitalize">{state.resourceUsage.planImpact}</p>
		</div>
	</div>
</div>
