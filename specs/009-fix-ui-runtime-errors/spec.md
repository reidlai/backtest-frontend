# Feature Specification: Fix UI Runtime Errors on Technical Screener and Performance Result Pages

**Feature Branch**: `009-fix-ui-runtime-errors`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "Fix runtime errors when navigating to Technical Screener and Performance Result pages in the development environment."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Navigate to Technical Screener Without Errors (Priority: P1)

A user clicks the "Technical Screener" menu item in the sidebar and lands on the page without any errors appearing in the browser console.

**Why this priority**: The page crashes with an unhandled async error on every navigation, making the feature unusable and degrading developer confidence during manual testing.

**Independent Test**: Open the app, click "Technical Screener" in the navigation, and observe the browser console — no uncaught errors should appear.

**Acceptance Scenarios**:

1. **Given** the app is running and the user is on any page, **When** the user clicks "Technical Screener" in the navigation, **Then** the page loads successfully with no uncaught errors in the browser console.
2. **Given** the Technical Screener page is loaded, **When** the user interacts with pattern selection or indicator dropdowns, **Then** no new errors appear in the console.

---

### User Story 2 - Navigate to Performance Result Without Errors (Priority: P1)

A user clicks the "Performance Result" menu item and sees the page load without a TypeError about `totalReturn` being undefined.

**Why this priority**: The page crashes immediately on load due to accessing a property on an undefined object in a reactive `$effect`, making the Performance Result page completely broken.

**Independent Test**: Open the app, click "Performance Result" in the navigation, and verify the page renders its metric tiles without a TypeError in the console.

**Acceptance Scenarios**:

1. **Given** the app is running and no backtest has been executed yet, **When** the user navigates to "Performance Result", **Then** the page renders with default or empty metric values and no TypeError in the console.
2. **Given** `appState.simulatedMetrics` has not been populated, **When** the Performance Result page's reactive effect runs, **Then** the effect safely handles the absence of metrics data without throwing.
3. **Given** `appState.simulatedMetrics` is populated (e.g., after a backtest), **When** the user navigates to "Performance Result", **Then** the page renders the correct metric values from state.

---

### Edge Cases

- `simulatedMetrics` is always defined at page load — AppState initialises it with zero defaults before any component mounts; the "undefined at load" scenario cannot occur after FR-003 is implemented.
- Individual fields (`totalReturn`, `maxDrawdown`, `winRate`) cannot be missing — the Zod schema enforces all three as required numeric fields with defaults.
- If the user navigates away from and back to Technical Screener rapidly, no new errors appear — the async listener handles early channel closure gracefully and does not accumulate error state across navigations.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The application MUST NOT throw uncaught errors in the browser console when navigating to the Technical Screener page.
- **FR-002**: The application MUST NOT throw a TypeError when the Performance Result page loads with no prior backtest data.
- **FR-003**: The `appState` object MUST expose a `simulatedMetrics` property initialised with numeric defaults: `totalReturn: 0`, `maxDrawdown: 0`, `winRate: 0`. The `AppStateSchema` Zod schema MUST be updated to include this property with matching defaults.
- **FR-004**: The `$effect` in the Performance Result page MUST read `simulatedMetrics` values directly from `appState` without null-guard checks — the guarantee of non-null values is provided by FR-003 (AppState initialisation), not by defensive component code.
- **FR-005**: The application's async message channel pattern MUST handle the mock-data scenario gracefully — when a mock response closes the channel before a reply is sent, the listener MUST NOT throw an uncaught error. The fix must remain compatible with future real async API integration.
- **FR-006**: Both pages MUST remain functionally equivalent to their pre-fix behaviour when data is present.

### Key Entities

- **AppState**: The shared reactive application state singleton; currently missing `simulatedMetrics` which the Performance Result page expects.
- **simulatedMetrics**: An object containing `totalReturn`, `maxDrawdown`, and `winRate` numeric fields representing results of a simulated backtest.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Navigating to the Technical Screener page produces zero uncaught errors in the browser console on 5 consecutive navigation attempts.
- **SC-002**: Navigating to the Performance Result page with no prior backtest data produces zero TypeErrors in the browser console on 5 consecutive navigation attempts.
- **SC-003**: The Performance Result page displays metric tiles (with default/empty values) within 2 seconds of navigation when no backtest has been run.
- **SC-004**: All existing automated tests continue to pass after the fix is applied.

## Clarifications

### Session 2026-05-31

- Q: Which approach should be used to prevent the `simulatedMetrics` TypeError — add defaults to `AppState` or add null-guards in the page? → A: Add `simulatedMetrics` with numeric defaults (`totalReturn: 0`, `maxDrawdown: 0`, `winRate: 0`) to `AppState` and update the Zod schema accordingly.
- Q: Is the Technical Screener async message channel error in scope to fix, or a known external artifact? → A: Fully in scope. The app is designed for async API integration; the error occurs because mock data closes the message channel before a response is sent. The async communication pattern must handle the mock-data scenario gracefully so it does not break when real APIs are wired in.

## Assumptions

- The "A listener indicated an asynchronous response" error on the Technical Screener page is an application-level bug: the app is designed for async API integration, but currently uses mock data that closes the message channel before a response is returned. The fix must make the async listener resilient to early channel closure while preserving forward-compatibility with real API wiring.
- The `simulatedMetrics` property on `AppState` MUST be initialised with `{ totalReturn: 0, maxDrawdown: 0, winRate: 0 }` as structured defaults; null-guard workarounds inside page components are explicitly out of scope.
- The fix should not introduce new state management patterns beyond what already exists in the codebase.
- Mobile support and accessibility are out of scope for this bug fix.
- The Zod schema governing `AppState` (`AppStateSchema`) MUST be updated to include `simulatedMetrics` with all three numeric fields (`totalReturn`, `maxDrawdown`, `winRate`) defaulting to `0`.
