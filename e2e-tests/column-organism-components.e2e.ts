/**
 * BDD scenario implementation for features/column-organism-components.feature
 * Implemented as Playwright tests (no @cucumber/cucumber installed).
 * Covers the @smoke scenarios tagged @organisms @backtest-engine.
 */
import { test, expect } from '@playwright/test';

const BACKTEST = '/backtest-engine';
const DASHBOARD = '/';

// ── @smoke US1: Universe & Capital Column ─────────────────────────────────────

test.describe('@smoke @organisms US1 – Universe & Capital Column', () => {
	test('Universe & Capital column renders with correct defaults', async ({ page }) => {
		await page.goto(BACKTEST);

		// Column heading
		await expect(page.getByRole('heading', { name: 'Universe & Capital' })).toBeVisible();

		// Default mode shown in the select trigger
		await expect(page.getByText('Single Stock').first()).toBeVisible();

		// Default universe
		await expect(page.getByLabel('Universe / Symbol')).toHaveValue('SPY');

		// Default initial capital
		await expect(page.getByLabel('Initial Capital ($)')).toHaveValue('100000');
	});
});

// ── @smoke US2: Schedule & Execution Column ───────────────────────────────────

test.describe('@smoke @organisms US2 – Schedule & Execution Column', () => {
	test('Schedule & Execution column renders with correct defaults', async ({ page }) => {
		await page.goto(BACKTEST);

		// Column heading
		await expect(page.getByRole('heading', { name: 'Schedule & Execution' })).toBeVisible();

		// Default dates
		await expect(page.getByLabel('Start Date')).toHaveValue('2020-01-01');
		await expect(page.getByLabel('End Date')).toHaveValue('2024-12-31');

		// Default timeframe shown in select trigger
		await expect(page.getByText('Daily').first()).toBeVisible();

		// Default direction shown in select trigger
		await expect(page.getByText('Long').first()).toBeVisible();
	});
});

// ── @smoke US3: Order Types Column ───────────────────────────────────────────

test.describe('@smoke @organisms US3 – Order Types Column', () => {
	test('Order Types column renders with Market checked by default', async ({ page }) => {
		await page.goto(BACKTEST);

		// Column heading
		await expect(page.getByRole('heading', { name: 'Order Types' })).toBeVisible();

		// Market checkbox is checked
		const marketCheckbox = page.locator('#Market');
		await expect(marketCheckbox).toBeChecked();

		// Other default checkboxes (Limit, Stop) are unchecked
		await expect(page.locator('#Limit')).not.toBeChecked();
		await expect(page.locator('#Stop')).not.toBeChecked();

		// Run Backtest button is visible
		await expect(page.getByRole('button', { name: 'Run Backtest' })).toBeVisible();
	});

	test('Order Types column shows all 8 order type checkboxes', async ({ page }) => {
		await page.goto(BACKTEST);

		const orderTypes = [
			'Market',
			'Limit',
			'Stop',
			'Stop-Limit',
			'Trailing Stop',
			'Bracket',
			'OCO',
			'Short Sell'
		];
		for (const type of orderTypes) {
			// Use exact checkbox role lookup to avoid substring matches (e.g. "Limit" vs "Stop-Limit")
			await expect(page.getByRole('checkbox', { name: type, exact: true })).toBeVisible();
		}
	});
});

// ── @smoke Visual Equivalence ─────────────────────────────────────────────────

test.describe('@smoke @organisms Visual Equivalence – Backtest Engine Page', () => {
	test('Backtest engine page shows three columns with correct headings', async ({ page }) => {
		await page.goto(BACKTEST);

		// All three column headings are visible
		await expect(page.getByRole('heading', { name: 'Universe & Capital' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Schedule & Execution' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Order Types' })).toBeVisible();

		// Run Backtest button is in the Order Types column (third column)
		await expect(page.getByRole('button', { name: 'Run Backtest' })).toBeVisible();
	});

	test('Page heading is visible', async ({ page }) => {
		await page.goto(BACKTEST);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	});
});

// ── Cross-organism: Run Backtest triggers toast ───────────────────────────────

test.describe('@organisms Run Backtest callback', () => {
	test('Clicking Run Backtest shows a processing toast', async ({ page }) => {
		await page.goto(BACKTEST);

		await page.getByRole('button', { name: 'Run Backtest' }).click();

		// Toast should appear confirming the backtest is queued
		await expect(page.getByText('Backtest queued and processing...')).toBeVisible();
	});
});

// ── Cross-organism: Quick Actions Panel reset ─────────────────────────────────

test.describe('@organisms Quick Actions Panel reset', () => {
	test('New Backtest action resets all three organism states and navigates to backtest page', async ({
		page
	}) => {
		await page.goto(BACKTEST);

		// Modify Universe field
		await page.getByLabel('Universe / Symbol').fill('AAPL');
		await expect(page.getByLabel('Universe / Symbol')).toHaveValue('AAPL');

		// Navigate to dashboard first to ensure we can come back
		await page.goto(DASHBOARD);

		// Click New Backtest in Quick Actions Panel (use first — mobile + desktop both render it)
		const newBacktestBtn = page.getByRole('button', { name: 'New Backtest' }).first();
		await expect(newBacktestBtn).toBeVisible();
		await newBacktestBtn.click();

		// Should navigate to /backtest-engine and state should be reset
		await page.waitForURL(`**${BACKTEST}`);
		await expect(page.getByLabel('Universe / Symbol')).toHaveValue('SPY');
	});
});
