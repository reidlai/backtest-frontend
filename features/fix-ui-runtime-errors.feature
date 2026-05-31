@smoke @fix
Feature: Fix UI Runtime Errors on Technical Screener and Performance Result Pages

  As a developer or user of the backtest application
  I want both the Technical Screener and Performance Result pages to load without errors
  So that I can use these features without runtime crashes degrading my experience

  # US1: Technical Screener navigation — zero uncaught errors
  Scenario: Technical Screener loads without uncaught errors
    Given the app is running
    When the user navigates to "/technical-screener" 5 consecutive times
    Then the browser console shows no uncaught errors

  # US2: Performance Result loads with defaults when no backtest run
  Scenario: Performance Result loads with default metric values when no backtest run
    Given no backtest has been run
    When the user navigates to "/performance-result"
    Then the page renders metric tiles with default values of 0 and no TypeError appears in the browser console

  # US2: Performance Result renders correct values when state is populated
  Scenario: Performance Result renders correct values when simulatedMetrics is populated
    Given simulatedMetrics is populated with totalReturn 42.8, maxDrawdown -18.2, winRate 58.3
    When the user navigates to "/performance-result"
    Then the metric tiles display the corresponding values
