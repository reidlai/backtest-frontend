@organisms @backtest-engine @smoke
Feature: Backtest Engine Column Organism Components
  As a developer
  I want the backtest engine page to render each configuration column as a dedicated organism component
  So that each column manages its own independent singleton state

  Background:
    Given the backtest engine page is loaded

  # --- Universe & Capital Column ---

  @smoke
  Scenario: Universe & Capital column renders as a dedicated organism
    When the backtest engine page is displayed
    Then the Universe & Capital column is rendered by the UniverseCapitalConfig organism
    And it displays the default backtest mode "Single Stock"
    And it displays the default universe "SPY"
    And it displays the default initial capital "100000"

  Scenario: Universe & Capital state updates in isolation
    When a user changes the backtest mode to "Watchlist"
    Then the universeCapitalConfigState mode is "Watchlist"
    And the scheduleExecutionConfigState is unchanged
    And the orderTypesConfigState is unchanged

  Scenario: UniverseCapitalConfig renders independently outside the page
    Given the UniverseCapitalConfig organism is rendered in isolation
    When the component initializes
    Then it displays the default values from universeCapitalConfigState
    And it does not require scheduleExecutionConfigState to be present
    And it does not require orderTypesConfigState to be present

  # --- Schedule & Execution Column ---

  @smoke
  Scenario: Schedule & Execution column renders as a dedicated organism
    When the backtest engine page is displayed
    Then the Schedule & Execution column is rendered by the ScheduleExecutionConfig organism
    And it displays the default start date "2020-01-01"
    And it displays the default end date "2024-12-31"
    And it displays the default timeframe "Daily"
    And it displays the default direction "Long"

  Scenario: Schedule & Execution state updates in isolation
    When a user changes the timeframe to "Weekly"
    Then the scheduleExecutionConfigState timeframe is "Weekly"
    And the universeCapitalConfigState is unchanged
    And the orderTypesConfigState is unchanged

  # --- Order Types Column ---

  @smoke
  Scenario: Order Types column renders as a dedicated organism
    When the backtest engine page is displayed
    Then the Order Types column is rendered by the OrderTypesConfig organism
    And it displays checkboxes for all available order types
    And "Market" is selected by default

  Scenario: Order Types state updates in isolation
    When a user toggles the "Limit" order type checkbox
    Then the orderTypesConfigState selectedOrderTypes includes "Limit"
    And the universeCapitalConfigState is unchanged
    And the scheduleExecutionConfigState is unchanged

  Scenario: Run Backtest invokes the page-supplied callback
    Given the OrderTypesConfig organism has an onRun callback provided by the page
    When the user clicks the Run Backtest button
    Then the onRun callback is invoked
    And the organism does not directly access universeCapitalConfigState or scheduleExecutionConfigState

  Scenario: Run Backtest with no onRun prop is a no-op
    Given the OrderTypesConfig organism is rendered without an onRun prop
    When the user clicks the Run Backtest button
    Then no error is thrown
    And the orderTypesConfigState is unchanged

  # --- Cross-Organism Behaviors ---

  Scenario: Quick Actions Panel reset clears all three organism states
    Given the user has modified fields in all three columns
    When the Quick Actions Panel reset action is triggered
    Then universeCapitalConfigState is reset to schema defaults
    And scheduleExecutionConfigState is reset to schema defaults
    And orderTypesConfigState is reset to schema defaults

  Scenario: appState prefill sets universe on the UniverseCapitalConfig
    Given appState.backtestPrefillSymbol is set to "AAPL"
    When the backtest engine page effect runs
    Then universeCapitalConfigState.universe is updated to "AAPL"
    And the UniverseCapitalConfig organism displays "AAPL" in the universe field

  # --- Visual Equivalence ---

  @smoke
  Scenario: Backtest engine page is visually equivalent before and after refactor
    When the backtest engine page is displayed
    Then it shows three columns in a grid layout
    And the first column is titled "Universe & Capital"
    And the second column is titled "Schedule & Execution"
    And the third column is titled "Order Types"
    And the Run Backtest button is visible in the third column
