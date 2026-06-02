# Implementation Plan: Fix Browser Extension Message Channel Error

**Branch**: `019-fix-browser-extension-error` | **Date**: 2026-06-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/019-fix-browser-extension-error/spec.md`

## Summary

The "message channel closed" error seen on initial page load at `localhost:5173` originates from a **browser extension** (`runtime-*.js`), not from application code. This was confirmed during the prior investigation in `specs/009-fix-ui-runtime-errors`. The application contains no `chrome.runtime` API calls. The implementation for this feature is threefold: (1) update the spec to reflect the confirmed root cause, (2) add a dedicated BDD feature file covering home page load console cleanliness, and (3) ensure the existing `async-channel.stub.ts` forward-compatibility scaffold is sufficient for the upcoming mock-to-API transition — extending it if not.

## Technical Context

**Language/Version**: TypeScript 5.x (SvelteKit, Svelte 5 runes)

**Primary Dependencies**: SvelteKit, Svelte 5, Vite, Vitest (unit), Playwright (e2e), Cucumber/Gherkin (BDD)

**Storage**: N/A — no state changes

**Testing**: Vitest (unit), Playwright (e2e), Cucumber/Gherkin (`features/`)

**Target Platform**: Browser (Chrome/Chromium); local dev via `pnpm dev` / Vite

**Project Type**: SvelteKit web application (frontend only)

**Performance Goals**: N/A — this is a documentation and test coverage fix

**Constraints**: No suppression of real errors; no new async patterns introduced; fix must be forward-compatible with mixed async patterns (fetch-on-mount and event-driven) across organisms

**Scale/Scope**: 1 BDD feature file added; 1 spec file updated; `async-channel.stub.ts` reviewed (extended if needed)

## Constitution Check

| Gate | Rule | Check | Status |
|---|---|---|---|
| Branch name follows `###-feature-name` format | Rule 1 | `019-fix-browser-extension-error` matches `[0-9]{3}-[a-z_-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios for all 3 user stories | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | No Docker changes in this fix | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Tasks will include `ci-sca`, `ci-format-lint`, `ci-secrets-scan`, `ci-unit-tests` | ✅ |
| Required directory structure included | Rule 9 | `features/` exists and will be updated | ✅ |
| UI components follow Atomic Design + Storybook (if frontend feature) | Rule 12 | No new UI components | N/A |
| Virtual module structure respected (if adding new module) | Rule 11 | No new modules added | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | No secrets involved | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/019-fix-browser-extension-error/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal — no data model changes)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (affected files)

```text
features/
└── fix-browser-extension-error.feature   # ADD — BDD acceptance gate for home page load

src/lib/services/
└── async-channel.stub.ts                 # REVIEW — extend forward-compat scaffold if gaps found

specs/019-fix-browser-extension-error/
└── spec.md                               # UPDATE — correct root cause to confirmed browser-extension origin
```

## Phase 0: Research

See [research.md](./research.md) for full findings.

### Root Cause (confirmed from prior investigation)

The error `"A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"` originates from a Chrome browser extension's `runtime-*.js` service worker script (Manifest V3 pattern). The application source code contains **no `chrome.runtime` API calls** — confirmed by grep across `src/`.

Reference: `specs/009-fix-ui-runtime-errors/plan.md` — Bug 2 section.

### Why no application fix is required

The extension listener is owned by a third-party extension in the developer's Chrome profile. The application cannot prevent a foreign extension from mis-handling its own async message channel. Adding error suppressors (`window.addEventListener('unhandledrejection')`) was explicitly rejected in the prior investigation as it would mask real application errors.

### What IS required

1. **BDD coverage**: A Gherkin scenario asserting zero console errors on home page load. This serves as an acceptance gate now (passing because the app is not the source) and as a regression detector if future API integration accidentally introduces the same error pattern.
2. **Spec correction**: Update `spec.md` to record the confirmed root cause.
3. **Stub review**: Confirm `async-channel.stub.ts` adequately documents the safe async channel pattern for both fetch-on-mount and event-driven organisms. Extend if gaps exist.

### Async pattern guidance (for future API migration)

Per clarification in the spec, organisms will use **mixed patterns**:
- **Fetch-on-mount organisms**: Must cancel or ignore in-flight requests if the component unmounts before the response arrives (e.g., via `AbortController` or an `isMounted` flag)
- **Event-driven organisms**: Must deregister listeners on component destroy/unmount

The `async-channel.stub.ts` documents the `chrome.runtime.sendMessage` pattern. It should be extended to also document the fetch-on-mount cancellation pattern as a code comment, since that is the more common pattern for this app.

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md).

No persistent data model changes. The only interface introduced is the BDD feature file contract and an extension to the stub's documented patterns.

### BDD Feature Contract

New file: `features/fix-browser-extension-error.feature`

```gherkin
@smoke @fix
Feature: Fix Browser Extension Message Channel Error on Initial Page Load

  As a developer running the backtest app locally
  I want the browser console to be free of message channel errors on page load
  So that real application errors are not masked during development

  Scenario: Home page loads without message channel errors
    Given the app is running
    When the user navigates to "/"
    Then the browser console shows no uncaught errors

  Scenario: Home page console stays clean across multiple reloads
    Given the app is running
    When the user reloads "/" 10 consecutive times
    Then the browser console shows no uncaught errors

  Scenario: Console remains clean when async data source is swapped from mock to real
    Given the app is running with at least one component using a real async data source
    When the user navigates to "/"
    Then the browser console shows no message channel errors
```

### Agent Context Update

CLAUDE.md will be updated to point to this plan file between the `<!-- SPECKIT START -->` and `<!-- SPECKIT END -->` markers.
