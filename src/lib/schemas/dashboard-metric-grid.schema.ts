import { z } from 'zod';

export const DashboardMetricGridSchema = z.object({});

export type DashboardMetricGridState = z.infer<typeof DashboardMetricGridSchema>;
