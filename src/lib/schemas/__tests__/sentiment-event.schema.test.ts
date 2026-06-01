import { describe, it, expect } from 'vitest';
import {
	SentimentEventSchema,
	SentimentSchema,
	SentimentEventTypeSchema
} from '../sentiment-event.schema';

describe('SentimentEventSchema', () => {
	const validEvent = {
		id: 'e1',
		type: 'news',
		symbol: 'AAPL',
		date: '2024-05-18',
		headline: 'Apple reveals new AI chip.',
		sentiment: 'positive',
		score: 0.82
	};

	it('parses a fully valid event', () => {
		const result = SentimentEventSchema.safeParse(validEvent);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.id).toBe('e1');
			expect(result.data.sentiment).toBe('positive');
		}
	});

	it('rejects an event missing the required id field', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id: _id, ...noId } = validEvent;
		const result = SentimentEventSchema.safeParse(noId);
		expect(result.success).toBe(false);
	});

	it('rejects an event with an invalid sentiment enum value', () => {
		const result = SentimentEventSchema.safeParse({ ...validEvent, sentiment: 'bullish' });
		expect(result.success).toBe(false);
	});

	it('rejects an event with an invalid type enum value', () => {
		const result = SentimentEventSchema.safeParse({ ...validEvent, type: 'unknown' });
		expect(result.success).toBe(false);
	});

	it('rejects an event where score is not a number', () => {
		const result = SentimentEventSchema.safeParse({ ...validEvent, score: 'high' });
		expect(result.success).toBe(false);
	});
});

describe('SentimentSchema', () => {
	it('accepts positive, negative, neutral', () => {
		expect(SentimentSchema.safeParse('positive').success).toBe(true);
		expect(SentimentSchema.safeParse('negative').success).toBe(true);
		expect(SentimentSchema.safeParse('neutral').success).toBe(true);
	});

	it('rejects unknown sentiment values', () => {
		expect(SentimentSchema.safeParse('bullish').success).toBe(false);
	});
});

describe('SentimentEventTypeSchema', () => {
	it('accepts all valid event types', () => {
		for (const t of ['news', 'earnings', 'fed', 'macro', 'insider', 'social']) {
			expect(SentimentEventTypeSchema.safeParse(t).success).toBe(true);
		}
	});

	it('rejects unknown event types', () => {
		expect(SentimentEventTypeSchema.safeParse('tweet').success).toBe(false);
	});
});
