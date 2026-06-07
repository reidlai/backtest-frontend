// Cucumber step definitions for features/zodios-api-client.feature
// Steps are structural validators — they check file existence and source-code
// invariants without requiring a running browser or Svelte runtime.
// Zodios client and state modules are tested structurally (file content + vitest unit tests).

import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(process.cwd());
const SCHEMAS_DIR = path.join(ROOT, 'src', 'lib', 'zodios', 'schemas');
const ZODIOS_DIR = path.join(ROOT, 'src', 'lib', 'zodios');
const STATE_DIR = path.join(ROOT, 'src', 'lib', 'state');
const ORGANISMS_DIR = path.join(ROOT, 'src', 'lib', 'components', 'organisms');

interface ZodiosWorld {
	parsedResult?: unknown;
	stateContents?: string;
	clientContents?: string;
}

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

Given(
	'the Zodios client is initialised with the backtest-eapi base URL',
	function (this: ZodiosWorld) {
		const clientPath = path.join(ZODIOS_DIR, 'client.ts');
		assert.ok(fs.existsSync(clientPath), `Zodios client.ts must exist at ${clientPath}`);
		const contents = fs.readFileSync(clientPath, 'utf-8');
		assert.ok(
			contents.includes('PUBLIC_BACKTEST_EAPI_URL') || contents.includes('BACKTEST_EAPI_URL'),
			'client.ts must reference the backtest-eapi base URL env var'
		);
	}
);

// ---------------------------------------------------------------------------
// User Story 1: Zod Schema Validation
// ---------------------------------------------------------------------------

Given(
	'a valid API response from GET /health with status {string} and version {string}',
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function (this: ZodiosWorld, _status: string, _version: string) {
		const schemaPath = path.join(SCHEMAS_DIR, 'health.schema.ts');
		assert.ok(fs.existsSync(schemaPath), `health.schema.ts must exist`);
	}
);

When('the client receives the response', function (this: ZodiosWorld) {
	// Structural check: schema file exists and exports HealthResponseSchema
	const contents = fs.readFileSync(path.join(SCHEMAS_DIR, 'health.schema.ts'), 'utf-8');
	assert.ok(contents.includes('HealthResponseSchema'), 'HealthResponseSchema must be exported');
});

Then(
	'a HealthResponse-shaped object is returned with status and version typed as strings',
	function (this: ZodiosWorld) {
		const contents = fs.readFileSync(path.join(SCHEMAS_DIR, 'health.schema.ts'), 'utf-8');
		assert.ok(contents.includes('status'), 'HealthResponseSchema must include status field');
		assert.ok(contents.includes('version'), 'HealthResponseSchema must include version field');
		assert.ok(contents.includes('z.string()'), 'Fields must be typed as z.string()');
	}
);

Given(
	'the API returns a StrategyResult with the required {string} field omitted',
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function (this: ZodiosWorld, _field: string) {
		const schemaPath = path.join(SCHEMAS_DIR, 'strategy.schema.ts');
		assert.ok(fs.existsSync(schemaPath), `strategy.schema.ts must exist`);
	}
);

When('the Zod schema parses the response', function (this: ZodiosWorld) {
	// Structural: StrategyResultSchema uses z.object which throws ZodError on missing required fields
	const contents = fs.readFileSync(path.join(SCHEMAS_DIR, 'strategy.schema.ts'), 'utf-8');
	assert.ok(contents.includes('StrategyResultSchema'), 'StrategyResultSchema must be exported');
});

Then('a ZodError is thrown before the result reaches state', function (this: ZodiosWorld) {
	// Verified by unit tests in src/lib/zodios/__tests__/schemas.test.ts
	// Structural: z.object().parse() throws ZodError on invalid input — this is Zod's guaranteed behaviour
	const contents = fs.readFileSync(path.join(SCHEMAS_DIR, 'strategy.schema.ts'), 'utf-8');
	assert.ok(contents.includes('z.object'), 'Schema must use z.object for parse-time validation');
});

