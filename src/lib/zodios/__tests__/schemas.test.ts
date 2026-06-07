import { describe, it, expect } from 'vitest';
import { HealthResponseSchema } from '$lib/zodios/schemas/health.schema.js';
import { ActionResponseSchema } from '$lib/zodios/schemas/action-response.schema.js';
import { SignalRecordSchema } from '$lib/zodios/schemas/signal-record.schema.js';
import { PerformanceMetricsSchema } from '$lib/zodios/schemas/performance-metrics.schema.js';
import { EquityCurveSchema } from '$lib/zodios/schemas/equity-curve.schema.js';
import { TradeRecordSchema } from '$lib/zodios/schemas/trade-record.schema.js';
import {
	EntryConfigSchema,
	ExitConfigSchema,
	LiquidityFilterSchema,
	StrategyConfigSchema
} from '$lib/zodios/schemas/strategy-config.schema.js';
import {
	StrategyResultSchema,
	PagedStrategyResultSchema
} from '$lib/zodios/schemas/strategy.schema.js';
import {
	BacktestConfigSchema,
	BacktestRunResultSchema,
	PagedBacktestRunResultSchema
} from '$lib/zodios/schemas/backtest-run.schema.js';
import {
	BacktestResultResourceSchema,
	PagedBacktestResultResourceSchema
} from '$lib/zodios/schemas/backtest-result.schema.js';
import {
	BacktestRunServiceCreateRequestBodySchema,
	StrategyServiceUpsertRequestBodySchema,
	StrategyServiceReplaceRequestBodySchema,
	StrategyServicePatchRequestBodySchema
} from '$lib/zodios/schemas/request-bodies.schema.js';
import { ErrorResponseSchema } from '$lib/zodios/schemas/error-response.schema.js';

// ── OpenAPI example payloads ───────────────────────────────────────────────────

const healthExample = { status: 'ok', version: '1.0.0' };

const actionResponseExample = {
	run_id: 'bcc99093-eab6-4b16-b915-f07f32c4c0a1',
	status: 'Eveniet ab.'
};

const signalExample = {
	action: 'BUY',
	conviction_score: 0.85,
	symbol: 'AAPL',
	timestamp: '2024-03-01T16:00:00Z'
};

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

const entryConfigExample = {
	commission_model: 'percentage',
	commission_rate: 0.001,
	execution_timing: 'open_of_bar_t1',
	order_type: 'market',
	slippage_model: 'fixed'
};

const exitConfigExample = {
	stop_loss_type: 'percentage',
	take_profit_type: 'percentage',
	trailing_stop_enabled: false,
	time_based_exit_enabled: false
};

const strategyConfigExample = {
	entry_config: entryConfigExample,
	exit_config: exitConfigExample
};

const strategyResultExample = {
	config: strategyConfigExample,
	id: '550e8400-e29b-41d4-a716-446655440001',
	name: 'US RSI Mean-Reversion',
	status: 'active',
	version: '2026-06-04T10:30:45.123456789Z'
};

const backtestConfigExample = {
	commission_rate: 0.001,
	end_date: '2024-12-31',
	initial_capital: 100000,
	slippage_model: 'fixed',
	start_date: '2024-01-01',
	symbols: ['AAPL', 'MSFT']
};

