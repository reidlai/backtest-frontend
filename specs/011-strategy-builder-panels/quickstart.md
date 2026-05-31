# Quickstart: Strategy Builder Input and Output Panels

**Date**: 2026-05-31

## Prerequisites

- Node.js ≥ 18 (managed by moonrepo toolchain)
- `pnpm install` at repo root

## Development

```bash
# Start SvelteKit dev server
pnpm dev

# Navigate to the Strategy Builder page
open http://localhost:5173/strategy-builder

# Run Storybook to verify organisms in isolation
pnpm storybook
```

## Implementation Order (per Constitution Rule 12)

1. **Extend `StrategyState`** — add `isRunning`, `backtestResult`, `runError` fields
2. **Create Zod schemas** — `strategy-input-panel.schema.ts`, `strategy-output-panel.schema.ts`
3. **Build `StrategyInputPanel` organism** — textarea + inline validation + Run button
4. **Build `StrategyOutputPanel` organism** — empty / loading / result / error states
5. **Write Storybook stories** — verify all states visually before wiring
6. **Update `+page.svelte`** — compose organisms, remove inline markup
7. **Write BDD feature file** — `features/strategy-builder-panels.feature`
8. **Run CI locally** — `pnpm lint`, `pnpm test`, Storybook build

## Running Tests

```bash
# Unit tests
pnpm test

# E2E tests (Playwright)
pnpm e2e

# BDD (Cucumber)
pnpm cucumber
```
