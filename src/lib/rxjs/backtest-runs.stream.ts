/**
 * RxJS BehaviorSubject stream for backtest runs.
 *
 * Wraps GET /v1/backtest-runs (alias: listBacktestRuns) from the Zodios client.
 * Uses switchMap so rapid successive refresh() calls cancel in-flight requests.
 *
 * Feature: 022-rxjs-state-management (US3)
 */
import { BehaviorSubject, Subject, EMPTY, from } from 'rxjs';
import { switchMap, catchError, tap, finalize } from 'rxjs/operators';
import type { PagedBacktestRunResult } from '$lib/zodios';
import { apiClient } from '$lib/zodios/client.js';

// ── Internal subjects ─────────────────────────────────────────────────────────

const _refresh$ = new Subject<void>();

/** Latest successful API response, or null before first fetch / after error. */
export const backtestRunsData$ = new BehaviorSubject<PagedBacktestRunResult | null>(null);

/** Last error from the API, or null when data is current. */
export const backtestRunsError$ = new BehaviorSubject<Error | null>(null);

/** True while a fetch is in flight. */
export const backtestRunsLoading$ = new BehaviorSubject<boolean>(false);

// ── Pipeline ──────────────────────────────────────────────────────────────────

_refresh$
	.pipe(
		switchMap(() => {
			backtestRunsLoading$.next(true);
			return from(apiClient.listBacktestRuns() as Promise<PagedBacktestRunResult>).pipe(
				tap((result) => {
					backtestRunsData$.next(result);
					backtestRunsError$.next(null);
				}),
				catchError((err: unknown) => {
					backtestRunsError$.next(err instanceof Error ? err : new Error(String(err)));
					return EMPTY;
				}),
				finalize(() => backtestRunsLoading$.next(false))
			);
		})
	)
	.subscribe();

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Trigger a new fetch of the backtest runs list.
 * Cancels any in-flight request (switchMap semantics).
 * Does NOT fire automatically on module import.
 */
export function refreshBacktestRuns(): void {
	_refresh$.next();
}
