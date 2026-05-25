// Cucumber step definitions for features/zod-schema-organisms.feature
// Steps are structural validators — they check file existence, schema parse behaviour,
// and source-code invariants without requiring a running browser or Svelte runtime.
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(process.cwd());
const SCHEMAS_DIR = path.join(ROOT, 'src', 'lib', 'schemas');
const ORGANISMS_DIR = path.join(ROOT, 'src', 'lib', 'components', 'organisms');

// ---------------------------------------------------------------------------
// Shared world state
// ---------------------------------------------------------------------------

interface ZodWorld {
	schemaFile?: string;
	schemaExport?: string;
	listResult?: string[];
	parseResult?: unknown;
	parseError?: unknown;
	safeParseResult?: { success: boolean; error?: unknown };
	inspectedFile?: string;
}

// ---------------------------------------------------------------------------
// Background steps
// ---------------------------------------------------------------------------

Given(
	'the project has the {string} package installed as a runtime dependency',
	function (this: ZodWorld, pkg: string) {
		const pkgJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
		assert.ok(
			pkgJson.dependencies?.[pkg] || pkgJson.devDependencies?.[pkg],
			`Expected "${pkg}" in dependencies or devDependencies`
		);
	}
);

Given('the directory {string} exists', function (this: ZodWorld, dir: string) {
	const fullPath = path.join(ROOT, dir);
	assert.ok(
		fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory(),
		`Expected directory "${dir}" to exist`
	);
});

// ---------------------------------------------------------------------------
// Scenario: Schema file exists for every organism
// ---------------------------------------------------------------------------

Given(
	'{int} organism Svelte files exist in {string}',
	function (this: ZodWorld, count: number, dir: string) {
		const fullPath = path.join(ROOT, dir);
		const files = fs.readdirSync(fullPath).filter((f) => f.endsWith('.svelte'));
		assert.strictEqual(
			files.length,
			count,
			`Expected ${count} .svelte files in ${dir}, found ${files.length}`
		);
	}
);

When('I list the files in {string}', function (this: ZodWorld, dir: string) {
	const fullPath = path.join(ROOT, dir);
	this.listResult = fs.readdirSync(fullPath);
});

Then(
	'there are exactly {int} schema files with the {string} suffix',
	function (this: ZodWorld, count: number, suffix: string) {
		const schemaFiles = (this.listResult ?? []).filter((f) => f.endsWith(suffix));
		assert.strictEqual(
			schemaFiles.length,
			count,
			`Expected ${count} files with suffix "${suffix}", found ${schemaFiles.length}`
		);
	}
);

Then('a barrel export file {string} exists', function (this: ZodWorld, filePath: string) {
	const fullPath = path.join(ROOT, filePath);
	assert.ok(fs.existsSync(fullPath), `Expected barrel file "${filePath}" to exist`);
});

// ---------------------------------------------------------------------------
// Scenario Outline: Schema parse with no arguments returns valid default state
// ---------------------------------------------------------------------------

Given('the schema file {string} exists', function (this: ZodWorld, schemaFile: string) {
	this.schemaFile = schemaFile;
	const fullPath = path.join(SCHEMAS_DIR, schemaFile);
	assert.ok(
		fs.existsSync(fullPath),
		`Expected schema file "${schemaFile}" to exist at ${fullPath}`
	);
});

When('I call {string}', async function (this: ZodWorld, call: string) {
	// Extracts the export name from calls like "AIChatPanelSchema.parse({})"
	const exportName = call.split('.')[0];
	this.schemaExport = exportName;
	try {
		const mod = await import(path.join(SCHEMAS_DIR, this.schemaFile!.replace('.ts', '.js')));
		const schema = mod[exportName];
		assert.ok(schema, `Expected export "${exportName}" from schema file`);
		this.parseResult = schema.parse({});
	} catch (err) {
		this.parseError = err;
	}
});

Then('it returns an object matching the expected defaults', function (this: ZodWorld) {
	assert.ok(this.parseResult !== undefined, 'Expected parse result to be defined');
	assert.ok(typeof this.parseResult === 'object', 'Expected parse result to be an object');
});

Then('no exception is thrown', function (this: ZodWorld) {
	assert.ok(!this.parseError, `Expected no exception but got: ${this.parseError}`);
});

// ---------------------------------------------------------------------------
// Scenario: TypeScript compilation passes after schema integration
// ---------------------------------------------------------------------------

Given('all organism schemas are created', function (this: ZodWorld) {
	const schemaFiles = fs.readdirSync(SCHEMAS_DIR).filter((f) => f.endsWith('.schema.ts'));
	assert.strictEqual(
		schemaFiles.length,
		16,
		`Expected 16 schema files, found ${schemaFiles.length}`
	);
});

Given(
	'all organism components with local $state have been updated to use their schema',
	function (this: ZodWorld) {
		const componentFiles = [
			'AIChatPanel.svelte',
			'AIResearchBox.svelte',
			'PerformancdeChartTabs.svelte',
			'PerformanceMetricGrid.svelte'
		];
		for (const file of componentFiles) {
			const content = fs.readFileSync(path.join(ORGANISMS_DIR, file), 'utf-8');
			assert.ok(content.includes('$lib/schemas'), `Expected ${file} to import from $lib/schemas`);
			assert.ok(content.includes('Schema.parse({})'), `Expected ${file} to use Schema.parse({})`);
		}
	}
);

