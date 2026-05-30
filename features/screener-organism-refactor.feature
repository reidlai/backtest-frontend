@screener @smoke
Feature: Fundamental Screener Organism Refactor
  As a developer
  I want the fundamental screener page to delegate its filter block and results table to dedicated organism components
  So that each organism manages its own state and the page remains a thin composition shell

  Background:
    Given the application is running

  # --- US1: Filter Controls as Reusable Component ---

  @smoke
  Scenario: Filter controls render with default values
    Given the user is on the Fundamental Screener page
    When the ScreenerFilterPanel organism is displayed
    Then the Universe select shows "S&P 500"
    And the PE Ratio input shows "30"
    And the ROIC input shows "15"
    And the Revenue Growth input shows "10"

  Scenario: Filter state updates remain internal to the organism
    Given the user is on the Fundamental Screener page
    When the user changes the Universe filter to "Nasdaq 100"
    Then the Universe select shows "Nasdaq 100"
    And the page component does not receive the updated filter value

  Scenario: Filter values are restored after navigation
    Given the user is on the Fundamental Screener page
    And the user has set the Universe filter to "Russell 2000"
    And the user has set the PE Ratio filter to "25"
    When the user navigates to the "Home" page
    And the user navigates back to the Fundamental Screener page
    Then the Universe filter shows "Russell 2000"
    And the PE Ratio filter shows "25"

  Scenario: Invalid snapshot data is ignored gracefully
    Given a corrupt snapshot exists for the Fundamental Screener with invalid field types
    When the user navigates back to the Fundamental Screener page
    Then the Universe filter shows "S&P 500"
    And no error is displayed to the user

  # --- US2: Results Table as Reusable Component ---

  @smoke
  Scenario: Results table renders all columns with sample data
    Given the user is on the Fundamental Screener page
    When the ScreenerResultTable organism is displayed
    Then the results table shows the Symbol column
    And the results table shows the Name column
    And the results table shows the P/E column
    And the results table shows the EV/EBITDA column
    And the results table shows the FCF Yield column
    And the results table shows the ROIC column
    And the results table shows the Rev Growth column
    And the results table shows the EPS Growth column
    And the results table shows the Score column
    And the results table shows the Action column

  Scenario: Clicking Backtest navigates to the backtest engine
    Given the user is on the Fundamental Screener page
    When the user clicks the Backtest button for a result row
    Then the user is navigated to the backtest engine page

  Scenario: Results table renders without crashing when data is empty
    Given the ScreenerResultTable organism receives an empty data set
    When the organism renders
    Then the table header is visible
    And the table body contains no rows

  # --- US3: Sample Data at Organism Level ---

  Scenario: Page component has no direct data import
    Given the fundamental screener page is loaded
    Then the page script block does not import sampleScreenerResults
    And the ScreenerResultTable organism sources data internally
