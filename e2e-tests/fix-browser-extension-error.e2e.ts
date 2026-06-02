/**
 * BDD scenario implementation for features/fix-browser-extension-error.feature
 * Implemented as Playwright tests (@cucumber/cucumber is not installed).
 * Covers @smoke @fix scenarios tagged for US1 and US2.
 *
 * Run with: pnpm exec playwright test fix-browser-extension-error
 *
 * ROOT CAUSE NOTE (specs/009-fix-ui-runtime-errors — Bug 2):
 * The "message channel closed" error originates from a Chrome browser extension
 * (runtime-*.js), NOT from application code. These tests serve as regression
 * gates to detect if future code changes accidentally introduce the same error.
 *
 * FILTER NOTE: All console error assertions filter to localhost:* origin to
 * exclude extension-injected errors (chrome-extension://* origins), which are
 * outside the application's control. See SC-002 in spec.md for the definition
 * of "clean browser session."
 */
import { test, expect } from '@playwright/test';

const HOME = '/';

// ── Helper: collect console errors from localhost origin only ──────────────────

function collectLocalConsoleErrors(page: import('@playwright/test').Page): () => string[] {
	const errors: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') {
			const location = msg.location();
			const url = location?.url ?? '';
			if (url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
				errors.push(msg.text());
			}
		}
	});
	// Also capture uncaught page errors (unhandledrejection, uncaught exception)
	page.on('pageerror', (err) => {
		errors.push(`[pageerror] ${err.message}`);
	});
	return () => [...errors];
}

// ── US1: Home page loads without message channel errors ───────────────────────

test.describe('@smoke @fix US1 – Home Page Loads Without Message Channel Errors', () => {
	test('Home page loads without message channel errors', async ({ page }) => {
		const getErrors = collectLocalConsoleErrors(page);

		await page.goto(HOME);
		await page.waitForLoadState('networkidle');

		const errors = getErrors();
		const channelErrors = errors.filter(
			(e) =>
				e.includes('message channel closed') ||
				e.includes('listener indicated an asynchronous response')
		);

		expect(
			channelErrors,
			`Expected no message channel errors on home page load. Got: ${channelErrors.join(', ')}`
		).toHaveLength(0);
	});

	test('Home page loads without any localhost-origin console errors', async ({ page }) => {
		const getErrors = collectLocalConsoleErrors(page);

		await page.goto(HOME);
		await page.waitForLoadState('networkidle');

		expect(
			getErrors(),
			'Expected no console errors from localhost origin on home page load'
		).toHaveLength(0);
	});
});

// ── US2: Console stays clean across 10 consecutive reloads ────────────────────

test.describe('@smoke @fix US2 – Home Page Console Stays Clean Across Reloads', () => {
	test('Home page console stays clean across 10 consecutive reloads', async ({ page }) => {
		// Initial navigation
		await page.goto(HOME);
		await page.waitForLoadState('networkidle');

		const allErrors: string[] = [];

		for (let i = 0; i < 10; i++) {
			const reloadErrors: string[] = [];

			const onConsole = (msg: import('@playwright/test').ConsoleMessage) => {
				if (msg.type() === 'error') {
					const url = msg.location()?.url ?? '';
					if (url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
						reloadErrors.push(`[reload ${i + 1}] ${msg.text()}`);
					}
				}
			};
			const onPageError = (err: Error) => {
				reloadErrors.push(`[reload ${i + 1}][pageerror] ${err.message}`);
			};

			page.on('console', onConsole);
			page.on('pageerror', onPageError);

			await page.reload();
			await page.waitForLoadState('networkidle');

			page.removeListener('console', onConsole);
			page.removeListener('pageerror', onPageError);

			allErrors.push(...reloadErrors);
		}

		expect(
			allErrors,
			`Expected no console errors across 10 reloads. Got:\n${allErrors.join('\n')}`
		).toHaveLength(0);
	});
});
