@screener @frontend
Feature: Technical Screener Reactive State
  As a user of the backtest frontend
  I want the Technical Screener page to respond immediately when I select or deselect chart patterns
  So that the UI always reflects my current selections without stale state or console errors

  Background:
    Given the application is running

  # ── User Story 1: Navigate Without Console Errors ─────────────────────────────

  @smoke @p1
  Scenario: Technical Screener page loads without reactive state console errors
    When the user navigates to the Technical Screener page
    Then no console warnings about reactive state are present
    And no "non_reactive_update" errors appear in the browser console

  @smoke @p1
  Scenario: Pattern selection immediately updates the UI
    Given the user is on the Technical Screener page
    When the user selects the "Bull Flag" pattern
    Then the "Bull Flag" pattern button appears selected
    And no console warnings about reactive state are present

  @smoke @p1
  Scenario: Pattern deselection immediately updates the UI
    Given the user is on the Technical Screener page
    And the user has selected the "Bull Flag" pattern
    When the user deselects the "Bull Flag" pattern
    Then the "Bull Flag" pattern button appears unselected
    And no console warnings about reactive state are present

  # ── User Story 2: Pattern Selection State Persists Correctly ──────────────────

  @smoke @p2
  Scenario: Selected patterns are restored after navigation round-trip
    Given the user is on the Technical Screener page
    And the user has selected the "Bull Flag" pattern
    When the user navigates to the Research Workbench page
    And the user navigates back to the Technical Screener page
    Then the "Bull Flag" pattern button is selected

  @p2
  Scenario: Empty pattern selection is restored after navigation round-trip
    Given the user is on the Technical Screener page
    And no patterns are selected
    When the user navigates to the Research Workbench page
    And the user navigates back to the Technical Screener page
    Then no pattern buttons are selected

  @p2
  Scenario: Unknown pattern IDs in snapshot are silently skipped on restore
    Given a snapshot exists for the Technical Screener with a pattern ID that no longer exists
    When the user navigates to the Technical Screener page
    Then only the valid patterns from the snapshot are restored
    And no error is displayed to the user
    And no console warnings about reactive state are present
