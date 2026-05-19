<script lang="ts">
	import { setContext } from 'svelte';
	import { appState } from '$lib/state/app.svelte';
	import TopBar from '$lib/components/organisms/TopBar.svelte';
	import DashboardSection from '$lib/components/organisms/DashboardSection.svelte';
	import StrategyBuilderSection from '$lib/components/organisms/StrategyBuilderSection.svelte';
	import FundamentalScreenerSection from '$lib/components/organisms/FundamentalScreenerSection.svelte';
	import TechnicalScreenerSection from '$lib/components/organisms/TechnicalScreenerSection.svelte';
	import BacktestEngineSection from '$lib/components/organisms/BacktestEngineSection.svelte';
	import PerformanceResultSection from '$lib/components/organisms/PerformanceResultSection.svelte';
	import MarketRegimeSection from '$lib/components/organisms/MarketRegimeSection.svelte';
	import SentimentEventsSection from '$lib/components/organisms/SentimentEventsSection.svelte';
	import TradeLogSection from '$lib/components/organisms/TradeLogSection.svelte';
	import SettingsBillingSection from '$lib/components/organisms/SettingsBillingSection.svelte';

	let strategyBuilderRef = $state<{ reset?: () => void; getStrategyConfig?: () => unknown }>();
	let backtestRef = $state<{ reset?: () => void }>();

	// Expose refs to components like TopBar and AIReviewSidebar
	setContext('organism-refs', {
		get strategyBuilder() {
			return strategyBuilderRef;
		},
		get backtest() {
			return backtestRef;
		}
	});
</script>

<div class="flex h-full flex-col overflow-hidden">
	<TopBar />

	<div class="relative flex-1 overflow-y-auto bg-background/50">
		<div
			class="animate-in duration-150 fade-in"
			style:display={appState.activeSection === 'dashboard' ? 'block' : 'none'}
		>
			<DashboardSection />
		</div>

		<div
			class="animate-in duration-150 fade-in"
			style:display={appState.activeSection === 'strategy-builder' ? 'block' : 'none'}
		>
			<StrategyBuilderSection bind:this={strategyBuilderRef} />
		</div>

		<div
			class="animate-in duration-150 fade-in"
			style:display={appState.activeSection === 'fundamental-screener' ? 'block' : 'none'}
		>
			<FundamentalScreenerSection />
		</div>

		<div
			class="animate-in duration-150 fade-in"
			style:display={appState.activeSection === 'technical-screener' ? 'block' : 'none'}
		>
			<TechnicalScreenerSection />
		</div>

		<div
			class="animate-in duration-150 fade-in"
			style:display={appState.activeSection === 'backtest-engine' ? 'block' : 'none'}
		>
			<BacktestEngineSection bind:this={backtestRef} />
		</div>

		<div
			class="animate-in duration-150 fade-in"
			style:display={appState.activeSection === 'performance-result' ? 'block' : 'none'}
		>
			<PerformanceResultSection />
		</div>

		<div
			class="animate-in duration-150 fade-in"
			style:display={appState.activeSection === 'market-regime' ? 'block' : 'none'}
		>
			<MarketRegimeSection />
		</div>

		<div
			class="animate-in duration-150 fade-in"
			style:display={appState.activeSection === 'sentiment-events' ? 'block' : 'none'}
		>
			<SentimentEventsSection />
		</div>

		<div
			class="animate-in duration-150 fade-in"
			style:display={appState.activeSection === 'trade-log' ? 'block' : 'none'}
		>
			<TradeLogSection />
		</div>

		<div
			class="animate-in duration-150 fade-in"
			style:display={appState.activeSection === 'settings-billing' ? 'block' : 'none'}
		>
			<SettingsBillingSection />
		</div>
	</div>
</div>
