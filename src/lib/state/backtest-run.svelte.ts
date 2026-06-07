/**
 * Svelte 5 rune-based state module for backtest runs and their results.
 *
 * Feature: 021-zodios-api-client (US3, US4)
 */
import type {
	PagedBacktestRunResult,
	PagedBacktestResultResource,
	ErrorResponse
} from '$lib/zodios';

class BacktestRunState {
	list = $state<PagedBacktestRunResult | null>(null);
	loading = $state(false);
	error = $state<ErrorResponse | null>(null);
	results = $state<PagedBacktestResultResource | null>(null);
	resultsLoading = $state(false);
	resultsError = $state<ErrorResponse | null>(null);
}

export const backtestRunState = new BacktestRunState();
