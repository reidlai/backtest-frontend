import { z } from 'zod';

export const TREND_OPTIONS = ['EMA(50)', 'EMA(200)', 'Supertrend'] as const;
export const MOMENTUM_OPTIONS = ['RSI(14)', 'Stochastic', 'MACD'] as const;

export const ScreenerIndicatorSelectionPanelSchema = z.object({
	trendIndicator: z.string().default('EMA(200)'),
	momentumIndicator: z.string().default('RSI(14)'),
	trendOptions: z.array(z.string()).default([...TREND_OPTIONS]),
	momentumOptions: z.array(z.string()).default([...MOMENTUM_OPTIONS])
});

export type ScreenerIndicatorSelectionPanelState = z.infer<
	typeof ScreenerIndicatorSelectionPanelSchema
>;
