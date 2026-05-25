import { z } from 'zod';

export const StrategySchema = z.object({
	market: z.string(),
	fundamentalFilter: z.string(),
	technicalFilter: z.string(),
	backtestPeriod: z.string(),
	positionSize: z.string(),
	riskRule: z.string()
});

