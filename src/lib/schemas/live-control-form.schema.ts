import { z } from 'zod';

export const LiveControlFormSchema = z.object({});

export type LiveControlFormState = z.infer<typeof LiveControlFormSchema>;
