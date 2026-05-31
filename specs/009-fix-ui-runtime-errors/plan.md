# Implementation Plan: Fix UI Runtime Errors on Technical Screener and Performance Result Pages

**Branch**: `009-fix-ui-runtime-errors` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-fix-ui-runtime-errors/spec.md`

## Summary

Two independent runtime errors crash the Technical Screener and Performance Result pages during manual testing. The primary fix is adding `simulatedMetrics` (with numeric zero defaults) to `AppStateSchema` and the `AppState` class so that the Performance Result page's reactive `$effect` has valid data on first load. The secondary fix documents and scaffolds the async message channel pattern that will be needed when the app integrates with its real async API, preventing the current browser-extension channel-closure error from recurring in that future context.

## Technical Context

**Language/Version**: TypeScript 5.x (SvelteKit, Svelte 5 runes)

**Primary Dependencies**: SvelteKit, Svelte 5 (`$state`, `$derived`, `$effect`), Zod (schema validation), Vitest (unit tests), Playwright (e2e)

**Storage**: In-memory reactive singleton (`AppState` class); no persistent storage for this feature

**Testing**: Vitest (unit — `src/lib/schemas/__tests__/`), Playwright (e2e), Cucumber/Gherkin (`features/`)

**Target Platform**: Browser (local dev via `pnpm dev` / Vite); Chrome-compatible

**Project Type**: SvelteKit web application (frontend only for this fix)

**Performance Goals**: Performance Result page renders within 2 seconds of navigation with default metric values

**Constraints**: No new state management patterns; no null-guards in page components; fix must be forward-compatible with future async API integration

**Scale/Scope**: 2 files changed (schema + state class); 1 test file updated; 1 BDD feature file added

## Constitution Check

| Gate | Rule | Check | Status |
|---|---|---|---|
| Branch name follows `###-feature-name` format | Rule 1 | `009-fix-ui-runtime-errors` matches `[0-9]{3}-[a-z_-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios for both user stories | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | No Docker changes in this fix | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Tasks will include `ci-sca`, `ci-format-lint`, `ci-secrets-scan`, `ci-unit-tests` | ✅ |
| Required directory structure included | Rule 9 | `features/` exists; `deploy/docker/` not touched by this fix | ✅ |
| UI components follow Atomic Design + Storybook (if frontend feature) | Rule 12 | Fix is to schema and state only — no new UI components; existing components unchanged | N/A |
| Virtual module structure respected | Rule 11 | No new modules added | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | No secrets involved | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/009-fix-ui-runtime-errors/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (affected files)

```text
src/
├── lib/
│   ├── schemas/
│   │   ├── app-state.schema.ts          # ADD simulatedMetrics field with defaults
│   │   └── __tests__/
│   │       └── state-schemas.schema.test.ts   # UPDATE AppStateSchema test
│   └── state/
│       └── app.svelte.ts                # ADD simulatedMetrics reactive property
└── routes/
    └── performance-result/
        └── +page.svelte                 # VERIFY $effect reads correctly (no change needed)

features/
└── fix-ui-runtime-errors.feature        # ADD BDD feature file (Rule 6 + Rule 8)
```

## Phase 0: Research

See [research.md](./research.md) for full findings.

### Bug 1: Performance Result — `TypeError: Cannot read properties of undefined (reading 'totalReturn')`

**Root Cause (confirmed)**:

- `AppState` class (`src/lib/state/app.svelte.ts`) only declares `backtestPrefillSymbol`
- `AppStateSchema` only defines `backtestPrefillSymbol`
- `performance-result/+page.svelte` line 70 accesses `appState.simulatedMetrics.totalReturn` inside a `$effect`
- On first render, `appState.simulatedMetrics` is `undefined` → TypeError

**Fix**: Add `simulatedMetrics` to both the Zod schema (with numeric defaults) and the `AppState` class (as a `$state` property initialized from schema defaults).

**Pattern (from existing codebase)**:
```
// app-state.schema.ts — existing pattern
const AppStateSchema = z.object({
  backtestPrefillSymbol: z.string().default('')
})

// app.svelte.ts — existing pattern
const _defaults = AppStateSchema.parse({})
class AppState {
  backtestPrefillSymbol = $state(_defaults.backtestPrefillSymbol)
}
```
The fix follows this exact same pattern, adding a nested object field.

---

### Bug 2: Technical Screener — Async Message Channel Error

**Root Cause (investigated)**:

The error `runtime-D52C4acv.js?v=adca5265` is a **browser extension runtime script** (the `runtime-*.js` naming is characteristic of Chrome Extension Manifest V3 service workers). The error "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received" is a standard `chrome.runtime.onMessage` error emitted when an extension listener returns `true` (signalling async) but never calls `sendResponse`.

**The application source code contains no `chrome.runtime` API calls.** The technical screener page itself has no async message handlers. The error originates from a browser extension installed in the developer's Chrome instance — not from SvelteKit, Vite HMR, or the application code.

**Why the user flagged it as in-scope**: The application will eventually integrate with async APIs (likely via a Chrome extension bridge or service worker for market data). When that integration is built, the same `chrome.runtime.onMessage` pattern will need to be implemented correctly or the error will recur at scale.

**Decision**: Two-part resolution:
1. **Immediate**: Document in code that this error during dev is a browser-extension artifact; no application fix is possible or needed for the current codebase state.
2. **Forward-compatible scaffold**: Add a `features/fix-ui-runtime-errors.feature` BDD test that asserts zero console errors on Technical Screener navigation. This will serve as the acceptance gate both now (passing because no app-level error exists) and in the future (catching regressions when async integration is added).

**Alternatives considered**:
- Adding a global `window.addEventListener('unhandledrejection', ...)` suppressor — rejected: masks real errors
- Using `chrome.runtime.sendMessage` with explicit `sendResponse` callbacks — premature: no extension integration exists yet
- Updating Vite config to suppress extension logs — rejected: not possible from Vite config; extension scripts are injected by Chrome independently

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md).

**`simulatedMetrics` shape** (added to `AppState`):

```
simulatedMetrics:
  totalReturn: number  (default: 0)
  maxDrawdown: number  (default: 0)
  winRate:     number  (default: 0)
```

**Zod schema addition**:

```
SimulatedMetricsSchema = z.object({
  totalReturn: z.number().default(0),
  maxDrawdown: z.number().default(0),
  winRate:     z.number().default(0)
})

AppStateSchema = z.object({
  backtestPrefillSymbol: z.string().default(''),
  simulatedMetrics: SimulatedMetricsSchema.default({})
})
```

**`AppState` class addition**:

```
class AppState {
  backtestPrefillSymbol = $state(_defaults.backtestPrefillSymbol)
  simulatedMetrics      = $state(_defaults.simulatedMetrics)
}
```

### Interface Contracts

No external API contracts introduced by this fix. The `simulatedMetrics` shape is an internal state contract consumed only by `performance-result/+page.svelte`.

### BDD Feature File

`features/fix-ui-runtime-errors.feature` will cover:
- Scenario: Technical Screener loads without uncaught errors
- Scenario: Performance Result loads with default metric values when no backtest run
- Scenario: Performance Result renders correct metric values when simulatedMetrics is populated
