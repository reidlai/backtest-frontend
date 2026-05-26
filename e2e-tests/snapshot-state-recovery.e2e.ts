/**
 * BDD scenario implementation for features/snapshot-state-recovery.feature
 * Implemented as Playwright tests (no @cucumber/cucumber installed).
 * Covers all 12 scenarios tagged @snapshot @frontend.
 */
import { test, expect, type Page } from '@playwright/test';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function clearSnapshots(page: Page) {
	await page.evaluate(() => sessionStorage.clear());
}

async function navTo(page: Page, href: string) {
	await page.locator(`a[href="${href}"]`).first().click();
	await page.waitForURL(`**${href}`);
}

const RESEARCH = '/research-workbench';
const FUNDAMENTAL = '/fundamental-screener';
const TECHNICAL = '/technical-screener';

const AI_RESEARCH_TEXTAREA = 'textarea[placeholder="Describe your investment strategy in natural language..."]';
const AI_CHAT_TEXTAREA = 'textarea[placeholder="Ask AI..."]';

// ── US1: AI Research Box ──────────────────────────────────────────────────────

test.describe('@smoke @p1 US1 – AI Research Box', () => {
	test('Research text is preserved after navigating away and back', async ({ page }) => {
		await page.goto(RESEARCH);
		await clearSnapshots(page);
		await page.goto(RESEARCH);

		await page.locator(AI_RESEARCH_TEXTAREA).fill('Bull flag momentum strategy with RSI filter');
		await navTo(page, FUNDAMENTAL);
		await navTo(page, RESEARCH);

		await expect(page.locator(AI_RESEARCH_TEXTAREA)).toHaveValue(
			'Bull flag momentum strategy with RSI filter'
		);
	});

	test('Empty research textarea is preserved after navigation', async ({ page }) => {
		await page.goto(RESEARCH);
		await clearSnapshots(page);
		await page.goto(RESEARCH);

		await expect(page.locator(AI_RESEARCH_TEXTAREA)).toHaveValue('');
		await navTo(page, TECHNICAL);
		await navTo(page, RESEARCH);

		await expect(page.locator(AI_RESEARCH_TEXTAREA)).toHaveValue('');
	});

	test('Validation error is not restored after navigation', async ({ page }) => {
		await page.goto(RESEARCH);
		await clearSnapshots(page);
		await page.goto(RESEARCH);

		// Trigger validation error by clicking Convert with empty textarea
		await page.getByRole('button', { name: 'Convert to Strategy' }).click();
		await expect(page.locator('text=Please enter a strategy description')).toBeVisible();

		await navTo(page, FUNDAMENTAL);
		await navTo(page, RESEARCH);

		await expect(page.locator('text=Please enter a strategy description')).not.toBeVisible();
	});
});

// ── US2: AI Chat Panel (hard-refresh recovery) ───────────────────────────────

test.describe('@p1 US2 – AI Chat Panel', () => {
	test('Chat message history is restored after a hard refresh', async ({ page }) => {
		await page.goto(RESEARCH);
		await clearSnapshots(page);

		await page.locator(AI_CHAT_TEXTAREA).fill('What is the optimal RSI period?');
		await page.getByRole('button', { name: 'Send Message' }).click();

		// Wait for assistant response to appear
		await expect(page.locator('.rounded-l-lg, .rounded-r-lg').first()).toBeVisible();

		await page.reload();

		// User message restored
		await expect(page.locator('text=What is the optimal RSI period?')).toBeVisible();
		// Assistant response restored (order preserved — assistant follows user)
		const messages = page.locator('.rounded-l-lg, .rounded-tl-lg');
		await expect(messages.first()).toBeVisible();
	});

	test('Partially typed unsent message is restored after a hard refresh', async ({ page }) => {
		await page.goto(RESEARCH);
		await clearSnapshots(page);

		await page.locator(AI_CHAT_TEXTAREA).fill('Analyze the MACD cross');
		await page.reload();

		await expect(page.locator(AI_CHAT_TEXTAREA)).toHaveValue('Analyze the MACD cross');
	});

	test('Empty chat history starts fresh after a hard refresh', async ({ page }) => {
		await page.goto(RESEARCH);
		await clearSnapshots(page);
		await page.reload();

		// No message bubbles visible
		await expect(page.locator('.rounded-l-lg').first()).not.toBeVisible();
		// Empty-state placeholder visible
		await expect(
			page.locator('text=Ask me about your strategy parameters or optimization tips.')
		).toBeVisible();
	});
});

// ── US3: Screener Filter Settings ────────────────────────────────────────────