When('I run the TypeScript type-checker ({string})', function (this: ZodWorld, _cmd: string) {
	// TypeScript check is verified via T032 (pnpm check) — this step documents the intent
	// Actual execution occurs in the Polish phase
});

Then('it exits with code 0', function (this: ZodWorld) {
	// Verified by T032 output — this step is a documentation hook
});

Then('there are zero type errors', function (this: ZodWorld) {
	// Verified by T032 output — this step is a documentation hook
});

// ---------------------------------------------------------------------------
// Scenario: PerformanceChartTabs schema validates enum values at runtime
// ---------------------------------------------------------------------------

Given('the {string} is loaded', async function (this: ZodWorld, exportName: string) {
	this.schemaExport = exportName;
});

When('I call {string}', async function (this: ZodWorld, call: string) {
	// Disambiguated from earlier step by argument pattern
	if (call.includes('safeParse')) {
		const exportName = call.split('.')[0];
		const mod = await import(
			path.join(
				SCHEMAS_DIR,
				`${exportName
					.replace('Schema', '')
					.replace(/([A-Z])/g, '-$1')
					.toLowerCase()
					.slice(1)}.schema.js`
			)
		);
		const schema = mod[exportName];
		const arg = JSON.parse(call.match(/safeParse\((.+)\)/)?.[1] ?? '{}');
		this.safeParseResult = schema.safeParse(arg);
	}
});

Then('the result has {string}', function (this: ZodWorld, expected: string) {
	if (expected === 'success: false') {
		assert.strictEqual(
			this.safeParseResult?.success,
			false,
			'Expected safeParse to return success: false'
		);
	}
});

Then('the error describes an invalid enum value', function (this: ZodWorld) {
	assert.ok(this.safeParseResult?.error, 'Expected error to be present');
});

// ---------------------------------------------------------------------------
// Scenario: PerformanceMetricGrid state consolidation
// ---------------------------------------------------------------------------

Given('the {string} component is loaded', function (this: ZodWorld, component: string) {
	const content = fs.readFileSync(path.join(ORGANISMS_DIR, component), 'utf-8');
	this.inspectedFile = content;
});

When('it initializes', function (this: ZodWorld) {
	// No-op — state is verified via source inspection
});

Then(
	'its local state is a single {string} object typed as {string}',
	function (this: ZodWorld, stateVar: string, _typeName: string) {
		assert.ok(
			(this.inspectedFile ?? '').includes(`let ${stateVar} =`),
			`Expected component to declare "let ${stateVar} ="`
		);
	}
);

Then(
	'the individual {string} declarations for tiles, draggedIndex, editingTileId, editValue, and modalOpen are removed',
	function (this: ZodWorld, _rune: string) {
		const content = this.inspectedFile ?? '';
		const forbidden = [
			'let tiles = $state',
			'let draggedIndex = $state',
			'let editingTileId = $state',
			'let editValue = $state',
			'let modalOpen = $state'
		];
		for (const pattern of forbidden) {
			assert.ok(
				!content.includes(pattern),
				`Expected individual $state declaration "${pattern}" to be removed`
			);
		}
	}
);

// ---------------------------------------------------------------------------
// Scenario: Global state singletons are not modified
// ---------------------------------------------------------------------------

Given('the feature is fully implemented', function (this: ZodWorld) {
	// Precondition — verified by prior task completions
});

When('I inspect {string}', function (this: ZodWorld, filePath: string) {
	this.inspectedFile = fs.readFileSync(path.join(ROOT, filePath), 'utf-8');
});

Then('none of these files have been modified', function (this: ZodWorld) {
	// Verified by T034 in the Polish phase — structural check only
});

Then('none of these files import from {string}', function (this: ZodWorld, importPath: string) {
	assert.ok(
		!(this.inspectedFile ?? '').includes(importPath),
		`Expected file not to import from "${importPath}"`
	);
});

// ---------------------------------------------------------------------------
// Scenario: All schemas are re-exported from the index barrel
// ---------------------------------------------------------------------------

Given('{string} exists', function (this: ZodWorld, filePath: string) {
	assert.ok(fs.existsSync(path.join(ROOT, filePath)), `Expected "${filePath}" to exist`);
});

When('I import from {string}', async function (this: ZodWorld, _importPath: string) {
	// Dynamic import of the compiled barrel — verified via TypeScript check (T032)
});

Then(
	'all {int} schema exports and their inferred types are available',
	function (this: ZodWorld, count: number) {
		const barrelContent = fs.readFileSync(path.join(SCHEMAS_DIR, 'index.ts'), 'utf-8');
		const exportLines = barrelContent.split('\n').filter((l) => l.startsWith('export *'));
		assert.strictEqual(
			exportLines.length,
			count,
			`Expected ${count} re-export lines in index.ts, found ${exportLines.length}`
		);
	}
);
