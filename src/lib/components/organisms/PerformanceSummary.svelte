<script lang="ts">
	import { PerfSummaryItemSchema } from '$lib/schemas/perf-summary-item.schema';
	import { PerformanceSummarySchema } from '$lib/schemas/performance-summary.schema';
	import { samplePerfSummary } from '$lib/shared-mockdata/performance';

	const state = $state(
		PerformanceSummarySchema.parse({
			stats: samplePerfSummary.filter((item) => PerfSummaryItemSchema.safeParse(item).success)
		})
	);
</script>

<div class="space-y-4">
	<h2 class="text-xl font-semibold">Statistics Summary</h2>
	<div class="h-full rounded-xl border bg-card p-4 shadow-sm">
		{#if state.stats.length === 0}
			<p class="text-sm text-muted-foreground">No statistics available</p>
		{:else}
			<div class="grid grid-cols-2 gap-x-8 gap-y-2">
				{#each state.stats as stat (stat.label)}
					<div class="flex justify-between border-b border-muted py-1">
						<span class="text-sm text-muted-foreground">{stat.label}</span>
						<span class="text-sm font-semibold">{stat.value}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
