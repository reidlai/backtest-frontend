/**
 * Svelte 5 rune-based state module for the API health status.
 *
 * Feature: 021-zodios-api-client (US3, US4)
 */
import type { HealthResponse, ErrorResponse } from '$lib/zodios';

class HealthState {
	data = $state<HealthResponse | null>(null);
	loading = $state(false);
	error = $state<ErrorResponse | null>(null);
}

export const healthState = new HealthState();
