/**
 * State module tests for feature 021-zodios-api-client (US3, US4).
 *
 * Verifies that each state module:
 *   (a) exports an object with the correct initial values
 *   (b) accepts typed API payloads
 *   (c) accepts RFC 7807 ErrorResponse objects
 *
 * These tests run in the Node.js server environment (no browser, no JSDOM).
 */
import { describe, it, expect } from 'vitest';
import { strategyListState } from '../strategy-list.svelte.js';
import { backtestRunState } from '../backtest-run.svelte.js';
import { backtestResultState } from '../backtest-result.svelte.js';
import { healthState } from '../health.svelte.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockPagedStrategyResult = {
	total: 1,
	items: [
		{
			id: '550e8400-e29b-41d4-a716-446655440001',
			name: 'US RSI Mean-Reversion',
			version: '2026-06-04T10:30:45.123456789Z',
			status: 'active',
			config: {
				entry_config: {
					order_type: 'market',
					execution_timing: 'open_of_bar_t1',
					commission_model: 'percentage',
					commission_rate: 0.001,
					slippage_model: 'fixed'
				},
				exit_config: {
					stop_loss_type: 'percentage',
					take_profit_type: 'percentage',
					trailing_stop_enabled: false,
					time_based_exit_enabled: false
				}
			}
		}
	]
};

const mockErrorResponse = {
	type: 'https://api.example.com/problems/not-found',
	title: 'Not Found',
	status: 404,
	detail: 'Strategy not found.',
	instance: 'urn:request:abc-123'
};

const mockBacktestResultResource = {
	id: '550e8400-e29b-41d4-a716-446655440002',
	run_id: '550e8400-e29b-41d4-a716-446655440000',
	label: 'AAPL',
	created_at: '2026-06-04T10:35:00Z',
	performance_metrics: {
		total_return_pct: 0.23,
		annualized_return_pct: 0.19,
		max_drawdown_pct: 0.12,
		sharpe_ratio: 1.8,
		sortino_ratio: 2.1,
		win_rate: 0.55,
		profit_factor: 1.7,
		total_trades: 42
	},
	equity_curve: {
		timestamps: ['2024-01-02T00:00:00Z', '2024-01-03T00:00:00Z'],
		equity_values: [100000, 101500],
		cash_balances: [10000, 11500],
		drawdowns: [0, -0.02]
	},
	execution_log: [],
	signal_history: []
};

// ── strategyListState ─────────────────────────────────────────────────────────

describe('strategyListState', () => {
	it('starts with null data, loading=false, error=null', () => {
		expect(strategyListState.data).toBeNull();
		expect(strategyListState.loading).toBe(false);
		expect(strategyListState.error).toBeNull();
	});

	it('accepts a PagedStrategyResult payload written to .data', () => {
		strategyListState.data = mockPagedStrategyResult as typeof strategyListState.data;
		expect(strategyListState.data?.total).toBe(1);
		expect(strategyListState.data?.items[0].name).toBe('US RSI Mean-Reversion');
		// Reset
		strategyListState.data = null;
	});

	it('accepts a RFC 7807 ErrorResponse written to .error', () => {
		strategyListState.error = mockErrorResponse as typeof strategyListState.error;
		expect(strategyListState.error?.status).toBe(404);
		expect(strategyListState.error?.type).toBe('https://api.example.com/problems/not-found');
		expect(strategyListState.error?.title).toBe('Not Found');
		expect(strategyListState.error?.detail).toBe('Strategy not found.');
		expect(strategyListState.error?.instance).toBe('urn:request:abc-123');
		// Reset
		strategyListState.error = null;
	});

	it('can toggle loading flag', () => {
		strategyListState.loading = true;
		expect(strategyListState.loading).toBe(true);
		strategyListState.loading = false;
		expect(strategyListState.loading).toBe(false);
	});
});

// ── backtestRunState ──────────────────────────────────────────────────────────

describe('backtestRunState', () => {
	it('starts with all nulls and false loading flags', () => {
		expect(backtestRunState.list).toBeNull();
		expect(backtestRunState.loading).toBe(false);
		expect(backtestRunState.error).toBeNull();
		expect(backtestRunState.results).toBeNull();
		expect(backtestRunState.resultsLoading).toBe(false);
		expect(backtestRunState.resultsError).toBeNull();
	});

	it('accepts a RFC 7807 error written to .resultsError', () => {
		backtestRunState.resultsError = mockErrorResponse as typeof backtestRunState.resultsError;
		expect(backtestRunState.resultsError?.status).toBe(404);
		// Reset
		backtestRunState.resultsError = null;
	});
});

// ── backtestResultState ───────────────────────────────────────────────────────

describe('backtestResultState', () => {
	it('starts with null data, loading=false, error=null', () => {
		expect(backtestResultState.data).toBeNull();
		expect(backtestResultState.loading).toBe(false);
		expect(backtestResultState.error).toBeNull();
	});

	it('accepts a BacktestResultResource written to .data', () => {
		backtestResultState.data = mockBacktestResultResource as typeof backtestResultState.data;
		expect(backtestResultState.data?.performance_metrics.total_return_pct).toBe(0.23);
		expect(backtestResultState.data?.equity_curve.timestamps).toHaveLength(2);
		// Reset
		backtestResultState.data = null;
	});
});

// ── healthState ───────────────────────────────────────────────────────────────

describe('healthState', () => {
	it('starts with null data, loading=false, error=null', () => {
		expect(healthState.data).toBeNull();
		expect(healthState.loading).toBe(false);
		expect(healthState.error).toBeNull();
	});

	it('accepts a HealthResponse written to .data', () => {
		healthState.data = { status: 'ok', version: '1.0.0' };
		expect(healthState.data?.status).toBe('ok');
		expect(healthState.data?.version).toBe('1.0.0');
		// Reset
		healthState.data = null;
	});
});
