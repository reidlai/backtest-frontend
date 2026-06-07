/**
 * RxJS BehaviorSubject stream for the strategy list.
 *
 * Wraps GET /v1/strategies (alias: listStrategies) from the Zodios client.
 * Uses switchMap so rapid successive refresh() calls cancel in-flight requests.
 *
 * Feature: 022-rxjs-state-management (US2)
 */
import { BehaviorSubject, Subject, EMPTY, from } from 'rxjs';
import { switchMap, catchError, tap, finalize } from 'rxjs/operators';
import type { PagedStrategyResult } from '$lib/zodios';
import { apiClient } from '$lib/zodios/client.js';

// ── Internal subjects ─────────────────────────────────────────────────────────

const _refresh$ = new Subject<void>();

/** Latest successful API response, or null before first fetch / after error. */
export const strategiesData$ = new BehaviorSubject<PagedStrategyResult | null>(null);

/** Last error from the API, or null when data is current. */
export const strategiesError$ = new BehaviorSubject<Error | null>(null);

/** True while a fetch is in flight. */
export const strategiesLoading$ = new BehaviorSubject<boolean>(false);

// ── Pipeline ──────────────────────────────────────────────────────────────────

_refresh$
	.pipe(
		switchMap(() => {
			strategiesLoading$.next(true);
			return from(apiClient.listStrategies() as Promise<PagedStrategyResult>).pipe(
				tap((result) => {
					strategiesData$.next(result);
					strategiesError$.next(null);
				}),
				catchError((err: unknown) => {
					strategiesError$.next(err instanceof Error ? err : new Error(String(err)));
					return EMPTY;
				}),
				finalize(() => strategiesLoading$.next(false))
			);
		})
	)
	.subscribe();

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Trigger a new fetch of the strategy list.
 * Cancels any in-flight request (switchMap semantics).
 * Does NOT fire automatically on module import.
 */
export function refreshStrategies(): void {
	_refresh$.next();
}
