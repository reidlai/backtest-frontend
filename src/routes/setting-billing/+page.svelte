<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { sampleResourceUsage } from '$lib/shared-mockdata/strategy';
	import TokenUsageCard from '$lib/components/organisms/TokenUsageCard.svelte';
	import BacktestRunsCard from '$lib/components/organisms/BacktestRunsCard.svelte';
	import SystemStatusCard from '$lib/components/organisms/SystemStatusCard.svelte';
</script>

<div class="space-y-8 p-6">
	<h1 class="text-3xl font-bold tracking-tight">{m.settings_billing()}</h1>

	<div class="grid gap-6 md:grid-cols-2">
		<TokenUsageCard
			tokensUsed={sampleResourceUsage.tokensUsed}
			tokensTotal={sampleResourceUsage.tokensTotal}
		/>

		<BacktestRunsCard
			backtestsUsed={sampleResourceUsage.backtestsUsed}
			backtestsTotal={sampleResourceUsage.backtestsTotal}
			planName="Pro Plan"
		/>

		<SystemStatusCard
			queuePosition={sampleResourceUsage.queuePosition}
			complexityScore={sampleResourceUsage.complexityScore}
			estimatedRuntime={sampleResourceUsage.estimatedRuntime}
		/>
	</div>
</div>
