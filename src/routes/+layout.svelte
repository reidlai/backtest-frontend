<script lang="ts">
	import type { Snapshot } from '@sveltejs/kit';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { Toaster } from '$lib/components/ui/sonner';
	import NavigationSidebar from '$lib/components/organisms/NavigationSidebar.svelte';
	import AIReviewSidebar from '$lib/components/organisms/AIReviewSidebar.svelte';
	import { z } from 'zod';
	import { AIChatPanelSchema, ChatMessageSchema } from '$lib/schemas';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount, onDestroy } from 'svelte';
	// ── RxJS stream imports (feature 022) ────────────────────────────────────────
	import {
		marketMetricsData$,
		marketMetricsError$,
		marketMetricsLoading$,
		refreshMarketMetrics
	} from '$lib/rxjs/market-metrics.stream.js';
	import { marketMetricState } from '$lib/state/market-metric.svelte.js';
	import {
		strategiesData$,
		strategiesError$,
		strategiesLoading$,
		refreshStrategies
	} from '$lib/rxjs/strategies.stream.js';
	import { strategyListState } from '$lib/state/strategy-list.svelte.js';
	import {
		backtestRunsData$,
		backtestRunsError$,
		backtestRunsLoading$,
		refreshBacktestRuns
	} from '$lib/rxjs/backtest-runs.stream.js';
	import { backtestRunState } from '$lib/state/backtest-run.svelte.js';

	type ChatMessage = z.infer<typeof ChatMessageSchema>;

	let { children } = $props();

	let messages = $state<ChatMessage[]>([]);
	let chatInput = $state('');

	// ── RxJS → Svelte $state subscription glue ───────────────────────────────────
	// Subscriptions are collected for cleanup in onDestroy.
	// T010 → T013 → T016: all layout glue is co-located here sequentially.
	let _subs: { unsubscribe(): void }[] = [];

	onMount(() => {
		_subs.push(
			// US1 — Market Metrics
			marketMetricsData$.subscribe((d) => {
				marketMetricState.data = d;
			}),
			marketMetricsError$.subscribe((e) => {
				marketMetricState.error = e;
			}),
			marketMetricsLoading$.subscribe((l) => {
				marketMetricState.loading = l;
			}),
			// US2 — Strategies (T013: after T010, same file — sequential)
			strategiesData$.subscribe((d) => {
				strategyListState.data = d;
			}),
			strategiesError$.subscribe((e) => {
				// Error type from stream (Error | null) is adapted to ErrorResponse | null.
				// Existing state module type is unchanged per FR-008; cast via unknown.
				strategyListState.error = e as unknown as typeof strategyListState.error;
			}),
			strategiesLoading$.subscribe((l) => {
				strategyListState.loading = l;
			}),
			// US3 — Backtest Runs (T016: after T013, same file — sequential)
			backtestRunsData$.subscribe((d) => {
				backtestRunState.list = d;
			}),
			backtestRunsError$.subscribe((e) => {
				// Same error type adaptation as strategies above.
				backtestRunState.error = e as unknown as typeof backtestRunState.error;
			}),
			backtestRunsLoading$.subscribe((l) => {
				backtestRunState.loading = l;
			})
		);
		refreshMarketMetrics();
		refreshStrategies();
		refreshBacktestRuns();
	});

	onDestroy(() => {
		_subs.forEach((s) => s.unsubscribe());
		_subs = [];
	});

	export const snapshot: Snapshot = {
		capture: () => ({ messages: messages.slice(-50), chatInput }),
		restore: (value: unknown) => {
			const result = AIChatPanelSchema.safeParse(value);
			if (result.success) {
				messages = result.data.messages;
				chatInput = result.data.chatInput;
			}
		}
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen w-full min-w-[1280px] overflow-hidden bg-background text-foreground">
	<!-- Left Sidebar (fixed 240px) -->
	<NavigationSidebar />

	<!-- Main Content (flexible) -->
	<div class="relative flex flex-1 flex-col overflow-y-auto">
		{@render children()}
	</div>

	<!-- Right Sidebar (fixed 280px) -->
	<AIReviewSidebar bind:messages bind:chatInput />
</div>

<Toaster position="top-right" />

<!-- SEO Locale links -->
<div style="display:none" aria-hidden="true">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
