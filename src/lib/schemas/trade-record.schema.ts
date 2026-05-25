import { z } from 'zod';

export const TradeDirectionSchema = z.enum(['Long', 'Short']);

export const TradeRecordSchema = z.object({
	tradeId: z.string(),
	symbol: z.string(),
	direction: TradeDirectionSchema,
	entryDate: z.string(),
	entryPrice: z.number(),
	exitDate: z.string(),
	exitPrice: z.number(),
	quantity: z.number(),
	commission: z.number(),
	slippage: z.number(),
	netPnl: z.number(),
	returnPct: z.number(),
	holdingDays: z.number(),
	exitReason: z.string()
});
