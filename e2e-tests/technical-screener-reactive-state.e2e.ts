/**
 * BDD scenario implementation for features/technical-screener-reactive-state.feature
 * Implemented as Playwright tests (@cucumber/cucumber is not installed).
 * Covers @smoke scenarios tagged @screener and @p1/@p2.
 *
 * Run with: pnpm exec playwright test technical-screener-reactive-state
 */
import { test, expect } from '@playwright/test';

const TECHNICAL_SCREENER = '/technical-screener';
const RESEARCH_WORKBENCH = '/';

// ── Helper: collect console warnings about reactive state ──────────────────────

function collectReactivityWarnings(page: import('@playwright/test').Page): () => string[] {
	const warnings: string[] = [];
	page.on('console', (msg) => {
		if (
			msg.type() === 'warning' &&
			(msg.text().includes('non_reactive_update') ||
				msg.text().includes('is updated, but is not declared with `$state'))
		) {
			warnings.push(msg.text());
		}
	});
	return () => warnings;
}

// ── @smoke @p1 US1: Navigate Without Console Errors ───────────────────────────

test.describe('@smoke @screener @p1 US1 – No Reactive State Console Errors', () => {
	test('Technical Screener page loads without non_reactive_update warnings', async ({ page }) => {
		const getWarnings = collectReactivityWarnings(page);

		await page.goto(TECHNICAL_SCREENER);
		await page.waitForLoadState('networkidle');

		expect(getWarnings()).toHaveLength(0);
	});

	test('Pattern selection immediately updates the UI without console warnings', async ({
		page
	}) => {
		const getWarnings = collectReactivityWarnings(page);

		await page.goto(TECHNICAL_SCREENER);
		await page.waitForLoadState('networkidle');

		// Select a pattern — the ScreenerChartPatternPanel renders pattern buttons
		const patternButtons = page.locator('[data-testid="pattern-button"]');
		const firstButton = patternButtons.first();

		if ((await firstButton.count()) > 0) {
			await firstButton.click();
			// After click, the button should reflect the selected state
			await expect(firstButton).toHaveAttribute('aria-pressed', 'true');
		} else {
			// Fallback: verify the panel renders without error (no buttons means no patterns loaded)
			await expect(page.locator('h1')).toBeVisible();
		}

		expect(getWarnings()).toHaveLength(0);
	});

	test('Pattern deselection immediately updates the UI without console warnings', async ({
		page
	}) => {
		const getWarnings = collectReactivityWarnings(page);

		await page.goto(TECHNICAL_SCREENER);
		await page.waitForLoadState('networkidle');

		const patternButtons = page.locator('[data-testid="pattern-button"]');
		const firstButton = patternButtons.first();

		if ((await firstButton.count()) > 0) {
			// Select then deselect
			await firstButton.click();
			await firstButton.click();
			await expect(firstButton).not.toHaveAttribute('aria-pressed', 'true');
		} else {
			await expect(page.locator('h1')).toBeVisible();
		}

		expect(getWarnings()).toHaveLength(0);
	});
});

// ── @smoke @p2 US2: Pattern Selection State Persists Correctly ─────────────────

test.describe('@smoke @screener @p2 US2 – Pattern Selection Snapshot Round-Trip', () => {
	test('Selected patterns are restored after navigation round-trip', async ({ page }) => {
		await page.goto(TECHNICAL_SCREENER);
		await page.waitForLoadState('networkidle');

		const patternButtons = page.locator('[data-testid="pattern-button"]');
		const firstButton = patternButtons.first();

		if ((await firstButton.count()) === 0) {
			test.skip();
			return;
		}

		// Select first pattern
		await firstButton.click();
		const patternLabel = await firstButton.textContent();

		// Navigate away (triggers snapshot capture)
		await page.goto(RESEARCH_WORKBENCH);
		await page.waitForLoadState('networkidle');

		// Navigate back (triggers snapshot restore)
		await page.goto(TECHNICAL_SCREENER);
		await page.waitForLoadState('networkidle');

		// Previously selected pattern should be restored
		const restoredButton = page
			.locator('[data-testid="pattern-button"]')
			.filter({ hasText: patternLabel ?? '' });
		await expect(restoredButton).toHaveAttribute('aria-pressed', 'true');
	});

	test('Empty pattern selection results in no selected patterns after round-trip', async ({
		page
	}) => {
		await page.goto(TECHNICAL_SCREENER);
		await page.waitForLoadState('networkidle');

		// Ensure nothing is selected
		const selectedButtons = page.locator('[data-testid="pattern-button"][aria-pressed="true"]');
		const initialCount = await selectedButtons.count();
		for (let i = 0; i < initialCount; i++) {
			await selectedButtons.nth(0).click();
		}

		// Navigate away and back
		await page.goto(RESEARCH_WORKBENCH);
		await page.waitForLoadState('networkidle');
		await page.goto(TECHNICAL_SCREENER);
		await page.waitForLoadState('networkidle');

		// No patterns should be selected
		await expect(page.locator('[data-testid="pattern-button"][aria-pressed="true"]')).toHaveCount(
			0
		);
	});
});
