import { z } from 'zod';

export const NavigationSidebarSchema = z.object({});

export type NavigationSidebarState = z.infer<typeof NavigationSidebarSchema>;
