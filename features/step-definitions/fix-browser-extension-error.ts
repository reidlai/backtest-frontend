/**
 * Step definition stubs for features/fix-browser-extension-error.feature.
 *
 * @cucumber/cucumber is not installed in this project. All scenarios are
 * implemented as Playwright tests in:
 *   e2e-tests/fix-browser-extension-error.e2e.ts
 *
 * Run them with: pnpm exec playwright test fix-browser-extension-error
 *
 * This file is kept for BDD traceability (Constitution Rule 6). If a Cucumber
 * runner is added in future, replace the `pending()` stubs below with the
 * Playwright page interactions from the .e2e.ts file.
 *
 * ROOT CAUSE NOTE (confirmed in specs/009-fix-ui-runtime-errors):
 * The "message channel closed" error originates from a Chrome browser extension
 * (runtime-*.js), NOT from application code. No application fix is required.
 * These scenarios serve as regression gates to detect if future API integration
 * accidentally introduces the same error pattern from app code.
 *
 * STEP FILTER NOTE (from speckit-analyze finding A2):
 * All console error assertions MUST filter to localhost:* origin only to prevent
 * false failures from extension-injected errors. See the e2e implementation file.
 *
 * PENDING STEPS NOTE:
 * The @future-tagged US3 scenario uses `return 'pending'` (Cucumber.js convention)
 * to mark the step as skipped until API integration begins.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */

// @ts-expect-error — @cucumber/cucumber is not installed; stubs kept for traceability
import { Given, When, Then, pending } from '@cucumber/cucumber';

// ---------------------------------------------------------------------------
// US1 + US2: Home page — localhost-filtered console assertion
// ---------------------------------------------------------------------------

Then('the browser console shows no errors for route {string}', function (_route: string) {
	// Implementation: assert that the console error collector (set up in Before hook)
	// contains no entries with level 'error' originating from localhost:* only.
	// Extension-injected errors (chrome-extension://* origins) MUST be excluded.
	// See e2e-tests/fix-browser-extension-error.e2e.ts for the Playwright implementation.
	pending();
});

// ---------------------------------------------------------------------------
// US2: Reload N times step
// ---------------------------------------------------------------------------

When(
	'the user reloads {string} {int} consecutive times',
	function (_route: string, _count: number) {
		// Implementation: call page.reload() in a loop _count times.
		// After each reload, collect console errors filtered to localhost:* origin.
		// Assert no errors accumulated across all reloads.
		// See e2e-tests/fix-browser-extension-error.e2e.ts for the Playwright implementation.
		pending();
	}
);

// ---------------------------------------------------------------------------
// US3: Future API swap scenario (pending until API integration begins)
// ---------------------------------------------------------------------------

Given('the app is running with at least one component using a real async data source', function () {
	// Not yet implemented — API integration is pending.
	// When ready: configure the app to use a real API endpoint for at least one organism.
	return 'pending';
});
