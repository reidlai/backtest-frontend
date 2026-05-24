import { z } from 'zod';
import { RiskFlagSchema } from './risk-flag.schema';

export const AIReviewSchema = z.object({
	grade: z.string(),
	confidence: z.enum(['high', 'medium', 'low']),
	riskFlags: z.array(RiskFlagSchema)
});

export type AIReview = z.infer<typeof AIReviewSchema>;
