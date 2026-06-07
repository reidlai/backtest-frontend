import { z } from 'zod';
import {
	MetricTileSchema,
	PerfSummaryItemSchema,
	RegimeBreakdownSchema,
	TimeSeriesPointSchema
} from '$lib/schemas';
import { BacktestResultResourceSchema } from '$lib/zodios/schemas/backtest-result.schema';

type MetricTile = z.infer<typeof MetricTileSchema>;
type PerfSummaryItem = z.infer<typeof PerfSummaryItemSchema>;
type RegimeBreakdown = z.infer<typeof RegimeBreakdownSchema>;
type TimeSeriesPoint = z.infer<typeof TimeSeriesPointSchema>;
type BacktestResultResource = z.infer<typeof BacktestResultResourceSchema>;

const generateTimeSeries = (
	startValue: number,
	length: number,
	volatility: number
): TimeSeriesPoint[] => {
	const series: TimeSeriesPoint[] = [];
	let currentValue = startValue;
	const startDate = new Date('2020-01-01');

	for (let i = 0; i < length; i++) {
		const change = (Math.random() - 0.45) * volatility; // Slight upward bias
		currentValue *= 1 + change;
		const date = new Date(startDate);
		date.setMonth(startDate.getMonth() + i);
		series.push({
			date: date.toISOString().split('T')[0],
			value: parseFloat(currentValue.toFixed(2))
		});
	}
	return series;
};

const generateDrawdown = (equityCurve: TimeSeriesPoint[]): TimeSeriesPoint[] => {
	let peak = -Infinity;
	return equityCurve.map((p) => {
		if (p.value > peak) peak = p.value;
		const dd = (p.value - peak) / peak;
		return { date: p.date, value: parseFloat((dd * 100).toFixed(2)) };
	});
};

const legacyEquityCurve = generateTimeSeries(100000, 48, 0.05);

// Derive arrays for the OpenAPI equity_curve shape from the legacy time-series
const equityTimestamps = legacyEquityCurve.map((p) => `${p.date}T00:00:00Z`);
const equityValues = legacyEquityCurve.map((p) => p.value);
const legacyDrawdowns = generateDrawdown(legacyEquityCurve);

/**
 * Sample BacktestResultResource shaped mock, conforming to the OpenAPI
 * `BacktestResultResourceSchema` (snake_case fields, sub-schemas).
 * Used by Storybook stories for StrategyOutputPanel.
 */
export const sampleBacktestResult: BacktestResultResource = {
	id: '550e8400-e29b-41d4-a716-446655440002',
	run_id: '550e8400-e29b-41d4-a716-446655440000',
	label: 'US RSI Mean-Reversion (2020–2024)',
	created_at: '2024-12-31T23:59:59Z',
	performance_metrics: {
		total_return_pct: 0.428,
		annualized_return_pct: 0.184,
		max_drawdown_pct: 0.182,
		sharpe_ratio: 1.84,
		sortino_ratio: 2.45,
		win_rate: 0.583,
		profit_factor: 1.92,
		total_trades: 41
	},
	equity_curve: {
		timestamps: equityTimestamps,
		equity_values: equityValues,
		cash_balances: equityValues.map((v) => v * 0.1),
		drawdowns: legacyDrawdowns.map((p) => p.value / 100)
	},
	execution_log: [],
	signal_history: []
};

export const defaultMetricTiles: MetricTile[] = [
	{ id: 'total-return', label: 'Total Return', value: '42.8', unit: '%', order: 0 },
	{ id: 'net-profit', label: 'Net Profit', value: '42,800', unit: '$', order: 1 },
	{ id: 'max-drawdown', label: 'Max Drawdown', value: '-18.2', unit: '%', order: 2 },
	{ id: 'sharpe-ratio', label: 'Sharpe Ratio', value: '1.84', unit: '', order: 3 },
	{ id: 'win-rate', label: 'Win Rate', value: '58.3', unit: '%', order: 4 },
	{ id: 'profit-factor', label: 'Profit Factor', value: '1.92', unit: 'x', order: 5 },
	{ id: 'volatility', label: 'Volatility', value: '14.6', unit: '%', order: 6 },
	{ id: 'exposure-time', label: 'Exposure Time', value: '73.2', unit: '%', order: 7 }
];

export const sampleRegimeBreakdown: RegimeBreakdown[] = [
	{ regime: 'Bull Trend', returnPct: 24.5, maxDrawdown: -5.2, winRate: 65.4, tradeCount: 12 },
	{ regime: 'Bear Trend', returnPct: -8.4, maxDrawdown: -18.2, winRate: 42.1, tradeCount: 8 },
	{ regime: 'High Volatility', returnPct: 12.2, maxDrawdown: -12.5, winRate: 52.8, tradeCount: 15 },
	{ regime: 'Low Volatility', returnPct: 4.5, maxDrawdown: -2.1, winRate: 58.2, tradeCount: 6 }
];

export const samplePerfSummary: PerfSummaryItem[] = [
	{ label: 'Total Trades', value: '41' },
	{ label: 'Avg Trade Net Profit', value: '$1,043.90' },
	{ label: 'Avg Win', value: '$2,842.15' },
	{ label: 'Avg Loss', value: '-$1,245.80' },
	{ label: 'Largest Win', value: '$8,432.00' },
	{ label: 'Largest Loss', value: '-$3,120.50' },
	{ label: 'Max Consecutive Wins', value: '5' },
	{ label: 'Max Consecutive Losses', value: '3' },
	{ label: 'Expectancy', value: '0.42' },
	{ label: 'Recovery Factor', value: '2.35' },
	{ label: 'Calmar Ratio', value: '2.12' },
	{ label: 'Sortino Ratio', value: '2.45' },
	{ label: 'Annualized Return', value: '18.4%' },
	{ label: 'Max Adverse Excursion', value: '4.2%' },
	{ label: 'Max Favorable Excursion', value: '12.8%' }
];
