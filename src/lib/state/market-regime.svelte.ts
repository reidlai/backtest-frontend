import { z } from 'zod';
import { MarketRegimeSchema } from '$lib/schemas/market-regime.schema';

type MarketRegime = z.infer<typeof MarketRegimeSchema>;

class MarketRegimeState {
	regimes = $state<MarketRegime[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
}

export const marketRegimeState = new MarketRegimeState();
