import { z } from 'zod';

/**
 * RFC 7807 Problem Details error response.
 * Returned for all error status codes: 400, 401, 404, 409, 410, 422, 5xx.
 * All five fields are required.
 */
export const ErrorResponseSchema = z.object({
	/** URI identifying the problem type. */
	type: z.string(),
	/** Human-readable summary of the problem type. */
	title: z.string(),
	/** HTTP status code as integer. */
	status: z.number().int(),
	/** Human-readable explanation of this specific occurrence. */
	detail: z.string(),
	/** URI of the specific occurrence (e.g., urn:request:{X-Request-ID}). */
	instance: z.string()
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
