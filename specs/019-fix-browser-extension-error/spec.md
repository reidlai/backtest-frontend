# Feature Specification: Fix Browser Extension Message Channel Error

**Feature Branch**: `019-fix-browser-extension-error`

**Created**: 2026-06-02

**Status**: Ready-for-Implementation

**Input**: User description: "when I load http://localhost:5173 after running pnpm dev, my browser immediately get the following error in developer console: Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Clean Dev Server Load (Priority: P1)

A developer runs `pnpm dev` and opens the local dev server URL in their browser. The page loads without any errors appearing in the developer console.

**Why this priority**: The error appears immediately on page load, making it the first thing any developer or user encounters. A clean console is essential for productive development and prevents masking of real errors.

**Independent Test**: Open the browser console, navigate to the dev server, verify no uncaught promise errors appear on initial load.

**Acceptance Scenarios**:

1. **Given** the dev server is running, **When** a developer opens the app in the browser, **Then** no "message channel closed" error appears in the browser console
2. **Given** a browser with extensions installed, **When** the app page loads, **Then** the app does not trigger asynchronous message listener errors
3. **Given** a clean browser profile (no extensions), **When** the app page loads, **Then** no console errors appear related to message channels

---

### User Story 2 - Stable Reload Behavior (Priority: P2)

A developer repeatedly reloads the page without accumulating console errors.

**Why this priority**: Frequent reloads are common during development. Persistent errors on every reload degrade confidence in the development environment.

**Independent Test**: Reload the page 5 times and verify the error does not appear on any reload.

**Acceptance Scenarios**:

1. **Given** the app has loaded once, **When** the developer presses reload, **Then** no new message channel errors appear
2. **Given** hot module replacement is active, **When** the browser refreshes, **Then** console remains error-free for this class of error

---

### User Story 3 - Future API Migration Compatibility (Priority: P3)

After the app transitions from mock data to real API calls, the fix remains effective and no new message channel errors are introduced by the async data-fetching layer.

**Why this priority**: The app currently uses mock data but will eventually use live API calls. Any fix must not assume mock data is permanent — it should handle async patterns that will be used in production.

**Independent Test**: Swap mock data for a real API call in one component and verify no new message channel errors appear.

**Acceptance Scenarios**:

1. **Given** a component uses an async API call instead of mock data, **When** the page loads, **Then** no message channel errors appear
2. **Given** an API call is in-flight, **When** the component unmounts, **Then** the listener is properly cleaned up and no error is thrown

---

### Edge Cases

- What happens when a browser extension actively intercepts page messages — does the app's own messaging still work correctly?
- How does the system behave if both the app and a browser extension register async message listeners on the same channel?
- Does the error recur after navigating between routes in a single-page application context?
- What happens if an API call is initiated and the component unmounts before the response arrives?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The developer console MUST show no "message channel closed" errors during normal app use on initial page load, regardless of whether the source is application code or a third-party browser extension — confirmed clean console is the measurable outcome
- **FR-002**: Any asynchronous message listeners registered in component-level code (e.g., lifecycle hooks, event handlers) MUST either resolve or reject their promises before the message channel closes
- **FR-003**: The application MUST properly clean up component-level message listeners when a component unmounts or the page unloads
- **FR-004**: The fix MUST NOT break any existing functionality that relies on browser messaging or inter-component communication
- **FR-005**: The application MUST remain functional when browser extensions that use the same messaging APIs are also installed
- **FR-006**: The fix MUST be compatible with the app's future transition from mock data to live API calls — async listener cleanup patterns must apply equally to both mock and real data sources
- **FR-007**: Investigation MUST confirm whether the error originates from application code or a third-party browser extension before any code change is made. **[RESOLVED]**: Investigation in specs/009-fix-ui-runtime-errors confirmed no app-level component is responsible — the error is owned by a Chrome browser extension's `runtime-*.js` script.
- **FR-008**: The fix MUST accommodate mixed async patterns across organisms — components that fetch on mount require in-flight request cancellation on unmount, while event-driven components require listener deregistration on unmount; no single pattern should be assumed for all components

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero instances of the "message channel closed" error appear in the browser console when loading the app after starting the dev server
- **SC-002**: The error does not recur across 10 consecutive page reloads in a clean browser session (defined as: a browser session with no third-party extensions installed, or equivalently a session where console errors are filtered to `localhost:*` origin to exclude extension-injected noise)
- **SC-003**: Existing features continue to work correctly after the fix is applied — no regressions introduced
- **SC-004**: After replacing mock data with a real async data source in at least one component, no new message channel errors appear on load or unmount

## Assumptions

- The root cause has been confirmed by prior investigation (specs/009-fix-ui-runtime-errors): the error originates from a Chrome browser extension's runtime script (`runtime-*.js`), not from application code
- The application contains no `chrome.runtime` API calls; a forward-compatibility stub (`src/lib/services/async-channel.stub.ts`) documents the correct pattern for future async API integration
- The application currently uses mock data but will transition to live API calls; organisms that do not require streaming will use fetch-on-mount, while others may use event-driven patterns — the fix must accommodate both
- The development environment uses a Chromium-based browser where this error is surfaced
- The fix will be applied to the frontend codebase; no backend or infrastructure changes are required
- Hot Module Replacement is active during development and may be related to how message listeners are registered and torn down
- The issue is reproducible and not environment-specific to a single developer's machine

## Clarifications

### Session 2026-06-02

- Q: What is the root cause origin of the error? → A: Unknown — root cause has not yet been investigated; the app currently uses mock data but will eventually adapt to API calls
- Q: Where in the codebase are async message listeners used? → A: Component-level code — lifecycle hooks, event listeners, or similar constructs in components
- Q: What is the preferred fix strategy? → A: Investigate first, then fix — identify the exact component(s) causing the error before writing any code change
- Q: How will async data fetching be structured when moving to real API calls? → A: Mixed — most organisms use fetch-on-mount with cleanup, but some may use event-driven patterns; the fix must not assume all organisms share the same async pattern
