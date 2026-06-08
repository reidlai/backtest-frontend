/**
 * Unit tests for backtest-runs RxJS stream.
 * Feature: 022-rxjs-state-management (US3, T017)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firstValueFrom, skip } from 'rxjs';

vi.mock('$lib/zodios/client.js', () => ({
	apiClient: {
		listBacktestRuns: vi.fn()
	}
}));

import { apiClient } from '$lib/zodios/client.js';
import type { PagedBacktestRunResult } from '$lib/zodios';

const mockRun = {
	id: 'run-001',
	strategy_ids: ['550e8400-e29b-41d4-a716-446655440001'],
	strategy_versions: ['2026-06-04T10:30:45.123456789Z'],
	status: 'completed' as const,
	config: {} as never
};

const mockPaged: PagedBacktestRunResult = { total: 1, items: [mockRun] };

async function getStream() {
	vi.resetModules();
	return await import('../backtest-runs.stream.js');
}

describe('backtest-runs stream', () => {
	beforeEach(() => {
		vi.mocked(apiClient.listBacktestRuns).mockReset();
	});

	it('initialises data$ as null', async () => {
		const { backtestRunsData$ } = await getStream();
		expect(backtestRunsData$.getValue()).toBeNull();
	});

	it('initialises error$ as null', async () => {
		const { backtestRunsError$ } = await getStream();
		expect(backtestRunsError$.getValue()).toBeNull();
	});

	it('refresh() emits PagedBacktestRunResult to data$', async () => {
		vi.mocked(apiClient.listBacktestRuns).mockResolvedValue(mockPaged);
		const { backtestRunsData$, refreshBacktestRuns } = await getStream();

		const emitted = firstValueFrom(backtestRunsData$.pipe(skip(1)));
		refreshBacktestRuns();
		const result = await emitted;

		expect(result?.items).toHaveLength(1);
		expect(result?.items[0].id).toBe('run-001');
	});

	it('error path sets backtestRunsError$ with the error message', async () => {
		const err = Object.assign(new Error('Unauthorized'), { status: 401 });
		vi.mocked(apiClient.listBacktestRuns).mockRejectedValue(err);

		const { backtestRunsError$, refreshBacktestRuns } = await getStream();

		const errorEmit = firstValueFrom(backtestRunsError$.pipe(skip(1)));
		refreshBacktestRuns();
		await errorEmit;

		expect(backtestRunsError$.getValue()?.message).toBe('Unauthorized');
	});

	it('refresh() after creation emits updated list with new run', async () => {
		const updatedPaged: PagedBacktestRunResult = {
			total: 2,
			items: [mockRun, { ...mockRun, id: 'run-002', status: 'pending' as const }]
		};
		vi.mocked(apiClient.listBacktestRuns)
			.mockResolvedValueOnce(mockPaged)
			.mockResolvedValueOnce(updatedPaged);

		const { backtestRunsData$, refreshBacktestRuns } = await getStream();

		const firstEmit = firstValueFrom(backtestRunsData$.pipe(skip(1)));
		refreshBacktestRuns();
		await firstEmit;
		expect(backtestRunsData$.getValue()?.items).toHaveLength(1);

		const secondEmit = firstValueFrom(backtestRunsData$.pipe(skip(1)));
		refreshBacktestRuns();
		await secondEmit;
		expect(backtestRunsData$.getValue()?.items).toHaveLength(2);
	});
});
