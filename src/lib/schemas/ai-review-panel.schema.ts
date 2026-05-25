import { z } from 'zod';
import { AIReviewSchema } from './ai-review.schema';

export const AIReviewPanelSchema = z.object({
	review: AIReviewSchema.default({ grade: '', confidence: 'low', riskFlags: [] })
});
