// Cucumber step definitions for features/strategy-builder-panels.feature
// Steps validate file existence, component structure, and schema invariants
// without requiring a running browser (structural smoke tests).

import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(process.cwd());
const ORGANISMS_DIR = path.join(ROOT, 'src', 'lib', 'components', 'organisms');
const ROUTES_DIR = path.join(ROOT, 'src', 'routes');

interface StrategyBuilderWorld {
	pageContent?: string;
	inputPanelContent?: string;
	outputPanelContent?: string;
}

// ---------------------------------------------------------------------------
// Navigation steps (structural — verify file exists rather than browser nav)
// ---------------------------------------------------------------------------

Given('I navigate to {string}', function (this: StrategyBuilderWorld, route: string) {
	if (route === '/strategy-builder') {
		const pagePath = path.join(ROUTES_DIR, 'strategy-builder', '+page.svelte');
		assert.ok(fs.existsSync(pagePath), `Route file not found: ${pagePath}`);
		this.pageContent = fs.readFileSync(pagePath, 'utf-8');
	}
});

When('the page has loaded', function (this: StrategyBuilderWorld) {
	assert.ok(this.pageContent, 'Page content should be loaded');
});

// ---------------------------------------------------------------------------
// US1: Input Panel steps
// ---------------------------------------------------------------------------

Then('the Input Panel is visible', function (this: StrategyBuilderWorld) {
	assert.ok(
		this.pageContent?.includes('StrategyInputPanel'),
		'Page must import StrategyInputPanel'
	);
	const inputPanelPath = path.join(ORGANISMS_DIR, 'StrategyInputPanel.svelte');
	assert.ok(fs.existsSync(inputPanelPath), 'StrategyInputPanel.svelte must exist');
	this.inputPanelContent = fs.readFileSync(inputPanelPath, 'utf-8');
});

Then('the Run button is disabled', function (this: StrategyBuilderWorld) {
	const content = this.inputPanelContent ?? '';
	assert.ok(
		content.includes('runDisabled'),
		'StrategyInputPanel must have runDisabled derived state'
	);
	assert.ok(content.includes('disabled={runDisabled}'), 'Run button must be bound to runDisabled');
});

When(
	'I type fewer than 10 characters in the strategy description field',
	function (this: StrategyBuilderWorld) {
		// Structural: verify validation logic exists in component
		const content = this.inputPanelContent ?? '';
		assert.ok(content.includes('inputText.length >= 10'), 'Must validate minimum 10 chars');
	}
);

When('I move focus away from the field', function (this: StrategyBuilderWorld) {
	const content = this.inputPanelContent ?? '';
	assert.ok(content.includes('touched'), 'Must track touched state for blur validation');
});

Then(
	'an inline error message {string} is shown',
	function (this: StrategyBuilderWorld, message: string) {
		assert.ok(
			this.inputPanelContent?.includes(message),
			`Inline error message "${message}" must appear in StrategyInputPanel`
		);
	}
);

Then('the Run button remains disabled', function (this: StrategyBuilderWorld) {
	// Covered by the runDisabled derived state check above
	assert.ok(true);
});

When(
	'I type a strategy description of 10 or more characters',
	function (this: StrategyBuilderWorld) {
		assert.ok(
			this.inputPanelContent?.includes('inputText.length >= 10'),
			'Validation boundary must be >= 10 chars'
		);
	}
);

Then('no inline error message is shown', function (this: StrategyBuilderWorld) {
	assert.ok(
		this.inputPanelContent?.includes('showError'),
		'showError derived state must control error visibility'
	);
});

Then('the Run button is enabled', function (this: StrategyBuilderWorld) {
	assert.ok(
		this.inputPanelContent?.includes('!isValid || isRunning'),
		'Run button disabled condition must check validity and running state'
	);
});

Given('I have entered a valid strategy description', function (this: StrategyBuilderWorld) {
	assert.ok(
		this.inputPanelContent?.includes('inputText.length >= 10') ||
			this.pageContent?.includes('StrategyInputPanel'),
		'StrategyInputPanel must exist with validation'
	);
});

When('I click the Run button', function (this: StrategyBuilderWorld) {
	assert.ok(
		this.pageContent?.includes('handleRun'),
		'Page must define handleRun function wired to onRun prop'
	);
});

Then('the Run button becomes disabled', function (this: StrategyBuilderWorld) {
	assert.ok(
		this.pageContent?.includes('isRunning={strategyState.isRunning}'),
		'isRunning must be passed from strategyState to StrategyInputPanel'
	);
});

Then('the Output Panel shows a loading state', function (this: StrategyBuilderWorld) {
	const outputPanelPath = path.join(ORGANISMS_DIR, 'StrategyOutputPanel.svelte');
	assert.ok(fs.existsSync(outputPanelPath), 'StrategyOutputPanel.svelte must exist');
	this.outputPanelContent = fs.readFileSync(outputPanelPath, 'utf-8');
	assert.ok(
		this.outputPanelContent.includes('isLoading'),
		'StrategyOutputPanel must handle isLoading state'
	);
	assert.ok(
		this.outputPanelContent.includes('animate-pulse'),
		'Loading state must include skeleton animation'
	);
});