const backtestRunExample = {
	config: backtestConfigExample,
	id: '550e8400-e29b-41d4-a716-446655440000',
	status: 'pending',
	strategy_ids: ['550e8400-e29b-41d4-a716-446655440001'],
	strategy_versions: ['2026-06-04T10:30:45.123456789Z']
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

const errorExample = {
	detail: 'Strategy not found.',
	instance: 'urn:request:abc-123',
	status: 404,
	title: 'Not Found',
	type: 'https://api.example.com/problems/not-found'
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('ErrorResponseSchema', () => {
	it('parses a valid RFC 7807 error payload', () => {
		const result = ErrorResponseSchema.parse(errorExample);
		expect(result.status).toBe(404);
		expect(result.type).toBe('https://api.example.com/problems/not-found');
	});

	it('rejects a payload missing required fields', () => {
		expect(() => ErrorResponseSchema.parse({ title: 'bad' })).toThrow();
	});
});

describe('HealthResponseSchema', () => {
	it('parses the OpenAPI health example', () => {
		const result = HealthResponseSchema.parse(healthExample);
		expect(result.status).toBe('ok');
		expect(result.version).toBe('1.0.0');
	});
});

describe('ActionResponseSchema', () => {
	it('parses the OpenAPI action response example', () => {
		const result = ActionResponseSchema.parse(actionResponseExample);
		expect(result.run_id).toBe('bcc99093-eab6-4b16-b915-f07f32c4c0a1');
	});
});

describe('SignalRecordSchema', () => {
	it('parses the OpenAPI signal example', () => {
		const result = SignalRecordSchema.parse(signalExample);
		expect(result.action).toBe('BUY');
		expect(result.conviction_score).toBe(0.85);
	});
});

describe('PerformanceMetricsSchema', () => {
	it('parses the OpenAPI performance metrics example', () => {
		const result = PerformanceMetricsSchema.parse(performanceExample);
		expect(result.total_return_pct).toBe(0.23);
		expect(result.total_trades).toBe(42);
	});
});

describe('EquityCurveSchema', () => {
	it('parses the OpenAPI equity curve example', () => {
		const result = EquityCurveSchema.parse(equityCurveExample);
		expect(result.timestamps).toHaveLength(2);
		expect(result.equity_values[0]).toBe(100000);
	});
});

describe('TradeRecordSchema', () => {
	it('parses the OpenAPI trade example with snake_case fields', () => {
		const result = TradeRecordSchema.parse(tradeExample);
		expect(result.trade_id).toBe('trade-001');
		expect(result.side).toBe('LONG');
		expect(result.pnl_absolute).toBe(68);
		expect(result.exit_reason).toBe('TAKE_PROFIT');
	});

	it('accepts a trade without exit_reason (optional)', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { exit_reason: _, ...withoutReason } = tradeExample;
		const result = TradeRecordSchema.parse(withoutReason);
		expect(result.exit_reason).toBeUndefined();
	});

	it('rejects a trade missing required fields', () => {
		expect(() => TradeRecordSchema.parse({ trade_id: 'x' })).toThrow();
	});
});

describe('EntryConfigSchema', () => {
	it('parses entry config example', () => {
		const result = EntryConfigSchema.parse(entryConfigExample);
		expect(result.order_type).toBe('market');
	});
});

describe('ExitConfigSchema', () => {
	it('parses exit config example', () => {
		const result = ExitConfigSchema.parse(exitConfigExample);
		expect(result.trailing_stop_enabled).toBe(false);
	});
});

describe('LiquidityFilterSchema', () => {
	it('parses an empty liquidity filter (all optional)', () => {
		const result = LiquidityFilterSchema.parse({});
		expect(result.min_price).toBeUndefined();
	});
});

describe('StrategyConfigSchema', () => {
	it('parses strategy config with entry and exit configs', () => {
		const result = StrategyConfigSchema.parse(strategyConfigExample);
		expect(result.entry_config.commission_rate).toBe(0.001);
		expect(result.liquidity_filter).toBeUndefined();
	});
});

describe('StrategyResultSchema', () => {
	it('parses the OpenAPI strategy result example', () => {
		const result = StrategyResultSchema.parse(strategyResultExample);
		expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440001');
		expect(result.config.entry_config.order_type).toBe('market');
	});
});

describe('PagedStrategyResultSchema', () => {
	it('parses a paged list of strategy results', () => {
		const result = PagedStrategyResultSchema.parse({
			total: 1,
			items: [strategyResultExample]
		});
		expect(result.total).toBe(1);
		expect(result.items[0].name).toBe('US RSI Mean-Reversion');
	});
});

describe('BacktestConfigSchema', () => {
	it('parses the OpenAPI backtest config example', () => {
		const result = BacktestConfigSchema.parse(backtestConfigExample);
		expect(result.initial_capital).toBe(100000);
		expect(result.symbols).toContain('AAPL');
	});
});

describe('BacktestRunResultSchema', () => {
	it('parses the OpenAPI backtest run result example', () => {
		const result = BacktestRunResultSchema.parse(backtestRunExample);
		expect(result.status).toBe('pending');
		expect(result.strategy_ids).toHaveLength(1);
	});
});

describe('PagedBacktestRunResultSchema', () => {
	it('parses a paged list of backtest run results', () => {
		const result = PagedBacktestRunResultSchema.parse({
			total: 1,
			items: [backtestRunExample]
		});
		expect(result.total).toBe(1);
	});
});

describe('BacktestResultResourceSchema', () => {
	it('parses the OpenAPI backtest result resource example', () => {
		const result = BacktestResultResourceSchema.parse(backtestResultExample);
		expect(result.label).toBe('AAPL');
		expect(result.performance_metrics.sharpe_ratio).toBe(1.8);
		expect(result.execution_log[0].trade_id).toBe('trade-001');
		expect(result.signal_history[0].action).toBe('BUY');
	});
});

describe('PagedBacktestResultResourceSchema', () => {
	it('parses a paged list of backtest results', () => {
		const result = PagedBacktestResultResourceSchema.parse({
			total: 1,
			items: [backtestResultExample]
		});
		expect(result.items[0].id).toBe('550e8400-e29b-41d4-a716-446655440002');
	});
});

describe('BacktestRunServiceCreateRequestBodySchema', () => {
	it('parses a valid create request body', () => {
		const result = BacktestRunServiceCreateRequestBodySchema.parse({
			strategy_ids: ['550e8400-e29b-41d4-a716-446655440001'],
			strategy_versions: ['2026-06-04T10:30:45.123456789Z'],
			config: backtestConfigExample
		});
		expect(result.strategy_ids).toHaveLength(1);
	});
});

describe('StrategyServiceUpsertRequestBodySchema', () => {
	it('parses a valid upsert request body', () => {
		const result = StrategyServiceUpsertRequestBodySchema.parse({
			name: 'US RSI Mean-Reversion',
			config: strategyConfigExample
		});
		expect(result.name).toBe('US RSI Mean-Reversion');
	});
});

describe('StrategyServiceReplaceRequestBodySchema', () => {
	it('parses a valid replace request body', () => {
		const result = StrategyServiceReplaceRequestBodySchema.parse({
			name: 'Updated Strategy',
			config: strategyConfigExample
		});
		expect(result.name).toBe('Updated Strategy');
	});
});

describe('StrategyServicePatchRequestBodySchema', () => {
	it('parses a partial patch body (all fields optional)', () => {
		const result = StrategyServicePatchRequestBodySchema.parse({});
		expect(result.name).toBeUndefined();
	});

	it('parses a patch body with only name', () => {
		const result = StrategyServicePatchRequestBodySchema.parse({ name: 'New Name' });
		expect(result.name).toBe('New Name');
	});
});

// ── Market Metric Schemas ─────────────────────────────────────────────────────

import {
	MarketMetricResultSchema,
	MarketMetricCollectionResultSchema
} from '$lib/zodios/schemas/market-metric.schema.js';

const marketMetricExample = {
	symbol: 'VIX',
	name: 'CBOE Volatility Index',
	value: 14.25,
	change: -0.35,
	change_pct: -2.4,
	as_of: '2026-06-07T20:00:00Z',
	stale: false
};

describe('MarketMetricResultSchema', () => {
	it('parses a valid MarketMetricResult (OpenAPI example payload)', () => {
		const result = MarketMetricResultSchema.parse(marketMetricExample);
		expect(result.symbol).toBe('VIX');
		expect(result.value).toBe(14.25);
		expect(result.change).toBe(-0.35);
		expect(result.change_pct).toBe(-2.4);
		expect(result.stale).toBe(false);
		expect(result.as_of).toBe('2026-06-07T20:00:00Z');
	});

	it('throws ZodError when required field symbol is missing', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { symbol: _symbol, ...withoutSymbol } = marketMetricExample;
		expect(() => MarketMetricResultSchema.parse(withoutSymbol)).toThrow();
	});

	it('throws ZodError when value is a string instead of number', () => {
		expect(() =>
			MarketMetricResultSchema.parse({ ...marketMetricExample, value: '14.25' })
		).toThrow();
	});
});

describe('MarketMetricCollectionResultSchema', () => {
	it('parses a valid collection with five items', () => {
		const payload = {
			items: [
				marketMetricExample,
				{ ...marketMetricExample, symbol: 'SP500', name: 'S&P 500' },
				{ ...marketMetricExample, symbol: 'NDX100', name: 'Nasdaq 100' },
				{ ...marketMetricExample, symbol: 'HSI', name: 'Hang Seng Index' },
				{ ...marketMetricExample, symbol: 'US10Y', name: 'US 10-Year Treasury' }
			],
			as_of: '2026-06-07T20:00:00Z'
		};
		const result = MarketMetricCollectionResultSchema.parse(payload);
		expect(result.items).toHaveLength(5);
		expect(result.as_of).toBe('2026-06-07T20:00:00Z');
	});

	it('throws ZodError when items is missing', () => {
		expect(() =>
			MarketMetricCollectionResultSchema.parse({ as_of: '2026-06-07T20:00:00Z' })
		).toThrow();
	});

	it('parses stale:true correctly', () => {
		const result = MarketMetricResultSchema.parse({ ...marketMetricExample, stale: true });
		expect(result.stale).toBe(true);
	});
});
