import { z } from 'zod';
import {
	BacktestResultSchema,
	MetricTileSchema,
	RegimeBreakdownSchema,
	TimeSeriesPointSchema
} from '$lib/schemas';

type BacktestResult = z.infer<typeof BacktestResultSchema>;
type MetricTile = z.infer<typeof MetricTileSchema>;
type RegimeBreakdown = z.infer<typeof RegimeBreakdownSchema>;
type TimeSeriesPoint = z.infer<typeof TimeSeriesPointSchema>;

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

const equityCurve = generateTimeSeries(100000, 48, 0.05);

export const sampleBacktestResult: BacktestResult = {
	totalReturn: 42.8,
	netProfit: 42800,
	maxDrawdown: -18.2,
	sharpeRatio: 1.84,
	winRate: 58.3,
	profitFactor: 1.92,
	volatility: 14.6,
	exposureTime: 73.2,
	equityCurve: equityCurve,
	drawdownSeries: generateDrawdown(equityCurve),
	monthlyReturns: [
		{ month: 'Jan', value: 2.4 },
		{ month: 'Feb', value: -1.2 },
		{ month: 'Mar', value: 3.5 },
		{ month: 'Apr', value: 0.8 },
		{ month: 'May', value: 4.2 },
		{ month: 'Jun', value: -2.1 },
		{ month: 'Jul', value: 1.5 },
		{ month: 'Aug', value: 0.5 },
		{ month: 'Sep', value: -3.4 },
		{ month: 'Oct', value: 2.8 },
		{ month: 'Nov', value: 5.1 },
		{ month: 'Dec', value: 1.2 }
	],
	benchmarkSeries: generateTimeSeries(100000, 48, 0.04)
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

export const samplePerfSummary = [
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