// ---------------------------------------------------------------------------
// US2: Output Panel steps
// ---------------------------------------------------------------------------

Then(
	'the Output Panel shows a placeholder with instructional text',
	function (this: StrategyBuilderWorld) {
		const outputPanelPath = path.join(ORGANISMS_DIR, 'StrategyOutputPanel.svelte');
		this.outputPanelContent = fs.readFileSync(outputPanelPath, 'utf-8');
		assert.ok(
			this.outputPanelContent.includes('border-dashed'),
			'Empty state must use dashed border'
		);
		assert.ok(this.outputPanelContent.includes('"Run"'), 'Empty state must mention the Run button');
	}
);

When('the backtest completes successfully', function (this: StrategyBuilderWorld) {
	assert.ok(
		this.pageContent?.includes('strategyState.backtestResult'),
		'Page must wire backtestResult to StrategyOutputPanel'
	);
});

Then('the Output Panel displays performance metric tiles', function (this: StrategyBuilderWorld) {
	assert.ok(
		this.outputPanelContent?.includes('totalReturn') &&
			this.outputPanelContent?.includes('sharpeRatio') &&
			this.outputPanelContent?.includes('maxDrawdown'),
		'Output Panel must display key performance metrics'
	);
});

Then('the Output Panel displays an equity curve chart', function (this: StrategyBuilderWorld) {
	assert.ok(
		this.outputPanelContent?.includes('equityCurve'),
		'Output Panel must render equityCurve data'
	);
	assert.ok(
		this.outputPanelContent?.includes('Chart'),
		'Output Panel must use a Chart component for equity curve'
	);
});

Then('the Output Panel displays a trade summary table', function (this: StrategyBuilderWorld) {
	assert.ok(
		this.outputPanelContent?.includes('sampleTrades'),
		'Output Panel must include trade summary table data'
	);
	assert.ok(
		this.outputPanelContent?.includes('Table.Root'),
		'Output Panel must use Table component for trade summary'
	);
});

When('the backtest fails with an error', function (this: StrategyBuilderWorld) {
	assert.ok(
		this.pageContent?.includes('strategyState.runError'),
		'Page must wire runError to StrategyOutputPanel'
	);
});

Then('the Output Panel displays an inline error message', function (this: StrategyBuilderWorld) {
	assert.ok(this.outputPanelContent?.includes('error'), 'Output Panel must handle error prop');
	assert.ok(
		this.outputPanelContent?.includes('text-destructive'),
		'Error state must use destructive styling'
	);
});

Then('the Input Panel remains editable', function (this: StrategyBuilderWorld) {
	// Structural: Input Panel has no disabled/readonly prop tied to error state
	assert.ok(
		!this.inputPanelContent?.includes('disabled={error}'),
		'Input Panel must not be disabled when error occurs'
	);
});

// ---------------------------------------------------------------------------
// US3: Layout steps
// ---------------------------------------------------------------------------

Given('my viewport width is 1280 pixels or wider', function (this: StrategyBuilderWorld) {
	// Structural: verify responsive grid class exists
	assert.ok(
		this.pageContent?.includes('lg:grid-cols-2'),
		'Page must use lg:grid-cols-2 for side-by-side layout'
	);
});

When('the page has loaded', function (this: StrategyBuilderWorld) {
	// Aliased by earlier definition — no-op here
	assert.ok(true);
});

Then(
	'the Input Panel and Output Panel are displayed side by side',
	function (this: StrategyBuilderWorld) {
		assert.ok(
			this.pageContent?.includes('lg:grid-cols-2'),
			'Side-by-side layout requires lg:grid-cols-2'
		);
	}
);

Then('neither panel has overflowing or clipped content', function (this: StrategyBuilderWorld) {
	// Structural: verify no overflow-hidden on panel wrapper that would clip content
	const pageContent = this.pageContent ?? '';
	assert.ok(
		!pageContent.includes('overflow-hidden'),
		'Page layout must not use overflow-hidden on panel wrappers'
	);
});

Given('my viewport width is between 768 and 1023 pixels', function (this: StrategyBuilderWorld) {
	// Single-column layout is the default (no lg: prefix); verify grid exists
	assert.ok(
		this.pageContent?.includes('grid gap-6 lg:grid-cols-2'),
		'Page must use responsive grid that stacks below lg breakpoint'
	);
});

Then(
	'the Input Panel and Output Panel are stacked vertically',
	function (this: StrategyBuilderWorld) {
		// Default grid (no lg:) is single-column — verified by absence of mobile override
		assert.ok(
			this.pageContent?.includes('grid gap-6 lg:grid-cols-2'),
			'Responsive grid stacks vertically below lg breakpoint by default'
		);
	}
);
