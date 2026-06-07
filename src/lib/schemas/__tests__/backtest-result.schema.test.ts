/**
 * Created for feature 021-zodios-api-client: tests the re-export compatibility
 * adapter in src/lib/schemas/backtest-result.schema.ts.
 *
 * BacktestResultSchema (alias) and BacktestResultResourceSchema both point to the
 * canonical BacktestResultResourceSchema from src/lib/zodios/schemas/backtest-result.schema.ts.
 */
import { describe, it, expect } from 'vitest';
import {
	BacktestResultSchema,
	BacktestResultResourceSchema,
	PagedBacktestResultResourceSchema
} from '../backtest-result.schema';

const performanceExample = {
	annualized_return_pct: 0.19,
	max_drawdown_pct: 0.12,
	profit_factor: 1.7,
	sharpe_ratio: 1.8,
	sortino_ratio: 2.1,
	total_return_pct: 0.23,
	total_trades: 42,
	win_rate: 0.55
};

const equityCurveExample = {
	cash_balances: [10000, 11500],
	drawdowns: [0, -0.02],
	equity_values: [100000, 101500],
	timestamps: ['2024-01-02T00:00:00Z', '2024-01-03T00:00:00Z']
};

const tradeExample = {
	entry_price: 175.5,
	entry_timestamp: '2024-03-01T09:30:00Z',
	exit_price: 182.3,
	exit_reason: 'TAKE_PROFIT',
	exit_timestamp: '2024-03-12T16:00:00Z',
	pnl_absolute: 68,
	pnl_pct: 0.039,
	quantity: 10,
	side: 'LONG',
	symbol: 'AAPL',
	trade_id: 'trade-001'
};

const signalExample = {
	action: 'BUY',
	conviction_score: 0.85,
	symbol: 'AAPL',
	timestamp: '2024-03-01T16:00:00Z'
};

const backtestResultExample = {
	created_at: '2026-06-04T10:35:00Z',
	equity_curve: equityCurveExample,
	execution_log: [tradeExample],
	id: '550e8400-e29b-41d4-a716-446655440002',
	label: 'AAPL',
	performance_metrics: performanceExample,
	run_id: '550e8400-e29b-41d4-a716-446655440000',
	signal_history: [signalExample]
};

describe('BacktestResultSchema (compatibility alias)', () => {
	it('is a re-export of BacktestResultResourceSchema', () => {
		// Both should parse the same payload identically
		const r1 = BacktestResultSchema.parse(backtestResultExample);
		const r2 = BacktestResultResourceSchema.parse(backtestResultExample);
		expect(r1).toEqual(r2);
	});

	it('parses a full BacktestResultResource payload', () => {
		const result = BacktestResultSchema.parse(backtestResultExample);
		expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440002');
		expect(result.label).toBe('AAPL');
		expect(result.performance_metrics.total_return_pct).toBe(0.23);
		expect(result.equity_curve.timestamps).toHaveLength(2);
		expect(result.execution_log[0].trade_id).toBe('trade-001');
		expect(result.signal_history[0].action).toBe('BUY');
	});

	it('rejects the old monolithic camelCase shape', () => {
		const oldShape = {
			totalReturn: 0.23,
			netProfit: 15000,
			maxDrawdown: 0.12,
			sharpeRatio: 1.8,
			winRate: 0.55,
			profitFactor: 1.7,
			volatility: 0.15,
			exposureTime: 0.8,
			equityCurve: [],
			drawdownSeries: [],
			monthlyReturns: [],
			benchmarkSeries: []
		};
		expect(() => BacktestResultSchema.parse(oldShape)).toThrow();
	});
});

describe('BacktestResultResourceSchema', () => {
	it('rejects a payload missing performance_metrics', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { performance_metrics: _, ...without } = backtestResultExample;
		expect(() => BacktestResultResourceSchema.parse(without)).toThrow();
	});

	it('rejects a payload missing equity_curve', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { equity_curve: _, ...without } = backtestResultExample;
		expect(() => BacktestResultResourceSchema.parse(without)).toThrow();
	});
});

describe('PagedBacktestResultResourceSchema', () => {
	it('parses a paged list', () => {
		const result = PagedBacktestResultResourceSchema.parse({
			total: 1,
			items: [backtestResultExample]
		});
		expect(result.total).toBe(1);
		expect(result.items[0].label).toBe('AAPL');
	});
});
