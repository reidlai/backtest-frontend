import { z } from 'zod';

export const TokenUsageCardSchema = z
	.object({
		tokensUsed: z.number().int().nonnegative().default(0),
		tokensTotal: z.number().int().positive().default(10000)
	})
	.refine((data) => data.tokensUsed <= data.tokensTotal, {
		message: 'tokensUsed must be less than or equal to tokensTotal',
		path: ['tokensUsed']
	});

export type TokenUsageCardState = z.infer<typeof TokenUsageCardSchema>;
