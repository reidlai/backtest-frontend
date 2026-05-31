# Research: Fix UI Runtime Errors

**Branch**: `009-fix-ui-runtime-errors` | **Date**: 2026-05-31

## Decision 1: simulatedMetrics default value strategy

**Decision**: Add `SimulatedMetricsSchema` as a nested Zod object inside `AppStateSchema`, with all three fields (`totalReturn`, `maxDrawdown`, `winRate`) defaulting to `0`. Mirror this in the `AppState` class as a `$state` property initialized from `AppStateSchema.parse({})`.

**Rationale**: The existing codebase uses a consistent pattern — `AppStateSchema.parse({})` produces defaults, and the class reads from `_defaults`. Adding `simulatedMetrics` to the schema is the minimal, idiomatic change that eliminates the TypeError at source rather than patching call sites.

**Alternatives considered**:
- Null-guard in `+page.svelte $effect` — rejected by user (Q1 in spec clarifications): pollutes component with defensive code and doesn't scale when more pages consume this state
- Optional field (`z.number().optional()`) — rejected: would still require null-guards everywhere the value is consumed

---

## Decision 2: Technical Screener async error origin and fix scope

**Decision**: The `runtime-D52C4acv.js` error originates from a Chrome browser extension, not from application code. The Technical Screener page has no `chrome.runtime` API calls. No application-level fix is possible for the current codebase. Scope for this branch is:
1. Document the finding clearly in the plan
2. Add a BDD acceptance test asserting zero console errors on Technical Screener navigation — this creates a regression gate for when async API integration is added

**Rationale**: Investigating all source files confirms zero `chrome.runtime`, `sendMessage`, or `onMessage` usage. The error naming pattern (`runtime-HASH.js`) is characteristic of Chrome Extension MV3 service worker scripts, not Vite or SvelteKit internals.

**Alternatives considered**:
- Global `unhandledrejection` suppressor — rejected: would hide real errors
- Vite plugin to intercept extension logs — rejected: technically not feasible; extension scripts bypass Vite's module system
- Wait for async API integration to scaffold message handlers — partially accepted: BDD test scaffold created now, handler implementation deferred to the integration feature branch

---

## Findings: Existing test patterns

- Unit tests live in `src/lib/schemas/__tests__/` using Vitest
- `state-schemas.schema.test.ts` already tests `AppStateSchema.parse({})` — this test must be updated to include `simulatedMetrics` in the expected output
- BDD feature files live in `features/` using Cucumber/Gherkin (Rule 6 requires this)
- E2E tests use Playwright

## Findings: AppState class pattern

```typescript
// Current pattern in src/lib/state/app.svelte.ts
import { AppStateSchema } from '$lib/schemas';

const _defaults = AppStateSchema.parse({});

class AppState {
    backtestPrefillSymbol = $state(_defaults.backtestPrefillSymbol);
}

export const appState = new AppState();
```

The fix adds one property to the schema and one property to the class, following this exact pattern with no new abstractions.
