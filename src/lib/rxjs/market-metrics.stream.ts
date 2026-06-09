/**
 * RxJS BehaviorSubject stream for market metrics.
 *
 * Wraps GET /v1/market-metrics (alias: listMarketMetrics) from the Zodios client.
 * Uses switchMap so rapid successive refresh() calls cancel in-flight requests.
 *
 * Usage:
 *   import { marketMetricsData$, marketMetricsError$, marketMetricsLoading$, refreshMarketMetrics } from '$lib/rxjs';
 *
 * Feature: 022-rxjs-state-management (US1)
 */
import { BehaviorSubject, Subject, EMPTY, from } from 'rxjs';
import { switchMap, catchError, tap, finalize } from 'rxjs/operators';
import type { MarketMetricCollectionResult } from '$lib/zodios';
import { apiClient } from '$lib/zodios/client.js';
import { logger } from './logger.js';

// ── Internal subjects ─────────────────────────────────────────────────────────

const _refresh$ = new Subject<void>();

/** Latest successful API response, or null before first fetch / after error. */
export const marketMetricsData$ = new BehaviorSubject<MarketMetricCollectionResult | null>(null);

/** Last error from the API, or null when data is current. */
export const marketMetricsError$ = new BehaviorSubject<Error | null>(null);

/** True while a fetch is in flight. */
export const marketMetricsLoading$ = new BehaviorSubject<boolean>(false);

// ── Pipeline ──────────────────────────────────────────────────────────────────

_refresh$
	.pipe(
		switchMap(() => {
			marketMetricsLoading$.next(true);
			return from(apiClient.listMarketMetrics() as Promise<MarketMetricCollectionResult>).pipe(
				tap((result) => {
					marketMetricsData$.next(result);
					marketMetricsError$.next(null);
					logger.debug(
						{ resource: 'market-metrics', count: result.items?.length ?? 0 },
						'fetch ok'
					);
				}),
				catchError((err: unknown) => {
					const error = err instanceof Error ? err : new Error(String(err));
					marketMetricsError$.next(error);
					logger.warn({ resource: 'market-metrics', message: error.message }, 'fetch error');
					return EMPTY;
				}),
				finalize(() => marketMetricsLoading$.next(false))
			);
		})
	)
	.subscribe();

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Trigger a new fetch of all market metrics.
 * Cancels any in-flight request (switchMap semantics).
 * Does NOT fire automatically on module import.
 */
export function refreshMarketMetrics(): void {
	_refresh$.next();
}