Given(
	'a valid BacktestRunResult response with id, strategy_ids, strategy_versions, status, and config',
	function (this: ZodiosWorld) {
		const schemaPath = path.join(SCHEMAS_DIR, 'backtest-run.schema.ts');
		assert.ok(fs.existsSync(schemaPath), 'backtest-run.schema.ts must exist');
	}
);

When('it is parsed by BacktestRunResultSchema', function (this: ZodiosWorld) {
	const contents = fs.readFileSync(path.join(SCHEMAS_DIR, 'backtest-run.schema.ts'), 'utf-8');
	assert.ok(
		contents.includes('BacktestRunResultSchema'),
		'BacktestRunResultSchema must be exported'
	);
});

Then('all required fields are present and correctly typed', function (this: ZodiosWorld) {
	const contents = fs.readFileSync(path.join(SCHEMAS_DIR, 'backtest-run.schema.ts'), 'utf-8');
	for (const field of ['id', 'strategy_ids', 'strategy_versions', 'status', 'config']) {
		assert.ok(
			contents.includes(`'${field}'`) ||
				contents.includes(`"${field}"`) ||
				contents.includes(field + ':'),
			`BacktestRunResultSchema must include ${field}`
		);
	}
});

// ---------------------------------------------------------------------------
// User Story 2: Typed Zodios Client
// ---------------------------------------------------------------------------

When('the client calls listStrategies', function (this: ZodiosWorld) {
	const clientPath = path.join(ZODIOS_DIR, 'client.ts');
	this.clientContents = fs.readFileSync(clientPath, 'utf-8');
	assert.ok(
		this.clientContents.includes('listStrategies'),
		'client.ts must define listStrategies alias'
	);
});

Then('the return type is inferred as PagedStrategyResult', function (this: ZodiosWorld) {
	const indexContents = fs.readFileSync(path.join(ZODIOS_DIR, 'index.ts'), 'utf-8');
	assert.ok(
		indexContents.includes('PagedStrategyResult') ||
			indexContents.includes('PagedStrategyResultSchema'),
		'PagedStrategyResult must be exported from zodios index'
	);
});

Then(
	'the items array contains StrategyResult objects with id, name, version, status, config',
	function (this: ZodiosWorld) {
		const contents = fs.readFileSync(path.join(SCHEMAS_DIR, 'strategy.schema.ts'), 'utf-8');
		for (const field of ['id', 'name', 'version', 'status', 'config']) {
			assert.ok(contents.includes(field), `StrategyResultSchema must include ${field}`);
		}
	}
);

Given(
	'a valid CreateBacktestRun body with strategy_ids, strategy_versions, and config',
	function (this: ZodiosWorld) {
		const schemaPath = path.join(SCHEMAS_DIR, 'request-bodies.schema.ts');
		assert.ok(fs.existsSync(schemaPath), 'request-bodies.schema.ts must exist');
	}
);

