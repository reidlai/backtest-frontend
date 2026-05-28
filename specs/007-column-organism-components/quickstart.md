# Quickstart: Backtest Engine Column Organism Components

**Feature**: `007-column-organism-components`
**Date**: 2026-05-28

## Overview

This feature refactors the backtest engine page by extracting its three inline configuration columns into dedicated organism components, each with its own Zod-backed singleton state. This guide covers how to develop, run, and verify the new components.

## Prerequisites

```bash
# Install dependencies (already installed if you've run dev before)
pnpm install

# Ensure you're on the feature branch
git checkout 007-column-organism-components
```

## Development Workflow (follows Constitution Rule 12)

### Step 1: Run Storybook to verify organisms visually

```bash
pnpm storybook
```

Open [http://localhost:6006](http://localhost:6006) and navigate to:
- `Organisms / UniverseCapitalConfig` — verify mode dropdown, universe input, capital input
- `Organisms / ScheduleExecutionConfig` — verify date pickers, timeframe dropdown, direction dropdown
- `Organisms / OrderTypesConfig` — verify checkboxes, Run Backtest button

Each organism must render in isolation with correct defaults and interactive controls before schema/state work is considered verified.

### Step 2: Run the dev server to verify the page

```bash
pnpm dev
```

Navigate to `/backtest-engine`. The page must look and behave identically to before the refactor:
- All three columns render with correct defaults
- Form fields update on interaction
- "Run Backtest" triggers a toast notification
- Quick Actions Panel reset clears all three columns

### Step 3: Run unit tests

```bash
pnpm test:unit
```

All existing tests must pass. New unit tests for state singletons verify:
- Default initialization from schema
- Field mutation reactivity
- `reset()` returns to defaults

### Step 4: Run BDD scenarios

```bash
# Run Playwright tests (includes BDD feature file execution)
pnpm test:e2e
```

The new `features/column-organism-components.feature` scenarios must all pass.

### Step 5: Run full test suite

```bash
pnpm test
```

## Key File Locations

| File | Purpose |
| --- | --- |
| `src/lib/components/organisms/UniverseCapitalConfig.svelte` | Universe & Capital column organism |
| `src/lib/components/organisms/ScheduleExecutionConfig.svelte` | Schedule & Execution column organism |
| `src/lib/components/organisms/OrderTypesConfig.svelte` | Order Types column organism |
| `src/lib/state/universe-capital-config.svelte.ts` | Universe & Capital state singleton |
| `src/lib/state/schedule-execution-config.svelte.ts` | Schedule & Execution state singleton |
| `src/lib/state/order-types-config.svelte.ts` | Order Types state singleton |
| `src/lib/schemas/universe-capital-config.schema.ts` | Schema + BacktestModeSchema |
| `src/lib/schemas/schedule-execution-config.schema.ts` | Schema for schedule/execution fields |
| `src/lib/schemas/order-types-config.schema.ts` | Schema + OrderTypeSchema |
| `src/routes/backtest-engine/+page.svelte` | Page using all 3 organisms |
| `src/stories/UniverseCapitalConfig.stories.svelte` | Storybook story |
| `src/stories/ScheduleExecutionConfig.stories.svelte` | Storybook story |
| `src/stories/OrderTypesConfig.stories.svelte` | Storybook story |
| `features/column-organism-components.feature` | BDD scenarios |

## Removed Files

| File | Replaced by |
| --- | --- |
| `src/lib/state/backtest.svelte.ts` | 3 new per-organism state files |
| `src/lib/schemas/backtest-state.schema.ts` | 3 new per-organism schema files |

## Storybook Story Patterns

Reference `src/stories/QuickActionsPanel.stories.svelte` for the story pattern. For `OrderTypesConfig`, pass a mock `onRun` prop:

```svelte
<Story name="Default">
  <OrderTypesConfig onRun={() => console.log('run clicked')} />
</Story>

<Story name="No Run Handler">
  <OrderTypesConfig />
</Story>
```

## Type Checking

```bash
pnpm check
```

No TypeScript errors should exist after removing `backtestState` and updating all import sites.
