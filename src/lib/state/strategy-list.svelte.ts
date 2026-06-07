/**
 * Svelte 5 rune-based state module for the strategy list.
 *
 * Feature: 021-zodios-api-client (US3, US4)
 */
import type { PagedStrategyResult, ErrorResponse } from '$lib/zodios';

class StrategyListState {
	data = $state<PagedStrategyResult | null>(null);
	loading = $state(false);
	error = $state<ErrorResponse | null>(null);
}

export const strategyListState = new StrategyListState();
