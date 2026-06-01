# Feature Specification: Fix Technical Screener Reactive State

**Feature Branch**: `017-fix-technical-screener-state`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "When I click Technical Screener menu item, i got the following error in console: `selectedPatterns` is updated, but is not declared with `$state(...)`. Changing its value will not correctly trigger updates"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Navigate to Technical Screener Without Console Errors (Priority: P1)

A user clicks the Technical Screener menu item and the page loads without any reactive state warnings or errors in the browser console.

**Why this priority**: The warning indicates `selectedPatterns` is not properly reactive, meaning UI will not update when patterns are selected or deselected — core functionality is broken.

**Independent Test**: Navigate to the Technical Screener page and open the browser console. Verify no `non_reactive_update` warning appears.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** the user clicks the Technical Screener menu item, **Then** the page loads with no console errors or warnings about reactive state
2. **Given** the Technical Screener page is open, **When** the user selects or deselects a chart pattern, **Then** the UI updates immediately to reflect the change without stale state

---

### User Story 2 - Pattern Selection State Persists Correctly (Priority: P2)

A user selects chart patterns on the Technical Screener page, navigates away, and returns to find the previously selected patterns restored via snapshot.

**Why this priority**: The snapshot capture/restore logic depends on `selectedPatterns` being reactive. Without proper reactivity, snapshot restoration may silently fail.

**Independent Test**: Select one or more patterns, navigate away (triggering snapshot capture), then navigate back. The selected patterns should be restored.

**Acceptance Scenarios**:

1. **Given** the user has selected patterns on the Technical Screener page, **When** the user navigates away and returns, **Then** the previously selected patterns are restored correctly
2. **Given** an invalid or empty snapshot, **When** the page loads, **Then** `selectedPatterns` defaults to an empty set with no errors

---

### Edge Cases

- When the snapshot contains pattern IDs that no longer exist in the available list, those IDs are silently skipped and only the remaining valid patterns are restored.
- How does the system handle a very large number of selected patterns on snapshot restore?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The `selectedPatterns` variable on the Technical Screener page MUST be declared as reactive state so the UI updates correctly when patterns are added or removed
- **FR-002**: Selecting or deselecting a chart pattern MUST immediately reflect in the UI without manual refresh
- **FR-003**: The snapshot capture MUST correctly serialize the current set of selected patterns
- **FR-004**: The snapshot restore MUST correctly repopulate the reactive set from a previously captured snapshot
- **FR-005**: The browser console MUST NOT display `non_reactive_update` warnings related to `selectedPatterns` when the Technical Screener page is loaded or used

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero console warnings or errors related to `selectedPatterns` reactivity appear when navigating to or using the Technical Screener page
- **SC-002**: Pattern selection and deselection are reflected in the UI within one render cycle (visually instant to the user)
- **SC-003**: Snapshot restore correctly repopulates all previously selected patterns on 100% of round-trips
- **SC-004**: A Playwright end-to-end test passes in CI, confirming the Technical Screener page loads without reactive state console errors and that pattern selection updates the UI correctly

## Clarifications

### Session 2026-06-01

- Q: What happens when the snapshot contains pattern IDs that no longer exist in the available list? → A: Silently skip unknown IDs — restore only the IDs that still exist, ignore the rest
- Q: Should an automated regression test be added to prevent recurrence? → A: Yes — add a Playwright end-to-end test covering: page loads without console errors, pattern selection reflects in UI

## Assumptions

- The fix scope is limited to the `selectedPatterns` declaration in `src/routes/technical-screener/+page.svelte`
- `SvelteSet` from `svelte/reactivity` is the correct collection type and does not need to be replaced — only the `$state` wrapper is missing
- No other variables on this page have the same reactivity issue
- The existing snapshot schema (`TechnicalScreenerSchema`) correctly validates the shape of captured state and does not need changes
