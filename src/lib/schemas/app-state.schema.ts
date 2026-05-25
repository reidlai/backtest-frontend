import { z } from 'zod';

export const AppStateSchema = z.object({
	backtestPrefillSymbol: z.string().default('')
});
