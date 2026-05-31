import { z } from 'zod';
import { BacktestResultSchema } from './backtest-result.schema';

export const StrategyOutputPanelSchema = z.object({
	result: BacktestResultSchema.nullable().default(null),
	isLoading: z.boolean().default(false),
	error: z.string().nullable().default(null)
});
