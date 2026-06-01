<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { SystemStatusCardSchema } from '$lib/schemas';
	import type { SystemStatusCardState } from '$lib/schemas';

	let {
		queuePosition = 0,
		complexityScore = 0,
		estimatedRuntime = 'N/A'
	}: { queuePosition?: number; complexityScore?: number; estimatedRuntime?: string } = $props();

	let cardData: SystemStatusCardState | null = $state(null);
	let parseError: boolean = $state(false);

	$effect(() => {
		const result = SystemStatusCardSchema.safeParse({
			queuePosition,
			complexityScore,
			estimatedRuntime
		});
		if (result.success) {
			cardData = result.data;
			parseError = false;
		} else {
			cardData = null;
			parseError = true;
		}
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>System Status</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if parseError || !cardData}
			<p class="text-sm text-destructive">Invalid data: unable to display system status.</p>
		{:else}
			<div class="space-y-4">
				<div class="flex items-center justify-between border-b pb-2">
					<span class="text-sm font-medium">Queue Position</span>
					<span class="text-sm">{cardData.queuePosition} (Active)</span>
				</div>
				<div class="flex items-center justify-between border-b pb-2">
					<span class="text-sm font-medium">Complexity Score</span>
					<span class="text-sm">{cardData.complexityScore}/100</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium">Estimated Runtime</span>
					<span class="text-sm">{cardData.estimatedRuntime}</span>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
