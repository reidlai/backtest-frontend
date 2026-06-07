import { z } from 'zod';

/**
 * Four parallel arrays of equal length representing the portfolio equity over time.
 */
export const EquityCurveSchema = z.object({
	timestamps: z.array(z.string()),
	equity_values: z.array(z.number()),
	cash_balances: z.array(z.number()),
	drawdowns: z.array(z.number())
});

export type EquityCurve = z.infer<typeof EquityCurveSchema>;
