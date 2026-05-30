/**
 * BDD scenario implementation for features/screener-organism-refactor.feature
 * Implemented as Playwright tests (@cucumber/cucumber is not installed).
 * Covers @smoke scenarios tagged @screener.
 *
 * Run with: pnpm exec playwright test screener-organism-refactor
 */
import { test, expect } from '@playwright/test';

const SCREENER = '/fundamental-screener';
const BACKTEST = '/backtest-engine';
const HOME = '/';

// ── @smoke US1: Filter Controls ────────────────────────────────────────────────

test.describe('@smoke @screener US1 – ScreenerFilterPanel', () => {
	test('Filter controls render with default values', async ({ page }) => {
		await page.goto(SCREENER);

		// Universe select shows default
		await expect(page.getByText('S&P 500').first()).toBeVisible();

		// PE Ratio input
		const peInput = page.getByLabel('PE Ratio ≤');
		await expect(peInput).toHaveValue('30');

		// ROIC input
		const roicInput = page.getByLabel('ROIC (%) ≥');
		await expect(roicInput).toHaveValue('15');

		// Rev Growth input
		const revGrowthInput = page.getByLabel('Rev Growth (%) ≥');
		await expect(revGrowthInput).toHaveValue('10');
	});

	test('Filter values are restored after navigation (snapshot)', async ({ page }) => {
		await page.goto(SCREENER);

		// Change PE Ratio
		const peInput = page.getByLabel('PE Ratio ≤');
		await peInput.fill('20');
		await expect(peInput).toHaveValue('20');

		// Navigate away
		await page.goto(HOME);

		// Navigate back using browser history
		await page.goBack();
		await page.waitForURL(`**${SCREENER}`);

		// PE Ratio should be restored
		await expect(page.getByLabel('PE Ratio ≤')).toHaveValue('20');
	});
});

// ── @smoke US2: Results Table ──────────────────────────────────────────────────

test.describe('@smoke @screener US2 – ScreenerResultTable', () => {
	test('Results table renders all 10 column headers', async ({ page }) => {
		await page.goto(SCREENER);

		await expect(page.getByRole('columnheader', { name: 'Symbol' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'P/E' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'EV/EBITDA' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'FCF Yield' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'ROIC' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Rev Growth' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'EPS Growth' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Score' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Action' })).toBeVisible();
	});

	test('Results table renders sample data rows', async ({ page }) => {
		await page.goto(SCREENER);

		// At least one data row should be visible
		const rows = page.getByRole('row');
		// rows includes the header row, so we expect more than 1
		await expect(rows).toHaveCount({ min: 2 });
	});

	test('Clicking Backtest navigates to the backtest engine page', async ({ page }) => {
		await page.goto(SCREENER);

		// Click the first Backtest button in the results table
		const backtestBtn = page.getByRole('button', { name: 'Backtest' }).first();
		await expect(backtestBtn).toBeVisible();
		await backtestBtn.click();

		// Should navigate to /backtest-engine
		await page.waitForURL(`**${BACKTEST}`);
		await expect(page).toHaveURL(new RegExp(BACKTEST));
	});
});

// ── @smoke Visual Equivalence ──────────────────────────────────────────────────

test.describe('@smoke @screener Visual Equivalence – Fundamental Screener Page', () => {
	test('Page renders heading, filter panel, and results table', async ({ page }) => {
		await page.goto(SCREENER);

		// Page heading
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

		// Filter panel controls
		await expect(page.getByLabel('PE Ratio ≤')).toBeVisible();

		// Results table header
		await expect(page.getByRole('columnheader', { name: 'Symbol' })).toBeVisible();
	});
});
