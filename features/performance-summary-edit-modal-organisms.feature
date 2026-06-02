@performance-summary-edit-modal @frontend
Feature: Performance Summary & Edit Modal Organisms
  As a developer
  I want the Statistics Summary and Edit Modal sections to be self-contained organisms with local state and Zod schema validation
  So that the parent page is decoupled from their internal state and both organisms are independently reusable

  Background:
    Given the organism file "src/lib/components/organisms/PerformanceSummary.svelte" exists
    And the organism file "src/lib/components/organisms/EditMetricModal.svelte" exists
    And the schema file "src/lib/schemas/performance-summary.schema.ts" exists
    And the schema file "src/lib/schemas/edit-metric-modal.schema.ts" exists

  # -------------------------------------------------------------------------
  # User Story 1 — View Statistics Summary
  # -------------------------------------------------------------------------

  @smoke
  Scenario: Statistics Summary renders all stat rows
    Given the performance result page is loaded
    When the Statistics Summary organism mounts
    Then a heading "Statistics Summary" is visible
    And each stat row displays a label and a value side by side

  @smoke
  Scenario: Statistics Summary shows fallback when no valid data
    Given the organism's internal data array contains no valid PerfSummaryItem entries
    When the Statistics Summary organism renders
    Then a message "No statistics available" is displayed
    And no stat rows are rendered

  @smoke
  Scenario: Parent page no longer contains the inline Statistics Summary block
    Given the performance result page is loaded
    When the page template is inspected
    Then the "<PerformanceSummary />" tag is present
    And "samplePerfSummary" is not iterated directly in the parent page template for this section

  # -------------------------------------------------------------------------
  # User Story 2 — Edit Metric Value via Modal
  # -------------------------------------------------------------------------

  @smoke
  Scenario: Apply button is disabled when input is empty
    Given the parent sets open=true on the EditMetricModal organism
    And the input field is empty
    When the modal renders
    Then the Apply button is disabled
    And no inline error message is shown

  @smoke
  Scenario: Apply button is disabled and error shown for non-numeric input
    Given the parent sets open=true on the EditMetricModal organism
    When the user types "abc" into the input field
    Then the Apply button is disabled
    And an inline error message "Must be a valid number" is shown

  @smoke
  Scenario: Apply button is enabled for valid numeric input
    Given the parent sets open=true on the EditMetricModal organism
    When the user types "42.5" into the input field
    Then the Apply button is enabled

  @smoke
  Scenario: onApply callback fires with new value when Apply is clicked
    Given the parent sets open=true with tileId "total-return" and initialValue "12.5"
    And the user types "15.0" into the input field
    When the user clicks Apply
    Then the onApply callback is called with the value "15.0"

  @smoke
  Scenario: onClose callback fires when Cancel is clicked
    Given the parent sets open=true on the EditMetricModal organism
    When the user clicks Cancel
    Then the onClose callback is called
    And no onApply callback is fired

  @integration
  Scenario: Input resets to initialValue when modal is re-opened
    Given the parent previously opened the modal with initialValue "10.0"
    And the user typed "99.9" into the input field
    And the parent then set open=false and open=true with initialValue "20.0"
    When the modal renders again
    Then the input field displays "20.0"

  @smoke
  Scenario: Whitespace-only input is treated as invalid
    Given the parent sets open=true on the EditMetricModal organism
    When the user types "   " into the input field
    Then the Apply button is disabled
    And an inline error message is shown

  @smoke
  Scenario: editValue and isValid are not declared in the parent page script
    Given the performance result page source is inspected
    Then "editValue" is not declared as a local variable in the page script block
    And "isValid" is not declared as a local variable in the page script block