test.describe('@smoke @p2 US3 – Fundamental Screener', () => {
	test('Fundamental Screener filter values are preserved after navigation', async ({ page }) => {
		await page.goto(FUNDAMENTAL);
		await clearSnapshots(page);
		await page.goto(FUNDAMENTAL);

		// Set Universe to "Nasdaq 100" via Select
		await page.locator('button[role="combobox"]').first().click();
		await page.getByRole('option', { name: 'Nasdaq 100' }).click();

		// Set numeric filter inputs
		await page.getByLabel('PE Ratio ≤').fill('20');
		await page.getByLabel('ROIC (%) ≥').fill('25');
		await page.getByLabel('Rev Growth (%) ≥').fill('15');

		await navTo(page, RESEARCH);
		await navTo(page, FUNDAMENTAL);

		await expect(page.locator('button[role="combobox"]').first()).toContainText('Nasdaq 100');
		await expect(page.getByLabel('PE Ratio ≤')).toHaveValue('20');
		await expect(page.getByLabel('ROIC (%) ≥')).toHaveValue('25');
		await expect(page.getByLabel('Rev Growth (%) ≥')).toHaveValue('15');
	});

	test('Fundamental Screener shows defaults when no prior snapshot exists', async ({ page }) => {
		await page.goto(FUNDAMENTAL);
		await clearSnapshots(page);
		await page.goto(FUNDAMENTAL);

		await expect(page.locator('button[role="combobox"]').first()).toContainText('S&P 500');
		await expect(page.getByLabel('PE Ratio ≤')).toHaveValue('30');
		await expect(page.getByLabel('ROIC (%) ≥')).toHaveValue('15');
		await expect(page.getByLabel('Rev Growth (%) ≥')).toHaveValue('10');
	});
});

test.describe('@smoke @p2 US3 – Technical Screener', () => {
	test('Technical Screener pattern and indicator selections are preserved after navigation', async ({
		page
	}) => {
		await page.goto(TECHNICAL);
		await clearSnapshots(page);
		await page.goto(TECHNICAL);

		// Select patterns
		await page.getByRole('button', { name: 'Bull Flag' }).click();
		await page.getByRole('button', { name: 'MACD Cross' }).click();

		// Set Trend indicator to "Supertrend"
		const trendTrigger = page.locator('button[role="combobox"]').nth(0);
		await trendTrigger.click();
		await page.getByRole('option', { name: 'Supertrend' }).click();

		// Set Momentum indicator to "Stochastic"
		const momentumTrigger = page.locator('button[role="combobox"]').nth(1);
		await momentumTrigger.click();
		await page.getByRole('option', { name: 'Stochastic' }).click();

		await navTo(page, RESEARCH);
		await navTo(page, TECHNICAL);

		// Patterns restored — selected buttons use 'default' variant (different styling)
		const bullFlag = page.getByRole('button', { name: 'Bull Flag' });
		const macdCross = page.getByRole('button', { name: 'MACD Cross' });
		await expect(bullFlag).not.toHaveClass(/outline/);
		await expect(macdCross).not.toHaveClass(/outline/);

		await expect(page.locator('button[role="combobox"]').nth(0)).toContainText('Supertrend');
		await expect(page.locator('button[role="combobox"]').nth(1)).toContainText('Stochastic');
	});

	test('Technical Screener shows defaults when no prior snapshot exists', async ({ page }) => {
		await page.goto(TECHNICAL);
		await clearSnapshots(page);
		await page.goto(TECHNICAL);

		// No pattern buttons should be in 'default' variant (all should be 'outline')
		const patternButtons = page.locator('[class*="uppercase"][class*="font-bold"]');
		const count = await patternButtons.count();
		for (let i = 0; i < count; i++) {
			await expect(patternButtons.nth(i)).toHaveClass(/outline/);
		}

		await expect(page.locator('button[role="combobox"]').nth(0)).toContainText('EMA(200)');
		await expect(page.locator('button[role="combobox"]').nth(1)).toContainText('RSI(14)');
	});
});

// ── Edge Cases ────────────────────────────────────────────────────────────────

test.describe('@p2 Edge Cases', () => {
	test('Cleared filter value is preserved, not reset to default', async ({ page }) => {
		await page.goto(FUNDAMENTAL);
		await clearSnapshots(page);
		await page.goto(FUNDAMENTAL);

		await page.getByLabel('PE Ratio ≤').clear();
		await navTo(page, RESEARCH);
		await navTo(page, FUNDAMENTAL);

		await expect(page.getByLabel('PE Ratio ≤')).toHaveValue('');
	});

	test('Invalid snapshot data falls back to schema defaults', async ({ page }) => {
		await page.goto(FUNDAMENTAL);
		// Inject a corrupt snapshot manually into sessionStorage
		await page.evaluate(() => {
			const corruptData = { universe: 12345, peMax: null, roicMin: ['bad'], revGrowthMin: {} };
			sessionStorage.setItem(
				'sveltekit:snapshot',
				JSON.stringify({ '/fundamental-screener': corruptData })
			);
		});
		await page.goto(FUNDAMENTAL);

		// Should fall back to schema defaults (Zod safeParse rejects invalid types)
		await expect(page.locator('button[role="combobox"]').first()).toContainText('S&P 500');
		await expect(page.getByLabel('PE Ratio ≤')).toHaveValue('30');
		// No error displayed to user
		await expect(page.locator('[role="alert"]')).not.toBeVisible();
	});
});
