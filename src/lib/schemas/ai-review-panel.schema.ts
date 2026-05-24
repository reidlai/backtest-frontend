import { z } from 'zod';
import { AIReviewSchema } from '$lib/schemas/types';

export const AIReviewPanelSchema = z.object({
	review: AIReviewSchema.default({ grade: '', confidence: 'low', riskFlags: [] })
});

export type AIReviewPanelState = z.infer<typeof AIReviewPanelSchema>;
