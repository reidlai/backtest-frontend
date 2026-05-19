<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Table from '$lib/components/ui/table';
	import * as m from '$lib/paraglide/messages';
	import { appState } from '$lib/state/app.svelte';
	import { sampleStrategy } from '$lib/data/strategy';
	import type { Strategy } from '$lib/types';

	let parsedStrategy = $state<Strategy | null>(null);

	export function reset() {
		appState.strategyInputText = '';
		parsedStrategy = null;
	}

	export function getStrategyConfig() {
		return parsedStrategy || sampleStrategy;
	}

	function handleParse() {
		// Mock parse
		parsedStrategy = sampleStrategy;
	}

	function handleSendToBacktest() {
		appState.activeSection = 'backtest-engine';
	}

	function handleOpenFundamental() {
		appState.activeSection = 'fundamental-screener';
	}

	function handleOpenTechnical() {
		appState.activeSection = 'technical-screener';
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">{m.ai_strategy_builder()}</h1>
		<div class="flex gap-2">
			<Button variant="outline" size="sm" onclick={handleOpenFundamental}>
				Fundamental Screener
			</Button>
			<Button variant="outline" size="sm" onclick={handleOpenTechnical}>Technical Screener</Button>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Input Panel -->
		<div class="space-y-4">
			<div class="rounded-xl border bg-card p-6 shadow-sm">
				<h2 class="mb-4 text-xl font-semibold">Strategy Description</h2>
				<Textarea
					placeholder="Describe your strategy..."
					bind:value={appState.strategyInputText}
					class="min-h-[300px] resize-none"
				/>
				<Button class="mt-4 w-full" onclick={handleParse}>Parse Strategy</Button>
			</div>
		</div>

		<!-- Output Panel -->
		<div class="space-y-4">
			{#if parsedStrategy}
				<div
					class="animate-in rounded-xl border bg-card p-6 shadow-sm duration-300 fade-in slide-in-from-right-4"
				>
					<h2 class="mb-4 text-xl font-semibold">Structured Output</h2>
					<Table.Root>
						<Table.Body>
							<Table.Row>
								<Table.Head class="w-[150px]">Market</Table.Head>
								<Table.Cell>{parsedStrategy.market}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Head>Fundamental</Table.Head>
								<Table.Cell>{parsedStrategy.fundamentalFilter}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Head>Technical</Table.Head>
								<Table.Cell>{parsedStrategy.technicalFilter}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Head>Period</Table.Head>
								<Table.Cell>{parsedStrategy.backtestPeriod}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Head>Position Size</Table.Head>
								<Table.Cell>{parsedStrategy.positionSize}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Head>Risk Rule</Table.Head>
								<Table.Cell>{parsedStrategy.riskRule}</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table.Root>

					<Button class="mt-6 w-full" variant="secondary" onclick={handleSendToBacktest}>
						Send to Backtest
					</Button>
				</div>
			{:else}
				<div
					class="flex h-full items-center justify-center rounded-xl border border-dashed bg-muted/20 p-12"
				>
					<p class="text-center text-muted-foreground">
						Enter your strategy description and click <br />
						<span class="font-semibold text-foreground">"Parse Strategy"</span> to see structured results.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
