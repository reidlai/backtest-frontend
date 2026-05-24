import { z } from 'zod';
import { NavSectionSchema } from './types/nav-section.schema';

export const ResultMenuGroupSchema = z.object({
	resultSections: z.array(NavSectionSchema).default([])
});

export type ResultMenuGroupState = z.infer<typeof ResultMenuGroupSchema>;
