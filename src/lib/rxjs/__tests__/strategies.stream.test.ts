/**
 * Unit tests for strategies RxJS stream.
 * Feature: 022-rxjs-state-management (US2, T014)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firstValueFrom, skip } from 'rxjs';

vi.mock('$lib/zodios/client.js', () => ({
	apiClient: {
		listStrategies: vi.fn()
	}
}));

import { apiClient } from '$lib/zodios/client.js';
import type { PagedStrategyResult } from '$lib/zodios';

const mockPaged: PagedStrategyResult = {
	total: 1,
	items: [
		{
			id: '550e8400-e29b-41d4-a716-446655440001',
			name: 'US RSI Mean-Reversion',
			version: '2026-06-04T10:30:45.123456789Z',
			status: 'active',
			config: {} as never
		}
	]
};

async function getStream() {
	vi.resetModules();
	return await import('../strategies.stream.js');
}

describe('strategies stream', () => {
	beforeEach(() => {
		vi.mocked(apiClient.listStrategies).mockReset();
	});

	it('initialises data$ as null', async () => {
		const { strategiesData$ } = await getStream();
		expect(strategiesData$.getValue()).toBeNull();
	});

	it('initialises error$ as null', async () => {
		const { strategiesError$ } = await getStream();
		expect(strategiesError$.getValue()).toBeNull();
	});

	it('refresh() emits PagedStrategyResult to data$', async () => {
		vi.mocked(apiClient.listStrategies).mockResolvedValue(mockPaged);
		const { strategiesData$, refreshStrategies } = await getStream();

		const emitted = firstValueFrom(strategiesData$.pipe(skip(1)));
		refreshStrategies();
		const result = await emitted;

		expect(result?.items).toHaveLength(1);
		expect(result?.items[0].name).toBe('US RSI Mean-Reversion');
	});

	it('second subscription receives last value without triggering a new call', async () => {
		vi.mocked(apiClient.listStrategies).mockResolvedValue(mockPaged);
		const { strategiesData$, refreshStrategies } = await getStream();

		const firstEmit = firstValueFrom(strategiesData$.pipe(skip(1)));
		refreshStrategies();
		await firstEmit;

		// Second subscriber — BehaviorSubject replays immediately
		const callCountBefore = vi.mocked(apiClient.listStrategies).mock.calls.length;
		const secondValue = strategiesData$.getValue();
		const callCountAfter = vi.mocked(apiClient.listStrategies).mock.calls.length;

		expect(secondValue).toEqual(mockPaged);
		expect(callCountAfter).toBe(callCountBefore); // no extra network call
	});

	it('error path sets strategiesError$ while data$ retains prior value', async () => {
		vi.mocked(apiClient.listStrategies)
			.mockResolvedValueOnce(mockPaged)
			.mockRejectedValueOnce(new Error('Forbidden'));

		const { strategiesData$, strategiesError$, refreshStrategies } = await getStream();

		const firstEmit = firstValueFrom(strategiesData$.pipe(skip(1)));
		refreshStrategies();
		await firstEmit;

		const errorEmit = firstValueFrom(strategiesError$.pipe(skip(1)));
		refreshStrategies();
		await errorEmit;

		expect(strategiesError$.getValue()?.message).toBe('Forbidden');
		expect(strategiesData$.getValue()).toEqual(mockPaged);
	});
});
