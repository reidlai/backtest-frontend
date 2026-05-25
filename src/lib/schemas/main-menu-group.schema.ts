import { z } from 'zod';
import { NavSectionSchema } from './nav-section.schema';

export const MainMenuGroupSchema = z.object({
	mainSections: z.array(NavSectionSchema).default([])
});
