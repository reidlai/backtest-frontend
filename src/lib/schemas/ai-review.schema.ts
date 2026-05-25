import { z } from 'zod';
import { RiskFlagSchema } from './risk-flag.schema';

export const ConfidenceLevelSchema = z.enum(['high', 'medium', 'low']);

export const AIReviewSchema = z.object({
	grade: z.string(),
	confidence: ConfidenceLevelSchema,
	riskFlags: z.array(RiskFlagSchema)
});
