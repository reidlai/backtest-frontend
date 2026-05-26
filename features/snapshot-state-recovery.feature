@snapshot @frontend
Feature: Snapshot State Recovery
  As a user of the backtest frontend
  I want my in-progress work to be restored after navigating away or refreshing
  So that I do not lose data between pages during an active research session

  Background:
    Given the application is running
    And the user is authenticated

  # ── User Story 1: AI Research Box ────────────────────────────────────────────

  @smoke @p1
  Scenario: Research text is preserved after navigating away and back
    Given the user is on the Research Workbench page
    And the user has typed "Bull flag momentum strategy with RSI filter" in the AIResearchBox textarea
    When the user navigates to the Fundamental Screener page
    And the user navigates back to the Research Workbench page
    Then the AIResearchBox textarea contains "Bull flag momentum strategy with RSI filter"

  @smoke @p1
  Scenario: Empty research textarea is preserved after navigation
    Given the user is on the Research Workbench page
    And the AIResearchBox textarea is empty
    When the user navigates to the Technical Screener page
    And the user navigates back to the Research Workbench page
    Then the AIResearchBox textarea is empty

  @p1
  Scenario: Validation error is not restored after navigation
    Given the user is on the Research Workbench page
    And the user has clicked "Convert to Strategy" with an empty textarea
    And a validation error is displayed on the AIResearchBox
    When the user navigates to the Fundamental Screener page
    And the user navigates back to the Research Workbench page
    Then no validation error is displayed on the AIResearchBox

  # ── User Story 2: AI Chat Panel (hard-refresh recovery) ──────────────────────

  @smoke @p1
  Scenario: Chat message history is restored after a hard refresh
    Given the user has sent the message "What is the optimal RSI period?" in AIChatPanel
    And AIChatPanel shows a response from the assistant
    When the user performs a hard refresh of the current page
    Then AIChatPanel displays the previously sent user message
    And AIChatPanel displays the assistant response in the correct order

  @p1
  Scenario: Partially typed unsent message is restored after a hard refresh
    Given the user has typed "Analyze the MACD cross" in the AIChatPanel input but has not sent it
    When the user performs a hard refresh of the current page
    Then the AIChatPanel input contains "Analyze the MACD cross"

  @p1
  Scenario: Empty chat history starts fresh after a hard refresh
    Given the user has not sent any messages in AIChatPanel
    When the user performs a hard refresh of the current page
    Then AIChatPanel shows no messages
    And AIChatPanel shows the empty-state placeholder text

  # ── User Story 3: Screener Filter Settings ───────────────────────────────────

  @smoke @p2
  Scenario: Fundamental Screener filter values are preserved after navigation
    Given the user is on the Fundamental Screener page
    And the user has set the Universe filter to "Nasdaq 100"
    And the user has set the PE Ratio filter to "20"
    And the user has set the ROIC filter to "25"
    And the user has set the Revenue Growth filter to "15"
    When the user navigates to the Research Workbench page
    And the user navigates back to the Fundamental Screener page
    Then the Universe filter shows "Nasdaq 100"
    And the PE Ratio filter shows "20"
    And the ROIC filter shows "25"
    And the Revenue Growth filter shows "15"

  @p2
  Scenario: Fundamental Screener shows defaults when no prior snapshot exists
    Given no prior snapshot exists for the Fundamental Screener
    When the user navigates to the Fundamental Screener page
    Then the Universe filter shows "S&P 500"
    And the PE Ratio filter shows "30"
    And the ROIC filter shows "15"
    And the Revenue Growth filter shows "10"

  @smoke @p2
  Scenario: Technical Screener pattern and indicator selections are preserved after navigation
    Given the user is on the Technical Screener page
    And the user has selected the patterns "Bull Flag" and "MACD Cross"
    And the user has set the Trend indicator to "Supertrend"
    And the user has set the Momentum indicator to "Stochastic"
    When the user navigates to the Research Workbench page
    And the user navigates back to the Technical Screener page
    Then the "Bull Flag" pattern button is selected
    And the "MACD Cross" pattern button is selected
    And the Trend indicator shows "Supertrend"
    And the Momentum indicator shows "Stochastic"

  @p2
  Scenario: Technical Screener shows defaults when no prior snapshot exists
    Given no prior snapshot exists for the Technical Screener
    When the user navigates to the Technical Screener page
    Then no pattern buttons are selected
    And the Trend indicator shows "EMA(200)"
    And the Momentum indicator shows "RSI(14)"

  # ── Edge Cases ────────────────────────────────────────────────────────────────

  @p2
  Scenario: Cleared filter value is preserved, not reset to default
    Given the user is on the Fundamental Screener page
    And the user has cleared the PE Ratio filter field
    When the user navigates to the Research Workbench page
    And the user navigates back to the Fundamental Screener page
    Then the PE Ratio filter field is empty

  @p2
  Scenario: Invalid snapshot data falls back to schema defaults
    Given a corrupt snapshot exists for the Fundamental Screener with invalid field types
    When the user navigates to the Fundamental Screener page
    Then the Universe filter shows "S&P 500"
    And the PE Ratio filter shows "30"
    And no error is displayed to the user
