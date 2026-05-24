import { z } from 'zod';

export const SentimentEventSchema = z.object({
	id: z.string(),
	type: z.enum(['news', 'earnings', 'fed', 'macro', 'insider', 'social']),
	symbol: z.string(),
	date: z.string(),
	headline: z.string(),
	sentiment: z.enum(['positive', 'negative', 'neutral']),
	score: z.number()
});

export type SentimentEvent = z.infer<typeof SentimentEventSchema>;
