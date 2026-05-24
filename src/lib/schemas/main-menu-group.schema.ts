import { z } from 'zod';
import { NavSectionSchema } from './types/nav-section.schema';

export const MainMenuGroupSchema = z.object({
	mainSections: z.array(NavSectionSchema).default([])
});

export type MainMenuGroupState = z.infer<typeof MainMenuGroupSchema>;
