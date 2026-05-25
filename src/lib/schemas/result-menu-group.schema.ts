import { z } from 'zod';
import { NavSectionSchema } from './nav-section.schema';

export const ResultMenuGroupSchema = z.object({
	resultSections: z.array(NavSectionSchema).default([])
});

