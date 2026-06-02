# Research: Fix Browser Extension Message Channel Error

**Branch**: `019-fix-browser-extension-error` | **Date**: 2026-06-02

## Decision Log

### Decision 1: Root Cause Origin

**Decision**: The error originates from a Chrome browser extension (`runtime-*.js`), not from application code.

**Rationale**: Confirmed by prior investigation in `specs/009-fix-ui-runtime-errors/plan.md` (Bug 2). The `runtime-*.js` naming is characteristic of Chrome Extension Manifest V3 service worker scripts. The application source contains no `chrome.runtime` API calls (verified by grep across `src/`). The existing `src/lib/services/async-channel.stub.ts` file documents this finding.

**Alternatives considered**:
- App-level `unhandledrejection` suppressor — rejected: masks real errors
- Vite config suppression — rejected: extension scripts are injected by Chrome, not Vite
- App-level `chrome.runtime.onMessage` listener returning `false` — rejected: app has no extension integration; adding such a listener would be premature and confusing

---

### Decision 2: Fix Strategy

**Decision**: No application code fix is needed for the current state. Deliver: (1) a BDD feature file as an acceptance gate, (2) a spec correction, and (3) an extension to `async-channel.stub.ts` documenting fetch-on-mount cancellation patterns.

**Rationale**: The spec clarification confirmed "investigate first, then fix." Investigation (from feature 009 and codebase grep) confirms no app-level cause exists. The correct deliverable is documentation + test coverage to serve as a regression gate when API integration begins.

**Alternatives considered**:
- Proactively auditing all components for improper listener cleanup — deferred: no evidence of app-level listener misuse; would add scope without confirmed benefit
- Skipping BDD coverage — rejected: violates Constitution Rule 6 and Rule 8

---

### Decision 3: Async Pattern Documentation

**Decision**: Extend `async-channel.stub.ts` to also document the fetch-on-mount cancellation pattern using `AbortController`, since most organisms will use this pattern rather than `chrome.runtime`.

**Rationale**: The spec (FR-008) requires the fix to accommodate mixed async patterns. The stub currently only documents `chrome.runtime.sendMessage`. Adding an `AbortController` example makes the stub a complete reference for all async patterns this app will use.

**Alternatives considered**:
- Creating a separate stub file for fetch-on-mount — rejected: over-engineering for documentation; one file is sufficient
- Adding this to CLAUDE.md — rejected: code-adjacent documentation belongs alongside the service layer

---

### Decision 4: BDD Step Definition Reuse

**Decision**: Reuse existing step definitions from `features/step-definitions/` where possible (specifically the "app is running", "user navigates to", and "browser console shows no uncaught errors" steps already defined for feature 009).

**Rationale**: Step definitions in `features/step-definitions/` are already atomic and reusable per Constitution Rule 6. The "browser console shows no uncaught errors" step is already implemented for the Technical Screener scenario.

**Alternatives considered**:
- Writing new step definitions for every scenario — rejected: violates DRY and Constitution Rule 6's "atomic and reusable" requirement
