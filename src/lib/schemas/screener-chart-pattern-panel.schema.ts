import { z } from 'zod';

export const SCREENER_PATTERNS = [
	'Head & Shoulders',
	'Double Top',
	'Bull Flag',
	'Cup & Handle',
	'Triangle',
	'Wedge',
	'MACD Cross',
	'RSI Oversold'
] as const;

export const ScreenerChartPatternPanelSchema = z.object({
	availablePatterns: z.array(z.string()).default([...SCREENER_PATTERNS]),
	selectedPatterns: z.array(z.string()).default([])
});

export type ScreenerChartPatternPanelState = z.infer<typeof ScreenerChartPatternPanelSchema>;
