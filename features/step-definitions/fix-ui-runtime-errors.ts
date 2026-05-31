/**
 * Step definition stubs for features/fix-ui-runtime-errors.feature.
 *
 * @cucumber/cucumber is not installed in this project. All scenarios are
 * implemented as Playwright tests in:
 *   e2e-tests/fix-ui-runtime-errors.e2e.ts  (to be created)
 *
 * Run them with: pnpm exec playwright test fix-ui-runtime-errors
 *
 * This file is kept for BDD traceability (Constitution Rule 6). If a Cucumber
 * runner is added in future, replace the `pending()` stubs below with the
 * Playwright page interactions from the .e2e.ts file.
 *
 * ANALYSIS NOTE (from speckit-analyze finding U1):
 * Scenario 3 ("simulatedMetrics is populated") requires injecting state into the
 * AppState singleton. Since AppState is a module-level singleton, `page.evaluate`
 * cannot mutate it directly across module boundaries. When implementing the real
 * Playwright e2e test, use one of these strategies:
 *   A) Expose `window.__appState = appState` in a dev-only block in app.svelte.ts
 *      and access via page.evaluate(() => window.__appState.simulatedMetrics = ...)
 *   B) Navigate via the backtest flow to populate state before the assertion
 *   C) Use Playwright's page.route() to intercept the API call that populates state
 */
/* eslint-disable @typescript-eslint/no-unused-vars */

// @ts-expect-error — @cucumber/cucumber is not installed; stubs kept for traceability
import { Given, When, Then, pending } from '@cucumber/cucumber';

// ---------------------------------------------------------------------------
// Shared navigation steps (used by US1 and US2)
// ---------------------------------------------------------------------------

Given('the app is running', function () {
	// No-op: app is assumed running via pnpm dev / Playwright baseURL
});

When(
	'the user navigates to {string} {int} consecutive times',
	function (_path: string, _count: number) {
		// Implementation: use Playwright page.goto(baseURL + path) in a loop
		// Assert console errors collected via page.on('console', ...) are empty
		pending();
	}
);

When('the user navigates to {string}', function (_path: string) {
	// Reuses the single-navigation variant; count defaults to 1
	// Implementation: page.goto(baseURL + path)
	pending();
});

// ---------------------------------------------------------------------------
// US1: Technical Screener — zero uncaught errors
// ---------------------------------------------------------------------------

Then('the browser console shows no uncaught errors', function () {
	// Implementation: assert that the console error collector (set up in Before hook)
	// contains no entries with level 'error' after navigation completes
	pending();
});

// ---------------------------------------------------------------------------
// US2: Performance Result — default metric values
// ---------------------------------------------------------------------------

Given('no backtest has been run', function () {
	// No-op: the default AppState has simulatedMetrics all set to 0 (FR-003)
	// No setup required; this is the initial state of the app
});

Then(
	'the page renders metric tiles with default values of 0 and no TypeError appears in the browser console',
	function () {
		// Implementation:
		//   1. Assert page.waitForSelector('[data-testid="metric-tile"]', { timeout: 2000 }) succeeds (SC-003)
		//   2. Assert console error collector is empty (SC-002)
		//   3. Assert at least one metric tile is visible with value '0'
		pending();
	}
);

// ---------------------------------------------------------------------------
// US2: Performance Result — populated metric values
// ---------------------------------------------------------------------------

Given(
	'simulatedMetrics is populated with totalReturn {float}, maxDrawdown {float}, winRate {float}',
	function (_totalReturn: number, _maxDrawdown: number, _winRate: number) {
		// Implementation note: see file header — choose strategy A, B, or C
		// to inject state before navigation
		pending();
	}
);

Then('the metric tiles display the corresponding values', function () {
	// Implementation: assert tile text content matches the injected values
	pending();
});
