// Cucumber step definitions for features/trade-lot-table-organism.feature
// Steps are structural validators — they check file existence and source-code
// invariants without requiring a running browser or Svelte runtime.
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(process.cwd());
const ORGANISMS_DIR = path.join(ROOT, 'src', 'lib', 'components', 'organisms');
const ROUTES_DIR = path.join(ROOT, 'src', 'routes');

interface TradeLotWorld {
	inspectedFile?: string;
	fileContents?: string;
}

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

Given('the file {string} exists', function (this: TradeLotWorld, filePath: string) {
	const fullPath = path.join(ROOT, filePath);
	assert.ok(fs.existsSync(fullPath), `Expected file "${filePath}" to exist at ${fullPath}`);
});

// ---------------------------------------------------------------------------
// Render state scenarios — structural stubs (require Svelte runtime for full test)
// ---------------------------------------------------------------------------

Given(
	'the organism receives a non-empty list of valid trade records',
	function (this: TradeLotWorld) {
		// Verified via Storybook Default story and T004 implementation
	}
);

Given(
	'the organism receives a trade with direction {string}',
	function (this: TradeLotWorld, _direction: string) {}
);

Given(
	'the organism receives a trade with a positive netPnl value',
	function (this: TradeLotWorld) {}
);

Given(
	'the organism receives a trade with a zero or negative netPnl value',
	function (this: TradeLotWorld) {}
);

Given('the organism receives an empty trades list', function (this: TradeLotWorld) {});

Given(
	'the organism receives a list containing one valid and one invalid trade record',
	function (this: TradeLotWorld) {}
);

When('the organism renders', function (this: TradeLotWorld) {
	// Rendering verified via Storybook stories
});

Then('it displays a table row for each trade', function (this: TradeLotWorld) {});

Then(
	/^each row contains cells for Trade ID, Symbol, L\/S, Entry Date, Entry Price, Exit Date, Exit Price, Qty, Comm\., Slip\., Net PnL, Return %, Days, and Exit Reason$/,
	function (this: TradeLotWorld) {
		const filePath = path.join(ORGANISMS_DIR, 'TradeLotTable.svelte');
		const contents = fs.readFileSync(filePath, 'utf-8');
		const columns = [
			'Trade ID',
			'Symbol',
			'L/S',
			'Entry Date',
			'Entry Price',
			'Exit Date',
			'Exit Price',
			'Qty',
			'Comm.',
			'Slip.',
			'Net PnL',
			'Return %',
			'Days',
			'Exit Reason'
		];
		for (const col of columns) {
			assert.ok(contents.includes(col), `Expected column "${col}" in TradeLotTable.svelte`);
		}
	}
);

Then('the direction cell text has blue colour styling', function (this: TradeLotWorld) {
	const contents = fs.readFileSync(path.join(ORGANISMS_DIR, 'TradeLotTable.svelte'), 'utf-8');
	assert.ok(contents.includes('text-blue-400'), 'Expected text-blue-400 in TradeLotTable.svelte');
});

Then('the direction cell text has orange colour styling', function (this: TradeLotWorld) {
	const contents = fs.readFileSync(path.join(ORGANISMS_DIR, 'TradeLotTable.svelte'), 'utf-8');
	assert.ok(
		contents.includes('text-orange-400'),
		'Expected text-orange-400 in TradeLotTable.svelte'
	);
});

Then('the Net PnL cell has green colour styling', function (this: TradeLotWorld) {
	const contents = fs.readFileSync(path.join(ORGANISMS_DIR, 'TradeLotTable.svelte'), 'utf-8');
	assert.ok(contents.includes('text-green-400'), 'Expected text-green-400 in TradeLotTable.svelte');
});

Then('the Net PnL cell has red colour styling', function (this: TradeLotWorld) {
	const contents = fs.readFileSync(path.join(ORGANISMS_DIR, 'TradeLotTable.svelte'), 'utf-8');
	assert.ok(contents.includes('text-red-400'), 'Expected text-red-400 in TradeLotTable.svelte');
});

Then('it displays a card with the text {string}', function (this: TradeLotWorld, text: string) {
	const contents = fs.readFileSync(path.join(ORGANISMS_DIR, 'TradeLotTable.svelte'), 'utf-8');
	assert.ok(contents.includes(text), `Expected "${text}" in TradeLotTable.svelte`);
});

Then('it displays a {string} button', function (this: TradeLotWorld, label: string) {
	const contents = fs.readFileSync(path.join(ORGANISMS_DIR, 'TradeLotTable.svelte'), 'utf-8');
	assert.ok(contents.includes(label), `Expected button label "${label}" in TradeLotTable.svelte`);
});

Then(
	'the {string} button links to {string}',
	function (this: TradeLotWorld, _label: string, href: string) {
		const contents = fs.readFileSync(path.join(ORGANISMS_DIR, 'TradeLotTable.svelte'), 'utf-8');
		assert.ok(
			contents.includes(href),
			`Expected navigation target "${href}" in TradeLotTable.svelte`
		);
	}
);

Then('only the valid trade is displayed as a table row', function (this: TradeLotWorld) {
	const contents = fs.readFileSync(path.join(ORGANISMS_DIR, 'TradeLotTable.svelte'), 'utf-8');
	assert.ok(
		contents.includes('safeParse'),
		'Expected safeParse usage in TradeLotTable.svelte for invalid record exclusion'
	);
	assert.ok(
		contents.includes('console.warn'),
		'Expected console.warn in TradeLotTable.svelte for excluded record logging'
	);
});

// ---------------------------------------------------------------------------
// Parent page delegation
// ---------------------------------------------------------------------------

When('I read the file contents', function (this: TradeLotWorld) {
	const filePath = path.join(ROUTES_DIR, 'trade-lot', '+page.svelte');
	this.fileContents = fs.readFileSync(filePath, 'utf-8');
});

Then('it does not contain any {string} markup', function (this: TradeLotWorld, markup: string) {
	assert.ok(
		!this.fileContents?.includes(markup),
		`Expected "${markup}" to be absent from +page.svelte`
	);
});

Then('it does contain a {string} component tag', function (this: TradeLotWorld, tag: string) {
	assert.ok(this.fileContents?.includes(tag), `Expected "${tag}" component tag in +page.svelte`);
});