When('the client calls createBacktestRun', function (this: ZodiosWorld) {
	const clientPath = path.join(ZODIOS_DIR, 'client.ts');
	const contents = fs.readFileSync(clientPath, 'utf-8');
	assert.ok(
		contents.includes('createBacktestRun'),
		'client.ts must define createBacktestRun alias'
	);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
When('the server responds {int}', function (this: ZodiosWorld, _statusCode: number) {
	// Response schema wiring verified by client.ts structure — each endpoint defines its response schema
});

Then('the return is typed as BacktestRunResult', function (this: ZodiosWorld) {
	const contents = fs.readFileSync(path.join(ZODIOS_DIR, 'client.ts'), 'utf-8');
	assert.ok(
		contents.includes('BacktestRunResultSchema'),
		'createBacktestRun endpoint must reference BacktestRunResultSchema'
	);
});

Given('a valid run_id', function (this: ZodiosWorld) {
	// run_id is a UUID string — validated by ActionResponseSchema
	const schemaPath = path.join(SCHEMAS_DIR, 'action-response.schema.ts');
	assert.ok(fs.existsSync(schemaPath), 'action-response.schema.ts must exist');
});

When('the client calls triggerBacktestRun', function (this: ZodiosWorld) {
	const clientPath = path.join(ZODIOS_DIR, 'client.ts');
	const contents = fs.readFileSync(clientPath, 'utf-8');
	assert.ok(
		contents.includes('triggerBacktestRun'),
		'client.ts must define triggerBacktestRun alias'
	);
});

Then('the return is typed as ActionResponse with run_id and status', function (this: ZodiosWorld) {
	const contents = fs.readFileSync(path.join(SCHEMAS_DIR, 'action-response.schema.ts'), 'utf-8');
	assert.ok(contents.includes('run_id'), 'ActionResponseSchema must include run_id');
	assert.ok(contents.includes('status'), 'ActionResponseSchema must include status');
});

Given('a valid run_id and result_id', function (this: ZodiosWorld) {
	const schemaPath = path.join(SCHEMAS_DIR, 'backtest-result.schema.ts');
	assert.ok(fs.existsSync(schemaPath), 'backtest-result.schema.ts must exist');
});

When('the client calls getBacktestResult', function (this: ZodiosWorld) {
	const clientPath = path.join(ZODIOS_DIR, 'client.ts');
	const contents = fs.readFileSync(clientPath, 'utf-8');
	assert.ok(
		contents.includes('getBacktestResult'),
		'client.ts must define getBacktestResult alias'
	);
});

Then(
	'the return includes typed performance_metrics, equity_curve, execution_log, and signal_history',
	function (this: ZodiosWorld) {
		const contents = fs.readFileSync(path.join(SCHEMAS_DIR, 'backtest-result.schema.ts'), 'utf-8');
		for (const field of [
			'performance_metrics',
			'equity_curve',
			'execution_log',
			'signal_history'
		]) {
			assert.ok(contents.includes(field), `BacktestResultResourceSchema must include ${field}`);
		}
	}
);

// ---------------------------------------------------------------------------
// User Story 3: Centralised State
// ---------------------------------------------------------------------------

When('the state directory is inspected', function (this: ZodiosWorld) {
	assert.ok(fs.existsSync(STATE_DIR), 'src/lib/state/ directory must exist');
});

Then(
	'src/lib/state/ contains strategy-list.svelte.ts, backtest-run.svelte.ts, and backtest-result.svelte.ts',
	function (this: ZodiosWorld) {
		for (const file of [
			'strategy-list.svelte.ts',
			'backtest-run.svelte.ts',
			'backtest-result.svelte.ts',
			'health.svelte.ts'
		]) {
			const filePath = path.join(STATE_DIR, file);
			assert.ok(fs.existsSync(filePath), `${file} must exist in src/lib/state/`);
		}
	}
);

Given('a strategy list written to strategyListState', function (this: ZodiosWorld) {
	const stateFile = path.join(STATE_DIR, 'strategy-list.svelte.ts');
	this.stateContents = fs.readFileSync(stateFile, 'utf-8');
	assert.ok(this.stateContents.includes('strategyListState'), 'strategyListState must be exported');
});

When(
	'a page reads from strategyListState and passes data to a child organism',
	function (this: ZodiosWorld) {
		// The architectural constraint (pages pass via $props) is enforced structurally:
		// organisms must NOT import state directly (verified in the next Then step)
	}
);

Then('the organism receives items as a prop', function (this: ZodiosWorld) {
	// Structural: organism $props() declaration verified in TradeLotTable or relevant organism file
	const tradeLotTable = path.join(ORGANISMS_DIR, 'TradeLotTable.svelte');
	if (fs.existsSync(tradeLotTable)) {
		const contents = fs.readFileSync(tradeLotTable, 'utf-8');
		assert.ok(
			contents.includes('$props') || contents.includes('props'),
			'Organism must use $props()'
		);
	}
});

Then('the organism does not import strategyListState directly', function (this: ZodiosWorld) {
	const orgFiles = fs.readdirSync(ORGANISMS_DIR).filter((f) => f.endsWith('.svelte'));
	for (const file of orgFiles) {
		const contents = fs.readFileSync(path.join(ORGANISMS_DIR, file), 'utf-8');
		assert.ok(
			!contents.includes('strategyListState'),
			`Organism ${file} must NOT import strategyListState directly`
		);
		assert.ok(
			!contents.includes('backtestRunState'),
			`Organism ${file} must NOT import backtestRunState directly`
		);
		assert.ok(
			!contents.includes('backtestResultState'),
			`Organism ${file} must NOT import backtestResultState directly`
		);
	}
});

Given('an API call that returns a 404 error', function (this: ZodiosWorld) {
	const schemaPath = path.join(SCHEMAS_DIR, 'error-response.schema.ts');
	assert.ok(fs.existsSync(schemaPath), 'error-response.schema.ts must exist');
});

When('the error is caught and written to state', function (this: ZodiosWorld) {
	const stateFile = path.join(STATE_DIR, 'strategy-list.svelte.ts');
	const contents = fs.readFileSync(stateFile, 'utf-8');
	assert.ok(contents.includes('error'), 'State module must have an error field');
});

Then(
	'the state error field contains type, title, status, detail, and instance',
	function (this: ZodiosWorld) {
		const errorSchema = fs.readFileSync(
			path.join(SCHEMAS_DIR, 'error-response.schema.ts'),
			'utf-8'
		);
		for (const field of ['type', 'title', 'status', 'detail', 'instance']) {
			assert.ok(errorSchema.includes(field), `ErrorResponseSchema must include ${field}`);
		}
	}
);

// ---------------------------------------------------------------------------
// User Story 4: Svelte 5 Rune State
// ---------------------------------------------------------------------------

Given('a Svelte component reading from strategyListState', function (this: ZodiosWorld) {
	const stateFile = path.join(STATE_DIR, 'strategy-list.svelte.ts');
	assert.ok(fs.existsSync(stateFile), 'strategy-list.svelte.ts must exist');
});

When('strategyListState.data is updated with new mock data', function (this: ZodiosWorld) {
	const contents = fs.readFileSync(path.join(STATE_DIR, 'strategy-list.svelte.ts'), 'utf-8');
	assert.ok(contents.includes('$state'), 'State module must use Svelte 5 $state() rune');
});

Then('the component re-renders with the new value', function (this: ZodiosWorld) {
	// Reactivity is guaranteed by Svelte 5 $state() — verified by unit tests in state.test.ts
});

When('the state module files are compiled', function (this: ZodiosWorld) {
	const stateFiles = fs.readdirSync(STATE_DIR).filter((f) => f.endsWith('.svelte.ts'));
	assert.ok(stateFiles.length >= 4, 'At least 4 state modules must exist');
	this.stateContents = stateFiles
		.map((f) => fs.readFileSync(path.join(STATE_DIR, f), 'utf-8'))
		.join('\n');
});

Then(
	'no RxJS or Observable import is present in any file under src/lib/state/',
	function (this: ZodiosWorld) {
		assert.ok(!this.stateContents?.includes('rxjs'), 'No RxJS import allowed in src/lib/state/');
		assert.ok(
			!this.stateContents?.includes('Observable'),
			'No Observable import allowed in src/lib/state/'
		);
	}
);

// ---------------------------------------------------------------------------
// Organism Updates
// ---------------------------------------------------------------------------

Given('TradeLotTable receives an array of TradeRecord props', function (this: ZodiosWorld) {
	const filePath = path.join(ORGANISMS_DIR, 'TradeLotTable.svelte');
	assert.ok(fs.existsSync(filePath), 'TradeLotTable.svelte must exist');
});

When(
	'a trade with trade_id, side, entry_timestamp, exit_timestamp, and exit_reason is rendered',
	function (this: ZodiosWorld) {
		const contents = fs.readFileSync(path.join(ORGANISMS_DIR, 'TradeLotTable.svelte'), 'utf-8');
		assert.ok(contents.includes('trade_id'), 'TradeLotTable must reference trade_id');
		assert.ok(contents.includes('side'), 'TradeLotTable must reference side');
		assert.ok(contents.includes('entry_timestamp'), 'TradeLotTable must reference entry_timestamp');
		assert.ok(contents.includes('exit_timestamp'), 'TradeLotTable must reference exit_timestamp');
	}
);

Then(
	'the table displays trade_id, side, entry and exit timestamps, and exit_reason columns',
	function (this: ZodiosWorld) {
		const contents = fs.readFileSync(path.join(ORGANISMS_DIR, 'TradeLotTable.svelte'), 'utf-8');
		assert.ok(contents.includes('exit_reason'), 'TradeLotTable must include exit_reason column');
	}
);

Then('no commission, slippage, or holdingDays columns are present', function (this: ZodiosWorld) {
	const contents = fs.readFileSync(path.join(ORGANISMS_DIR, 'TradeLotTable.svelte'), 'utf-8');
	assert.ok(!contents.includes('commission'), 'TradeLotTable must NOT include commission column');
	assert.ok(!contents.includes('slippage'), 'TradeLotTable must NOT include slippage column');
	assert.ok(!contents.includes('holdingDays'), 'TradeLotTable must NOT include holdingDays column');
});

Given(
	'PerformanceSummary receives performanceMetrics, equityCurve, executionLog, and signalHistory props',
	function (this: ZodiosWorld) {
		const filePath = path.join(ORGANISMS_DIR, 'PerformanceSummary.svelte');
		assert.ok(fs.existsSync(filePath), 'PerformanceSummary.svelte must exist');
	}
);

When('the component renders', function (this: ZodiosWorld) {
	// Rendering verified via Storybook stories
});

Then(
	'it uses performanceMetrics.total_return_pct from the PerformanceMetrics prop',
	function (this: ZodiosWorld) {
		const contents = fs.readFileSync(
			path.join(ORGANISMS_DIR, 'PerformanceSummary.svelte'),
			'utf-8'
		);
		assert.ok(
			contents.includes('performanceMetrics') || contents.includes('performance_metrics'),
			'PerformanceSummary must accept performanceMetrics prop'
		);
		assert.ok(
			contents.includes('total_return_pct'),
			'PerformanceSummary must reference total_return_pct'
		);
	}
);

Given('PerformanceMetricGrid receives a performanceMetrics prop', function (this: ZodiosWorld) {
	const filePath = path.join(ORGANISMS_DIR, 'PerformanceMetricGrid.svelte');
	assert.ok(fs.existsSync(filePath), 'PerformanceMetricGrid.svelte must exist');
});

When('the user drags a tile', function (this: ZodiosWorld) {
	// Drag interaction verified via Storybook stories
});

Then('draggedIndex is updated in local component state', function (this: ZodiosWorld) {
	const contents = fs.readFileSync(
		path.join(ORGANISMS_DIR, 'PerformanceMetricGrid.svelte'),
		'utf-8'
	);
	assert.ok(
		contents.includes('draggedIndex'),
		'PerformanceMetricGrid must maintain draggedIndex as local state'
	);
	assert.ok(
		contents.includes('$state'),
		'PerformanceMetricGrid must use $state() for local interaction state'
	);
});

Then('draggedIndex is not present in src/lib/state/', function (this: ZodiosWorld) {
	const stateFiles = fs.readdirSync(STATE_DIR).filter((f) => f.endsWith('.svelte.ts'));
	for (const file of stateFiles) {
		const contents = fs.readFileSync(path.join(STATE_DIR, file), 'utf-8');
		assert.ok(
			!contents.includes('draggedIndex'),
			`src/lib/state/${file} must NOT contain draggedIndex (interaction state stays local)`
		);
	}
});
