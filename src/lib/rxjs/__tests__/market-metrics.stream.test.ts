/**
 * Unit tests for market-metrics RxJS stream.
 * Feature: 022-rxjs-state-management (US1, T011)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firstValueFrom, skip } from 'rxjs';

// ── Mock the Zodios client before importing the stream ─────────────────────────
vi.mock('$lib/zodios/client.js', () => ({
	apiClient: {
		listMarketMetrics: vi.fn()
	}
}));

// Import after mock is set up
import { apiClient } from '$lib/zodios/client.js';
import type { MarketMetricCollectionResult } from '$lib/zodios';

const mockCollection: MarketMetricCollectionResult = {
	as_of: '2026-06-07T20:00:00Z',
	items: [
		{
			symbol: 'VIX',
			name: 'CBOE Volatility Index',
			value: 14.25,
			change: -0.35,
			change_pct: -2.4,
			as_of: '2026-06-07T20:00:00Z',
			stale: false
		},
		{
			symbol: 'SP500',
			name: 'S&P 500',
			value: 5300,
			change: 12,
			change_pct: 0.23,
			as_of: '2026-06-07T20:00:00Z',
			stale: false
		},
		{
			symbol: 'NDX100',
			name: 'Nasdaq 100',
			value: 18500,
			change: 50,
			change_pct: 0.27,
			as_of: '2026-06-07T20:00:00Z',
			stale: false
		},
		{
			symbol: 'HSI',
			name: 'Hang Seng Index',
			value: 18000,
			change: -100,
			change_pct: -0.55,
			as_of: '2026-06-07T20:00:00Z',
			stale: false
		},
		{
			symbol: 'US10Y',
			name: 'US 10-Year Treasury',
			value: 4.25,
			change: 0.02,
			change_pct: 0.47,
			as_of: '2026-06-07T20:00:00Z',
			stale: false
		}
	]
};

// Re-import stream fresh for each test to reset BehaviorSubject state
async function getStream() {
	vi.resetModules();
	const mod = await import('../market-metrics.stream.js');
	return mod;
}

describe('market-metrics stream', () => {
	beforeEach(() => {
		vi.mocked(apiClient.listMarketMetrics).mockReset();
	});

	it('initialises data$ as null before any refresh()', async () => {
		const { marketMetricsData$ } = await getStream();
		const value = marketMetricsData$.getValue();
		expect(value).toBeNull();
	});

	it('initialises error$ as null', async () => {
		const { marketMetricsError$ } = await getStream();
		expect(marketMetricsError$.getValue()).toBeNull();
	});

	it('initialises loading$ as false', async () => {
		const { marketMetricsLoading$ } = await getStream();
		expect(marketMetricsLoading$.getValue()).toBe(false);
	});

	it('refresh() emits MarketMetricCollectionResult to data$', async () => {
		vi.mocked(apiClient.listMarketMetrics).mockResolvedValue(mockCollection);
		const { marketMetricsData$, refreshMarketMetrics } = await getStream();

		const emitted = firstValueFrom(marketMetricsData$.pipe(skip(1))); // skip initial null
		refreshMarketMetrics();
		const result = await emitted;

		expect(result).toEqual(mockCollection);
		expect(result?.items).toHaveLength(5);
	});

	it('error$ emits on 401; data$ retains last good value', async () => {
		vi.mocked(apiClient.listMarketMetrics)
			.mockResolvedValueOnce(mockCollection)
			.mockRejectedValueOnce(new Error('Unauthorized'));

		const { marketMetricsData$, marketMetricsError$, refreshMarketMetrics } = await getStream();

		// First fetch — success
		const firstEmit = firstValueFrom(marketMetricsData$.pipe(skip(1)));
		refreshMarketMetrics();
		await firstEmit;

		// Second fetch — error
		const errorEmit = firstValueFrom(marketMetricsError$.pipe(skip(1)));
		refreshMarketMetrics();
		await errorEmit;

		expect(marketMetricsError$.getValue()?.message).toBe('Unauthorized');
		// data$ should still hold the last good collection
		expect(marketMetricsData$.getValue()).toEqual(mockCollection);
	});

	it('error$ resets to null on successful refresh after error', async () => {
		vi.mocked(apiClient.listMarketMetrics)
			.mockRejectedValueOnce(new Error('timeout'))
			.mockResolvedValueOnce(mockCollection);

		const { marketMetricsData$, marketMetricsError$, refreshMarketMetrics } = await getStream();

		const errorEmit = firstValueFrom(marketMetricsError$.pipe(skip(1)));
		refreshMarketMetrics();
		await errorEmit;
		expect(marketMetricsError$.getValue()).not.toBeNull();

		const dataEmit = firstValueFrom(marketMetricsData$.pipe(skip(1)));
		refreshMarketMetrics();
		await dataEmit;
		expect(marketMetricsError$.getValue()).toBeNull();
	});

	it('loading$ transitions false → true → false around a fetch', async () => {
		let resolveCall!: (v: MarketMetricCollectionResult) => void;
		vi.mocked(apiClient.listMarketMetrics).mockImplementation(
			() =>
				new Promise((res) => {
					resolveCall = res;
				})
		);

		const { marketMetricsLoading$, refreshMarketMetrics } = await getStream();
		const emissions: boolean[] = [marketMetricsLoading$.getValue()];
		const sub = marketMetricsLoading$.subscribe((v) => emissions.push(v));

		refreshMarketMetrics();
		// Give the microtask queue a tick to start the pipeline
		await new Promise((r) => setTimeout(r, 0));
		expect(marketMetricsLoading$.getValue()).toBe(true);

		resolveCall(mockCollection);
		await new Promise((r) => setTimeout(r, 0));
		expect(marketMetricsLoading$.getValue()).toBe(false);

		sub.unsubscribe();
	});

	it('stale flag is preserved in emitted data', async () => {
		const staleCollection: MarketMetricCollectionResult = {
			...mockCollection,
			items: [{ ...mockCollection.items[0], stale: true }, ...mockCollection.items.slice(1)]
		};
		vi.mocked(apiClient.listMarketMetrics).mockResolvedValue(staleCollection);

		const { marketMetricsData$, refreshMarketMetrics } = await getStream();
		const emitted = firstValueFrom(marketMetricsData$.pipe(skip(1)));
		refreshMarketMetrics();
		const result = await emitted;

		expect(result?.items[0].stale).toBe(true);
	});
});
