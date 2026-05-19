import type { MarketMetric, MarketRegime, ScreenerResult } from '../types';

export const sampleMarketMetrics: MarketMetric[] = [
	{
		id: 'sp500',
		label: 'S&P 500',
		value: '5,234.18',
		delta: '+1.2%',
		deltaPositive: true,
		category: 'market'
	},
	{
		id: 'nasdaq',
		label: 'Nasdaq 100',
		value: '18,345.62',
		delta: '+1.5%',
		deltaPositive: true,
		category: 'market'
	},
	{
		id: 'hsi',
		label: 'Hang Seng',
		value: '16,723.10',
		delta: '-0.8%',
		deltaPositive: false,
		category: 'market'
	},
	{
		id: 'vix',
		label: 'VIX',
		value: '14.25',
		delta: '-2.4%',
		deltaPositive: true,
		category: 'risk'
	},
	{
		id: 'us10y',
		label: 'US 10Y Yield',
		value: '4.32%',
		delta: '+0.05%',
		deltaPositive: false,
		category: 'rates'
	},
	{
		id: 'saved_strats',
		label: 'Strategies Saved',
		value: '12',
		delta: '+2',
		deltaPositive: true,
		category: 'usage'
	},
	{
		id: 'bt_queue',
		label: 'Backtest Queue',
		value: '3',
		delta: '0',
		deltaPositive: true,
		category: 'usage'
	},
	{
		id: 'alerts',
		label: 'Active Alerts',
		value: '5',
		delta: '+1',
		deltaPositive: false,
		category: 'usage'
	}
];

export const sampleMarketRegimes: MarketRegime[] = [
	{
		id: 'bull_trend',
		name: 'Bull Trend',
		status: 'active',
		logicDescription: 'Strong upward momentum with low volatility. MA(50) > MA(200).',
		indicators: ['RSI > 60', 'MACD Bullish', 'Low VIX']
	},
	{
		id: 'bear_trend',
		name: 'Bear Trend',
		status: 'inactive',
		logicDescription: 'Downward momentum with increasing volatility. MA(50) < MA(200).',
		indicators: ['RSI < 40', 'MACD Bearish', 'High VIX']
	},
	{
		id: 'high_vol',
		name: 'High Volatility',
		status: 'warning',
		logicDescription: 'Rapid price swings and wide ranges. VIX above 25.',
		indicators: ['ATR Expansion', 'Bollinger Band Width High']
	},
	{
		id: 'low_vol',
		name: 'Low Volatility',
		status: 'inactive',
		logicDescription: 'Tight trading ranges and low price movement.',
		indicators: ['ATR Compression', 'VIX below 15']
	},
	{
		id: 'risk_on',
		name: 'Risk-On',
		status: 'active',
		logicDescription: 'Capital flowing into equities and high-yield assets.',
		indicators: ['High Beta Outperforming', 'Copper/Gold Ratio Up']
	},
	{
		id: 'risk_off',
		name: 'Risk-Off',
		status: 'inactive',
		logicDescription: 'Flight to safety in bonds and defensive assets.',
		indicators: ['Utilities Outperforming', 'Dollar Index Up']
	},
	{
		id: 'inflation_shock',
		name: 'Inflation Shock',
		status: 'inactive',
		logicDescription: 'Rapid rise in consumer prices affecting real returns.',
		indicators: ['CPI/PPI Upside Surprise', 'Commodities Up']
	}
];

export const sampleScreenerResults: ScreenerResult[] = [
	{
		symbol: 'AAPL',
		name: 'Apple Inc.',
		peRatio: 28.4,
		evEbitda: 22.1,
		fcfYield: 3.8,
		roic: 55.2,
		revenueGrowth: 4.5,
		epsGrowth: 8.2,
		score: 88
	},
	{
		symbol: 'MSFT',
		name: 'Microsoft Corp.',
		peRatio: 34.2,
		evEbitda: 25.4,
		fcfYield: 3.2,
		roic: 32.1,
		revenueGrowth: 15.6,
		epsGrowth: 18.4,
		score: 92
	},
	{
		symbol: 'NVDA',
		name: 'NVIDIA Corp.',
		peRatio: 72.1,
		evEbitda: 54.3,
		fcfYield: 2.1,
		roic: 68.4,
		revenueGrowth: 125.2,
		epsGrowth: 280.4,
		score: 95
	},
	{
		symbol: 'GOOGL',
		name: 'Alphabet Inc.',
		peRatio: 22.5,
		evEbitda: 14.8,
		fcfYield: 4.5,
		roic: 28.5,
		revenueGrowth: 11.2,
		epsGrowth: 14.5,
		score: 85
	},
	{
		symbol: 'META',
		name: 'Meta Platforms Inc.',
		peRatio: 24.8,
		evEbitda: 16.2,
		fcfYield: 4.8,
		roic: 24.2,
		revenueGrowth: 25.4,
		epsGrowth: 68.2,
		score: 89
	},
	{
		symbol: 'TSLA',
		name: 'Tesla Inc.',
		peRatio: 45.2,
		evEbitda: 32.1,
		fcfYield: 1.5,
		roic: 18.2,
		revenueGrowth: 18.5,
		epsGrowth: 12.4,
		score: 72
	},
	{
		symbol: 'AMZN',
		name: 'Amazon.com Inc.',
		peRatio: 42.1,
		evEbitda: 21.4,
		fcfYield: 2.8,
		roic: 15.4,
		revenueGrowth: 12.8,
		epsGrowth: 45.2,
		score: 82
	},
	{
		symbol: 'BRK.B',
		name: 'Berkshire Hathaway',
		peRatio: 12.4,
		evEbitda: 10.2,
		fcfYield: 6.5,
		roic: 9.8,
		revenueGrowth: 5.2,
		epsGrowth: 8.4,
		score: 78
	},
	{
		symbol: 'V',
		name: 'Visa Inc.',
		peRatio: 28.5,
		evEbitda: 20.4,
		fcfYield: 4.2,
		roic: 24.5,
		revenueGrowth: 10.5,
		epsGrowth: 15.2,
		score: 84
	},
	{
		symbol: 'JPM',
		name: 'JPMorgan Chase',
		peRatio: 10.8,
		evEbitda: 8.5,
		fcfYield: 7.2,
		roic: 14.2,
		revenueGrowth: 8.4,
		epsGrowth: 12.5,
		score: 80
	}
];
