/**
 * Svelte 5 rune-based state module for market metrics.
 *
 * This module holds Svelte $state properties that are populated by
 * layout-level subscription glue (src/routes/+layout.svelte onMount).
 * It MUST NOT import from rxjs or $lib/rxjs — it is an RxJS-free sink.
 *
 * Feature: 022-rxjs-state-management (US1)
 */
import type { MarketMetricCollectionResult } from '$lib/zodios';

class MarketMetricState {
	data = $state<MarketMetricCollectionResult | null>(null);
	loading = $state(false);
	error = $state<Error | null>(null);
}

export const marketMetricState = new MarketMetricState();
