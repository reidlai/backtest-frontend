@smoke @ui
Feature: AI Review Sidebar Panel Organisms
  As a developer
  I want each AI Review sidebar panel available as a standalone organism component
  So that I can locate, modify, and test each panel independently

  Scenario: AI Review panel renders as a standalone component
    Given the AIReviewPanel organism is rendered in isolation
    When a developer views the component
    Then the strategy grade is displayed
    And the confidence badge is displayed
    And the risk flag list is displayed

  Scenario: AI Review panel is composed into AIReviewSidebar without regression
    Given the AIReviewPanel organism exists
    When it is imported into AIReviewSidebar
    Then the sidebar renders identically to the original

  Scenario: Resource & Cost panel renders as a standalone component
    Given the ResourceCostPanel organism is rendered in isolation
    When a developer views the component
    Then the token usage progress bar is displayed
    And the backtest usage progress bar is displayed
    And the estimated runtime stat is displayed
    And the plan impact stat is displayed

  Scenario: Resource & Cost panel is composed into AIReviewSidebar without regression
    Given the ResourceCostPanel organism exists
    When it is imported into AIReviewSidebar
    Then the layout and data remain unchanged compared to the original sidebar

  Scenario: AI Chat panel shows placeholder text when no messages exist
    Given the AIChatPanel organism is rendered in isolation
    And no messages have been sent
    When a developer views the component
    Then the placeholder prompt text is displayed

  Scenario: AI Chat panel sends a message and shows user and assistant bubbles
    Given the AIChatPanel organism is rendered in isolation
    When a user types a message and clicks Send
    Then the user message appears in the conversation list
    And a simulated assistant reply appears in the conversation list

  Scenario: AI Chat panel state resets on remount
    Given the AIChatPanel organism has been unmounted and remounted
    When a developer views the component
    Then the message list is empty
    And the input field is empty

  Scenario: Quick Actions panel renders all four action buttons
    Given the QuickActionsPanel organism is rendered in isolation
    When a developer views the component
    Then the New Strategy button is displayed
    And the New Backtest button is displayed
    And the Report button is displayed
    And the Export CSV button is displayed

  Scenario: Quick Actions panel is composed into AIReviewSidebar without regression
    Given the QuickActionsPanel organism exists
    When it is imported into AIReviewSidebar
    Then all actions behave identically to the original implementation

  Scenario: AIReviewSidebar composes all four panel organisms without layout regression
    Given all four panel organisms are extracted and imported into AIReviewSidebar
    When the sidebar is rendered
    Then the overall layout, spacing, and scroll behavior remain identical to the pre-refactor state
    And zero inline panel markup remains in AIReviewSidebar
