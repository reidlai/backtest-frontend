import type { AIReview, ResourceUsage, Strategy } from '../types';

export const sampleStrategy: Strategy = {
	market: 'US Equities — S&P 500',
	fundamentalFilter: 'PE Ratio < 25 AND ROIC > 15% AND Revenue Growth > 10%',
	technicalFilter: 'Price > MA(200) AND RSI(14) < 70 AND Volume > 1M',
	backtestPeriod: '2020-01-01 to 2024-12-31',
	positionSize: 'Equal weight, max 20 positions, 5% max per symbol',
	riskRule: '10% hard stop-loss, 25% trailing take-profit'
};

export const sampleAIReview: AIReview = {
	grade: 'B+',
	confidence: 'medium',
	riskFlags: [
		{
			id: 'r1',
			label: 'Overfitting Risk',
			severity: 'medium',
			description: 'Strategy parameters may be too tightly tuned to historical volatility spikes.'
		},
		{
			id: 'r2',
			label: 'Regime Dependency',
			severity: 'medium',
			description:
				'Performance relies heavily on Bull Trend regimes; high drawdown during Bear Trends.'
		},
		{
			id: 'r3',
			label: 'Survivorship Bias',
			severity: 'low',
			description: 'Universe definition should be checked for historical membership accuracy.'
		}
	]
};

export const sampleResourceUsage: ResourceUsage = {
	tokensUsed: 4250,
	tokensTotal: 10000,
	backtestsUsed: 3,
	backtestsTotal: 10,
	queuePosition: 0,
	estimatedRuntime: '~42s',
	complexityScore: 67,
	planImpact: 'medium'
};
