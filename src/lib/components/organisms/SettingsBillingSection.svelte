<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import * as m from '$lib/paraglide/messages';
	import { sampleResourceUsage } from '$lib/data/strategy';
</script>

<div class="space-y-8 p-6">
	<h1 class="text-3xl font-bold tracking-tight">{m.settings_billing()}</h1>

	<div class="grid gap-6 md:grid-cols-2">
		<!-- Token Usage -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Token Usage</Card.Title>
				<Card.Description>Current session consumption vs quota.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex justify-between text-sm">
					<span>Usage</span>
					<span class="font-bold"
						>{sampleResourceUsage.tokensUsed} / {sampleResourceUsage.tokensTotal} tokens</span
					>
				</div>
				<Progress
					value={(sampleResourceUsage.tokensUsed / sampleResourceUsage.tokensTotal) * 100}
				/>
				<p class="text-xs text-muted-foreground italic">Tokens are reset daily at 00:00 UTC.</p>
			</Card.Content>
		</Card.Root>

		<!-- Backtest Quota -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Backtest Runs</Card.Title>
				<Card.Description>Daily execution limits.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex justify-between text-sm">
					<span>Runs Today</span>
					<span class="font-bold"
						>{sampleResourceUsage.backtestsUsed} / {sampleResourceUsage.backtestsTotal}</span
					>
				</div>
				<Progress
					value={(sampleResourceUsage.backtestsUsed / sampleResourceUsage.backtestsTotal) * 100}
				/>
				<p class="text-xs text-muted-foreground italic">
					You are currently on the <span class="font-bold text-primary">Pro Plan</span>.
				</p>
			</Card.Content>
		</Card.Root>

		<!-- Platform Stats -->
		<Card.Root>
			<Card.Header>
				<Card.Title>System Status</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					<div class="flex items-center justify-between border-b pb-2">
						<span class="text-sm font-medium">Queue Position</span>
						<span class="text-sm">{sampleResourceUsage.queuePosition} (Active)</span>
					</div>
					<div class="flex items-center justify-between border-b pb-2">
						<span class="text-sm font-medium">Complexity Score</span>
						<span class="text-sm">{sampleResourceUsage.complexityScore}/100</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">Estimated Runtime</span>
						<span class="text-sm">{sampleResourceUsage.estimatedRuntime}</span>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
