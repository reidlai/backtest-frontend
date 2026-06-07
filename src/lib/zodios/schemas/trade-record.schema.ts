import { z } from 'zod';

/**
 * Single completed round-trip trade record.
 * All fields are snake_case per OpenAPI spec.
 */
export const TradeRecordSchema = z.object({
	trade_id: z.string(),
	symbol: z.string(),
	side: z.string(),
	entry_timestamp: z.string(),
	exit_timestamp: z.string(),
	entry_price: z.number(),
	exit_price: z.number(),
	quantity: z.number(),
	pnl_absolute: z.number(),
	pnl_pct: z.number(),
	exit_reason: z.string().optional()
});

export type TradeRecord = z.infer<typeof TradeRecordSchema>;
