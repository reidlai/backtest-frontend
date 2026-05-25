import { z } from 'zod';
import { SentimentEventSchema } from '$lib/schemas';

type SentimentEvent = z.infer<typeof SentimentEventSchema>;

export const sampleSentimentEvents: SentimentEvent[] = [
	{
		id: 'e1',
		type: 'news',
		symbol: 'AAPL',
		date: '2024-05-18',
		headline: 'Apple reveals new AI-focused M4 chip in surprise announcement.',
		sentiment: 'positive',
		score: 0.82
	},
	{
		id: 'e2',
		type: 'earnings',
		symbol: 'NVDA',
		date: '2024-05-15',
		headline: 'NVIDIA beats Q1 estimates, raises full-year guidance on AI demand.',
		sentiment: 'positive',
		score: 0.95
	},
	{
		id: 'e3',
		type: 'fed',
		symbol: '',
		date: '2024-05-12',
		headline: 'Fed maintains interest rates, hints at potential cuts later this year.',
		sentiment: 'neutral',
		score: 0.15
	},
	{
		id: 'e4',
		type: 'macro',
		symbol: '',
		date: '2024-05-10',
		headline: 'US Inflation slows more than expected in April, CPI at 3.4%.',
		sentiment: 'positive',
		score: 0.65
	},
	{
		id: 'e5',
		type: 'insider',
		symbol: 'MSFT',
		date: '2024-05-08',
		headline: 'Microsoft CEO Satya Nadella sells $30M in shares via 10b5-1 plan.',
		sentiment: 'neutral',
		score: -0.12
	},
	{
		id: 'e6',
		type: 'social',
		symbol: 'TSLA',
		date: '2024-05-05',
		headline: 'Tesla FSD v12 receives mixed reviews on social media platforms.',
		sentiment: 'negative',
		score: -0.45
	},
	{
		id: 'e7',
		type: 'news',
		symbol: 'GOOGL',
		date: '2024-05-02',
		headline: 'Alphabet integrates Gemini AI into core search results.',
		sentiment: 'positive',
		score: 0.58
	},
	{
		id: 'e8',
		type: 'earnings',
		symbol: 'AMZN',
		date: '2024-04-28',
		headline: 'Amazon Web Services growth accelerates to 17% in latest quarter.',
		sentiment: 'positive',
		score: 0.74
	},
	{
		id: 'e9',
		type: 'macro',
		symbol: '',
		date: '2024-04-25',
		headline: 'China GDP growth exceeds targets at 5.3% for Q1.',
		sentiment: 'positive',
		score: 0.42
	},
	{
		id: 'e10',
		type: 'insider',
		symbol: 'META',
		date: '2024-04-22',
		headline: 'Meta CTO Andrew Bosworth sells 15,000 shares.',
		sentiment: 'neutral',
		score: -0.05
	},
	{
		id: 'e11',
		type: 'news',
		symbol: 'NFLX',
		date: '2024-04-18',
		headline: 'Netflix to stop reporting subscriber numbers starting in 2025.',
		sentiment: 'negative',
		score: -0.62
	},
	{
		id: 'e12',
		type: 'social',
		symbol: 'GME',
		date: '2024-04-15',
		headline: 'GameStop mentions surge on Reddit as Roaring Kitty returns.',
		sentiment: 'positive',
		score: 0.88
	}
];
