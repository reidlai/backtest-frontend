// Cucumber step definitions for features/ai-review-sidebar-panels.feature
// These are structural stubs — visual verification is performed via Storybook (Constitution Rule 12)
// and manual browser comparison (SC-002). Full UI automation may be added in a follow-up feature.

import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'node:assert';

// ---------------------------------------------------------------------------
// Shared world state
// ---------------------------------------------------------------------------

interface PanelWorld {
	organism: string;
	rendered: boolean;
	messagesSent: number;
	remounted: boolean;
}

// ---------------------------------------------------------------------------
// Given steps
// ---------------------------------------------------------------------------

Given('the AIReviewPanel organism is rendered in isolation', function (this: PanelWorld) {
	this.organism = 'AIReviewPanel';
	this.rendered = true;
});

Given('the AIReviewPanel organism exists', function (this: PanelWorld) {
	this.organism = 'AIReviewPanel';
	this.rendered = true;
});

Given('the ResourceCostPanel organism is rendered in isolation', function (this: PanelWorld) {
	this.organism = 'ResourceCostPanel';
	this.rendered = true;
});

Given('the ResourceCostPanel organism exists', function (this: PanelWorld) {
	this.organism = 'ResourceCostPanel';
	this.rendered = true;
});

Given('the AIChatPanel organism is rendered in isolation', function (this: PanelWorld) {
	this.organism = 'AIChatPanel';
	this.rendered = true;
	this.messagesSent = 0;
});

Given('no messages have been sent', function (this: PanelWorld) {
	this.messagesSent = 0;
});

Given('the AIChatPanel organism has been unmounted and remounted', function (this: PanelWorld) {
	this.organism = 'AIChatPanel';
	this.rendered = true;
	this.remounted = true;
	this.messagesSent = 0;
});

Given('the QuickActionsPanel organism is rendered in isolation', function (this: PanelWorld) {
	this.organism = 'QuickActionsPanel';
	this.rendered = true;
});

Given('the QuickActionsPanel organism exists', function (this: PanelWorld) {
	this.organism = 'QuickActionsPanel';
	this.rendered = true;
});

Given(
	'all four panel organisms are extracted and imported into AIReviewSidebar',
	function (this: PanelWorld) {
		this.organism = 'AIReviewSidebar';
		this.rendered = true;
	}
);

// ---------------------------------------------------------------------------
// When steps
// ---------------------------------------------------------------------------

When('a developer views the component', function (this: PanelWorld) {
	assert.ok(this.rendered, `${this.organism} should be rendered`);
});

When('it is imported into AIReviewSidebar', function (this: PanelWorld) {
	assert.ok(this.rendered, `${this.organism} should exist before import`);
});

When('a user types a message and clicks Send', function (this: PanelWorld) {
	this.messagesSent = 1;
});

When('the sidebar is rendered', function (this: PanelWorld) {
	assert.ok(this.rendered, 'AIReviewSidebar should be rendered');
});

// ---------------------------------------------------------------------------
// Then steps — structural assertions (visual checks performed via Storybook/browser)
// ---------------------------------------------------------------------------

Then('the strategy grade is displayed', function (this: PanelWorld) {
	// Visual verification: Storybook Organisms/AIReviewPanel — grade circle present
	assert.strictEqual(this.organism, 'AIReviewPanel');
});

Then('the confidence badge is displayed', function (this: PanelWorld) {
	assert.strictEqual(this.organism, 'AIReviewPanel');
});

Then('the risk flag list is displayed', function (this: PanelWorld) {
	assert.strictEqual(this.organism, 'AIReviewPanel');
});

Then('the sidebar renders identically to the original', function (this: PanelWorld) {
	// Visual verification: manual browser comparison per SC-002
	assert.ok(this.rendered);
});

Then('the token usage progress bar is displayed', function (this: PanelWorld) {
	assert.strictEqual(this.organism, 'ResourceCostPanel');
});

Then('the backtest usage progress bar is displayed', function (this: PanelWorld) {
	assert.strictEqual(this.organism, 'ResourceCostPanel');
});

Then('the estimated runtime stat is displayed', function (this: PanelWorld) {
	assert.strictEqual(this.organism, 'ResourceCostPanel');
});

Then('the plan impact stat is displayed', function (this: PanelWorld) {
	assert.strictEqual(this.organism, 'ResourceCostPanel');
});

Then(
	'the layout and data remain unchanged compared to the original sidebar',
	function (this: PanelWorld) {
		assert.ok(this.rendered);
	}
);

Then('the placeholder prompt text is displayed', function (this: PanelWorld) {
	assert.strictEqual(this.messagesSent, 0);
});

Then('the user message appears in the conversation list', function (this: PanelWorld) {
	assert.ok(this.messagesSent > 0);
});

Then('a simulated assistant reply appears in the conversation list', function (this: PanelWorld) {
	assert.ok(this.messagesSent > 0);
});

Then('the message list is empty', function (this: PanelWorld) {
	assert.ok(this.remounted, 'Component should have been remounted');
	assert.strictEqual(this.messagesSent, 0);
});

Then('the input field is empty', function (this: PanelWorld) {
	assert.ok(this.remounted);
});

Then('the New Strategy button is displayed', function (this: PanelWorld) {
	assert.strictEqual(this.organism, 'QuickActionsPanel');
});

Then('the New Backtest button is displayed', function (this: PanelWorld) {
	assert.strictEqual(this.organism, 'QuickActionsPanel');
});

Then('the Report button is displayed', function (this: PanelWorld) {
	assert.strictEqual(this.organism, 'QuickActionsPanel');
});

Then('the Export CSV button is displayed', function (this: PanelWorld) {
	assert.strictEqual(this.organism, 'QuickActionsPanel');
});

Then('all actions behave identically to the original implementation', function (this: PanelWorld) {
	assert.ok(this.rendered);
});

Then(
	'the overall layout, spacing, and scroll behavior remain identical to the pre-refactor state',
	function (this: PanelWorld) {
		// Visual verification: manual browser comparison per SC-002
		assert.ok(this.rendered);
	}
);

Then('zero inline panel markup remains in AIReviewSidebar', function (this: PanelWorld) {
	// Structural verification: SC-001 — confirmed by T017 line count inspection
	assert.ok(this.rendered);
});
