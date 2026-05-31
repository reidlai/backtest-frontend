import { z } from 'zod';
import { MarketRegimeSchema } from './market-regime.schema';

export const RegimeCardsGridSchema = z.object({
	regimes: z.array(MarketRegimeSchema).default([])
});
