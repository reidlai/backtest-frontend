@smoke @strategy-builder
Feature: Strategy Builder Input and Output Panels
  As a user of the Strategy Builder page
  I want an Input Panel to configure my strategy and a Run button to trigger execution
  And an Output Panel to display results, loading, error, and empty states
  So that I can build, run, and review backtest strategies on a single page

  # US1: Configure Strategy Inputs
  Scenario: Input Panel renders with disabled Run button on page load
    Given I navigate to "/strategy-builder"
    When the page has loaded
    Then the Input Panel is visible
    And the Run button is disabled

  Scenario: Input Panel shows inline error when strategy description is too short
    Given I navigate to "/strategy-builder"
    And the Input Panel is visible
    When I type fewer than 10 characters in the strategy description field
    And I move focus away from the field
    Then an inline error message "Strategy description must be at least 10 characters" is shown
    And the Run button remains disabled

  Scenario: Input Panel enables Run button when strategy description is valid
    Given I navigate to "/strategy-builder"
    And the Input Panel is visible
    When I type a strategy description of 10 or more characters
    Then no inline error message is shown
    And the Run button is enabled

  Scenario: Run button is disabled while backtest is running
    Given I navigate to "/strategy-builder"
    And I have entered a valid strategy description
    When I click the Run button
    Then the Run button becomes disabled
    And the Output Panel shows a loading state

  # US2: View Strategy Results
  Scenario: Output Panel shows empty state on initial page load
    Given I navigate to "/strategy-builder"
    When the page has loaded
    Then the Output Panel shows a placeholder with instructional text

  Scenario: Output Panel displays results after a successful backtest run
    Given I navigate to "/strategy-builder"
    And I have entered a valid strategy description
    When I click the Run button
    And the backtest completes successfully
    Then the Output Panel displays performance metric tiles
    And the Output Panel displays an equity curve chart
    And the Output Panel displays a trade summary table

  Scenario: Output Panel shows inline error when backtest fails
    Given I navigate to "/strategy-builder"
    And I have entered a valid strategy description
    When I click the Run button
    And the backtest fails with an error
    Then the Output Panel displays an inline error message
    And the Input Panel remains editable

  # US3: Side-by-Side Layout
  Scenario: Both panels are visible side by side on desktop viewport
    Given I navigate to "/strategy-builder"
    And my viewport width is 1280 pixels or wider
    When the page has loaded
    Then the Input Panel and Output Panel are displayed side by side
    And neither panel has overflowing or clipped content

  Scenario: Panels stack vertically on tablet viewport
    Given I navigate to "/strategy-builder"
    And my viewport width is between 768 and 1023 pixels
    When the page has loaded
    Then the Input Panel and Output Panel are stacked vertically
    And neither panel has overflowing or clipped content
