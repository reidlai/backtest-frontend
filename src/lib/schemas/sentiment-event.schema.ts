import { z } from 'zod';

export const SentimentEventTypeSchema = z.enum([
	'news',
	'earnings',
	'fed',
	'macro',
	'insider',
	'social'
]);

export const SentimentSchema = z.enum(['positive', 'negative', 'neutral']);

export const SentimentEventSchema = z.object({
	id: z.string(),
	type: SentimentEventTypeSchema,
	symbol: z.string(),
	date: z.string(),
	headline: z.string(),
	sentiment: SentimentSchema,
	score: z.number()
});
