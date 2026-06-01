<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { BacktestRunsCardSchema } from '$lib/schemas';
	import type { BacktestRunsCardState } from '$lib/schemas';

	let {
		backtestsUsed = 0,
		backtestsTotal = 10,
		planName = 'Pro Plan'
	}: { backtestsUsed?: number; backtestsTotal?: number; planName?: string } = $props();

	let cardData: BacktestRunsCardState | null = $state(null);
	let parseError: boolean = $state(false);

	$effect(() => {
		const result = BacktestRunsCardSchema.safeParse({ backtestsUsed, backtestsTotal, planName });
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
		<Card.Title>Backtest Runs</Card.Title>
		<Card.Description>Daily execution limits.</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		{#if parseError || !cardData}
			<p class="text-sm text-destructive">Invalid data: unable to display backtest runs.</p>
		{:else}
			<div class="flex justify-between text-sm">
				<span>Runs Today</span>
				<span class="font-bold">{cardData.backtestsUsed} / {cardData.backtestsTotal}</span>
			</div>
			<Progress value={(cardData.backtestsUsed / cardData.backtestsTotal) * 100} />
			<p class="text-xs text-muted-foreground italic">
				You are currently on the <span class="font-bold text-primary">{cardData.planName}</span>.
			</p>
		{/if}
	</Card.Content>
</Card.Root>
