<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as m from '$lib/paraglide/messages';
	import { toast } from 'svelte-sonner';
	import NavItem from '../molecules/NavItem.svelte';
	import { appState } from '$lib/state/app.svelte';
	import type { NavSection } from '$lib/types';

	const mainSections: NavSection[] = [
		{ id: 'dashboard', labelKey: 'dashboard', icon: 'layout-dashboard', group: 'main' },
		{ id: 'strategy-builder', labelKey: 'ai_strategy_builder', icon: 'zap', group: 'main' },
		{ id: 'fundamental-screener', labelKey: 'fundamental_screener', icon: 'search', group: 'main' },
		{
			id: 'technical-screener',
			labelKey: 'technical_screener',
			icon: 'trending-up',
			group: 'main'
		},
		{ id: 'backtest-engine', labelKey: 'backtest_engine', icon: 'play', group: 'main' }
	];

	const resultSections: NavSection[] = [
		{
			id: 'performance-result',
			labelKey: 'performance_result',
			icon: 'bar-chart-3',
			group: 'result'
		},
		{ id: 'market-regime', labelKey: 'market_regime', icon: 'activity', group: 'result' },
		{
			id: 'sentiment-events',
			labelKey: 'sentiment_events',
			icon: 'message-square',
			group: 'result'
		},
		{ id: 'trade-log', labelKey: 'trade_log', icon: 'list', group: 'result' },
		{ id: 'settings-billing', labelKey: 'settings_billing', icon: 'settings', group: 'result' }
	];

	function handleSimulate() {
		toast.success('Simulated re-run applied');
	}
</script>

<aside class="flex h-full w-60 flex-col border-r bg-card/50 backdrop-blur-xl">
	<div class="flex h-16 items-center border-b px-6">
		<div class="flex items-center gap-2">
			<div class="h-6 w-6 rounded-md bg-primary"></div>
			<span class="font-bold tracking-tight">AI BACKTEST</span>
		</div>
	</div>

	<div class="flex-1 space-y-6 overflow-y-auto p-4">
		<!-- Main Group -->
		<div class="space-y-1">
			<h3 class="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
				{m.nav_group_main()}
			</h3>
			{#each mainSections as section (section.id)}
				<NavItem
					{section}
					isActive={appState.activeSection === section.id}
					onClick={() => (appState.activeSection = section.id)}
				/>
			{/each}
		</div>

		<!-- Result Group -->
		<div class="space-y-1">
			<h3 class="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
				{m.nav_group_result()}
			</h3>
			{#each resultSections as section (section.id)}
				<NavItem
					{section}
					isActive={appState.activeSection === section.id}
					onClick={() => (appState.activeSection = section.id)}
				/>
			{/each}
		</div>

		<!-- Live Controls -->
		<div class="mt-auto space-y-4 border-t pt-6">
			<div class="space-y-2">
				<Label class="text-[10px] text-muted-foreground uppercase">Total Return (%)</Label>
				<Input bind:value={appState.simulatedMetrics.totalReturn} class="h-8 text-xs" />
			</div>
			<div class="space-y-2">
				<Label class="text-[10px] text-muted-foreground uppercase">Max Drawdown (%)</Label>
				<Input bind:value={appState.simulatedMetrics.maxDrawdown} class="h-8 text-xs" />
			</div>
			<div class="space-y-2">
				<Label class="text-[10px] text-muted-foreground uppercase">Win Rate (%)</Label>
				<Input bind:value={appState.simulatedMetrics.winRate} class="h-8 text-xs" />
			</div>
			<Button variant="outline" size="sm" class="w-full text-xs" onclick={handleSimulate}>
				Simulate Re-run
			</Button>
		</div>
	</div>
</aside>
