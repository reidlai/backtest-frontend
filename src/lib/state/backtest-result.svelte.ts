/**
 * Svelte 5 rune-based state module for a single backtest result.
 *
 * Feature: 021-zodios-api-client (US3, US4)
 */
import type { BacktestResultResource, ErrorResponse } from '$lib/zodios';

class BacktestResultState {
	data = $state<BacktestResultResource | null>(null);
	loading = $state(false);
	error = $state<ErrorResponse | null>(null);
}

export const backtestResultState = new BacktestResultState();
