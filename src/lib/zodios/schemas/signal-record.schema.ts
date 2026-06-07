import { z } from 'zod';

export const SignalRecordSchema = z.object({
	timestamp: z.string(),
	symbol: z.string(),
	action: z.string(),
	conviction_score: z.number()
});

export type SignalRecord = z.infer<typeof SignalRecordSchema>;
