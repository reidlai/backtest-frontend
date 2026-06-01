import { z } from 'zod';

export const BacktestRunsCardSchema = z
	.object({
		backtestsUsed: z.number().int().nonnegative().default(0),
		backtestsTotal: z.number().int().positive().default(10),
		planName: z.string().min(1).default('Pro Plan')
	})
	.refine((data) => data.backtestsUsed <= data.backtestsTotal, {
		message: 'backtestsUsed must be less than or equal to backtestsTotal',
		path: ['backtestsUsed']
	});

export type BacktestRunsCardState = z.infer<typeof BacktestRunsCardSchema>;
