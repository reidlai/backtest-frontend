import { z } from 'zod';

export const TopBarSchema = z.object({});

export type TopBarState = z.infer<typeof TopBarSchema>;
