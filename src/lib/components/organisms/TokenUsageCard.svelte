<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { TokenUsageCardSchema } from '$lib/schemas';
	import type { TokenUsageCardState } from '$lib/schemas';

	let { tokensUsed = 0, tokensTotal = 10000 }: { tokensUsed?: number; tokensTotal?: number } =
		$props();

	let cardData: TokenUsageCardState | null = $state(null);
	let parseError: boolean = $state(false);

	$effect(() => {
		const result = TokenUsageCardSchema.safeParse({ tokensUsed, tokensTotal });
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
		<Card.Title>Token Usage</Card.Title>
		<Card.Description>Current session consumption vs quota.</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		{#if parseError || !cardData}
			<p class="text-sm text-destructive">Invalid data: unable to display token usage.</p>
		{:else}
			<div class="flex justify-between text-sm">
				<span>Usage</span>
				<span class="font-bold">{cardData.tokensUsed} / {cardData.tokensTotal} tokens</span>
			</div>
			<Progress value={(cardData.tokensUsed / cardData.tokensTotal) * 100} />
			<p class="text-xs text-muted-foreground italic">Tokens are reset daily at 00:00 UTC.</p>
		{/if}
	</Card.Content>
</Card.Root>
