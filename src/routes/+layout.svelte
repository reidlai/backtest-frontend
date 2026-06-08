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
	import type { ErrorResponse } from '$lib/zodios';
	import { useMockData } from '$lib/env.js';
	import { sampleMarketMetricCollection } from '$lib/shared-mockdata/market.js';

	type ChatMessage = z.infer<typeof ChatMessageSchema>;

	// Adapts a native Error (from RxJS catchError) to the RFC 7807 ErrorResponse
	// shape expected by strategy and backtest-run state modules.
	function toErrorResponse(e: Error | null): ErrorResponse | null {
		if (!e) return null;
		const status =
			typeof (e as unknown as { status?: number }).status === 'number'
				? (e as unknown as { status: number }).status
				: 500;
		return {
			type: 'urn:error:stream',
			title: e.name || 'Error',
			status,
			detail: e.message,
			instance: 'urn:request:unknown'
		};
	}

	let { children } = $props();

	let messages = $state<ChatMessage[]>([]);
	let chatInput = $state('');

	// ── RxJS → Svelte $state subscription glue ───────────────────────────────────
	// Subscriptions are collected for cleanup in onDestroy.
	// T010 → T013 → T016: all layout glue is co-located here sequentially.
	let _subs: { unsubscribe(): void }[] = [];

	onMount(() => {
		if (useMockData) {
			// Mock mode: seed the three RxJS-backed state modules from shared-mockdata.
			// Organisms that don't yet have RxJS streams continue using their own mock imports.
			marketMetricState.data = sampleMarketMetricCollection;
			// strategyListState and backtestRunState remain null — their organisms
			// are responsible for their own mock seeding until API integration is complete.
			return;
		}

		// API mode: wire RxJS streams → Svelte $state and trigger initial fetches.
		// Collect subscriptions in _subs so they can be disposed in onDestroy to prevent memory leaks
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
				strategyListState.error = toErrorResponse(e);
			}),
			strategiesLoading$.subscribe((l) => {
				strategyListState.loading = l;
			}),
			// US3 — Backtest Runs (T016: after T013, same file — sequential)
			backtestRunsData$.subscribe((d) => {
				backtestRunState.list = d;
			}),
			backtestRunsError$.subscribe((e) => {
				backtestRunState.error = toErrorResponse(e);
			}),
			backtestRunsLoading$.subscribe((l) => {
				backtestRunState.loading = l;
			})
		);

		// Trigger initial fetches for all streams
		refreshMarketMetrics();
		refreshStrategies();
		refreshBacktestRuns();
	});

	onDestroy(() => {
		// Clean up subscriptions to prevent memory leaks
		_subs.forEach((s) => s.unsubscribe());
		_subs = [];
	});

	// Layout snapshot to restore chat state when returning to routes under this layout via browser history navigation.
	export const snapshot: Snapshot = {
		// Save only last 50 messages to prevent excessive memory usage
		capture: () => ({ messages: messages.slice(-50), chatInput }),

		// Restore chat messages and input
		restore: (value: unknown) => {
			const result = AIChatPanelSchema.safeParse(value);
			if (result.success) {
				messages = result.data.messages;
				chatInput = result.data.chatInput;
			}
		}
	};
</script>

<!-- Inject elements (like the favicon link) directly into the HTML <head> -->
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

<!-- 
	SEO Locale links: Renders hidden links for each supported language. 
	This allows search engine crawlers to discover and index all localized versions 
	of the current page during server-side rendering (SSR). 
-->
<div style="display:none" aria-hidden="true">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
