/**
 * Step definition stubs for features/column-organism-components.feature.
 *
 * @cucumber/cucumber is not installed in this project. All 13 scenarios are
 * implemented as Playwright tests in:
 *   e2e-tests/column-organism-components.e2e.ts
 *
 * Run them with: pnpm exec playwright test column-organism-components
 *
 * This file is kept for BDD traceability (Constitution Rule 6). If a Cucumber
 * runner is added in future, replace the `pending()` stubs below with the
 * Playwright page interactions from the .e2e.ts file.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */

// @ts-expect-error — @cucumber/cucumber is not installed; stubs kept for traceability
import { Given, When, Then, pending } from '@cucumber/cucumber';

// ---------------------------------------------------------------------------
// Background

Given('the backtest engine page is loaded', pending);

// ---------------------------------------------------------------------------
// US1 – Universe & Capital Column

When('the backtest engine page is displayed', pending);
Then('the Universe & Capital column is rendered by the UniverseCapitalConfig organism', pending);
Then('it displays the default backtest mode {string}', pending);
Then('it displays the default universe {string}', pending);
Then('it displays the default initial capital {string}', pending);

When('a user changes the backtest mode to {string}', pending);
Then('the universeCapitalConfigState mode is {string}', pending);
Then('the scheduleExecutionConfigState is unchanged', pending);
Then('the orderTypesConfigState is unchanged', pending);

Given('the UniverseCapitalConfig organism is rendered in isolation', pending);
When('the component initializes', pending);
Then('it displays the default values from universeCapitalConfigState', pending);
Then('it does not require scheduleExecutionConfigState to be present', pending);
Then('it does not require orderTypesConfigState to be present', pending);

// ---------------------------------------------------------------------------
// US2 – Schedule & Execution Column

Then(
	'the Schedule & Execution column is rendered by the ScheduleExecutionConfig organism',
	pending
);
Then('it displays the default start date {string}', pending);
Then('it displays the default end date {string}', pending);
Then('it displays the default timeframe {string}', pending);
Then('it displays the default direction {string}', pending);

When('a user changes the timeframe to {string}', pending);
Then('the scheduleExecutionConfigState timeframe is {string}', pending);
Then('the universeCapitalConfigState is unchanged', pending);

// ---------------------------------------------------------------------------
// US3 – Order Types Column

Then('the Order Types column is rendered by the OrderTypesConfig organism', pending);
Then('it displays checkboxes for all available order types', pending);
Then('{string} is selected by default', pending);

When('a user toggles the {string} order type checkbox', pending);
Then('the orderTypesConfigState selectedOrderTypes includes {string}', pending);

Given('the OrderTypesConfig organism has an onRun callback provided by the page', pending);
When('the user clicks the Run Backtest button', pending);
Then('the onRun callback is invoked', pending);
Then(
	'the organism does not directly access universeCapitalConfigState or scheduleExecutionConfigState',
	pending
);

Given('the OrderTypesConfig organism is rendered without an onRun prop', pending);
Then('no error is thrown', pending);

// ---------------------------------------------------------------------------
// Cross-organism behaviors

Given('the user has modified fields in all three columns', pending);
When('the Quick Actions Panel reset action is triggered', pending);
Then('universeCapitalConfigState is reset to schema defaults', pending);
Then('scheduleExecutionConfigState is reset to schema defaults', pending);
Then('orderTypesConfigState is reset to schema defaults', pending);

Given('appState.backtestPrefillSymbol is set to {string}', pending);
When('the backtest engine page effect runs', pending);
Then('universeCapitalConfigState.universe is updated to {string}', pending);
Then('the UniverseCapitalConfig organism displays {string} in the universe field', pending);

// ---------------------------------------------------------------------------
// Visual equivalence

Then('it shows three columns in a grid layout', pending);
Then('the first column is titled {string}', pending);
Then('the second column is titled {string}', pending);
Then('the third column is titled {string}', pending);
Then('the Run Backtest button is visible in the third column', pending);
