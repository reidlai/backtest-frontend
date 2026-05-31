<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';
	import { strategyState } from '$lib/state/strategy.svelte';
	import { sampleStrategy } from '$lib/shared-mockdata/strategy';
	import { sampleBacktestResult } from '$lib/shared-mockdata/performance';
	import StrategyInputPanel from '$lib/components/organisms/StrategyInputPanel.svelte';
	import StrategyOutputPanel from '$lib/components/organisms/StrategyOutputPanel.svelte';

	async function handleRun() {
		strategyState.isRunning = true;
		strategyState.runError = null;

		try {
			// Mock parse + backtest: replace with real API call when backend is ready
			await new Promise((resolve) => setTimeout(resolve, 800));
			strategyState.parsedStrategy = sampleStrategy;
			strategyState.backtestResult = sampleBacktestResult;
		} catch (err) {
			strategyState.runError =
				err instanceof Error ? err.message : 'Backtest failed. Please try again.';
		} finally {
			strategyState.isRunning = false;
		}
	}

	function handleOpenFundamental() {
		goto('/fundamental-screener');
	}

	function handleOpenTechnical() {
		goto('/technical-screener');
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">{m.ai_strategy_builder()}</h1>
		<div class="flex gap-2">
			<button
				class="inline-flex h-8 items-center rounded-md border px-3 text-sm"
				onclick={handleOpenFundamental}
			>
				Fundamental Screener
			</button>
			<button
				class="inline-flex h-8 items-center rounded-md border px-3 text-sm"
				onclick={handleOpenTechnical}
			>
				Technical Screener
			</button>
		</div>
	</div>

	<!-- US3: side-by-side at lg+, stacked below (T023) -->
	<div class="grid gap-6 lg:grid-cols-2">
		<StrategyInputPanel
			bind:inputText={strategyState.inputText}
			isRunning={strategyState.isRunning}
			onRun={handleRun}
		/>

		<StrategyOutputPanel
			result={strategyState.backtestResult}
			isLoading={strategyState.isRunning}
			error={strategyState.runError}
		/>
	</div>
</div>
