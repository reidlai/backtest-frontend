@regime-breakdown-organism @frontend
Feature: Regime Breakdown Organism
  As a developer
  I want the Regime Breakdown section to be a self-contained organism with local state and Zod schema validation
  So that the parent page is decoupled from data management and the component is independently reusable

  Background:
    Given the organism file "src/lib/components/organisms/RegimeBreakdownTable.svelte" exists
    And the schema file "src/lib/schemas/regime-breakdown.schema.ts" exists

  # -------------------------------------------------------------------------
  # User Story 1 — View Regime Breakdown Table
  # -------------------------------------------------------------------------

  @smoke
  Scenario: Regime Breakdown section renders with correct heading and columns
    Given the performance result page is loaded
    When the Regime Breakdown section renders
    Then a heading "Regime Breakdown" is visible
    And a table with columns "Regime", "Return", "Max DD", and "Win Rate" is visible

  @smoke
  Scenario: Positive return percentage is displayed in green
    Given the organism contains a row with a positive returnPct
    When the table row renders
    Then the return cell has the CSS class "text-green-400"

  @smoke
  Scenario: Negative return percentage is displayed in red
    Given the organism contains a row with a negative returnPct
    When the table row renders
    Then the return cell has the CSS class "text-red-400"

  @smoke
  Scenario: Max drawdown is always displayed in red
    Given the organism contains a row with any maxDrawdown value
    When the table row renders
    Then the max drawdown cell has the CSS class "text-red-400"

  @smoke
  Scenario: Empty state message shown when data array is empty
    Given the organism's internal data array is empty
    When the table body renders
    Then a single row with the message "No data available" is displayed spanning all columns

  # -------------------------------------------------------------------------
  # User Story 2 — Schema Validation Feedback
  # -------------------------------------------------------------------------

  @integration
  Scenario: Invalid rows are excluded without crashing
    Given the organism's internal data contains one row missing the "winRate" field
    When the organism initialises its local state
    Then the invalid row is excluded from the rendered table
    And no runtime error is thrown

  @integration
  Scenario: All valid rows render without error
    Given the organism's internal data contains only valid RegimeBreakdown rows
    When the organism renders
    Then all rows are displayed in the table
    And no rows are excluded

  # -------------------------------------------------------------------------
  # User Story 3 — Local State Isolation
  # -------------------------------------------------------------------------

  @smoke
  Scenario: Parent page does not pass data props to the organism
    Given the performance result page is loaded
    When the page template is inspected
    Then the "<RegimeBreakdownTable />" tag has no attributes or props
    And "sampleRegimeBreakdown" is not referenced in the parent page script block for this section
