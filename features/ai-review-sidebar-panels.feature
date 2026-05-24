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

@smoke @ui
Feature: SvelteKit Route Navigation
  As a user
  I want each main section to have a dedicated URL
  So that I can navigate directly to any section via browser address bar or back/forward buttons

  Scenario: Root path redirects to Research Workbench
    Given the user navigates to the root URL "/"
    When the server processes the request
    Then the browser is redirected to "/research-workbench"
    And the Research Workbench page is displayed

  Scenario: Each main section is reachable at its dedicated route
    Given the application is running
    When the user navigates to "<route>"
    Then the "<section>" page content is displayed
    And the navigation sidebar highlights "<section>" as active

    Examples:
      | route                   | section                |
      | /research-workbench     | Research Workbench     |
      | /strategy-builder       | Strategy Builder       |
      | /fundamental-screener   | Fundamental Screener   |
      | /technical-screener     | Technical Screener     |
      | /backtest-engine        | Backtest Engine        |
      | /performance-result     | Performance Result     |
      | /market-regime          | Market Regime          |
      | /sentiment-events       | Sentiment Events       |
      | /trade-lot              | Trade Log              |
      | /setting-billing        | Settings & Billing     |

  Scenario: Browser back/forward navigation works between sections
    Given the user is on the Research Workbench page
    When the user navigates to the Strategy Builder page
    And the user presses the browser back button
    Then the user is returned to the Research Workbench page
    And the URL is "/research-workbench"

  Scenario: Navigation sidebar links use anchor tags
    Given the application is running
    When the navigation sidebar renders
    Then all section items are rendered as anchor "<a>" elements with href attributes
    And clicking a nav item navigates to the corresponding route

  Scenario: Active nav item reflects current URL
    Given the user has navigated to "/strategy-builder"
    When the navigation sidebar renders
    Then the Strategy Builder nav item has the active highlight style
    And all other nav items do not have the active highlight style

@smoke @ui
Feature: Research Workbench Sub-Organisms
  As a developer
  I want the Research Workbench page composed from standalone organism components
  So that DashboardMetricGrid, AIResearchBox, and FunctionGateways can be tested independently

  Scenario: DashboardMetricGrid renders as a standalone component
    Given the DashboardMetricGrid organism is rendered in isolation
    When a developer views the component
    Then the market metric tiles are displayed
    And each tile shows a label, value, and delta indicator

  Scenario: AIResearchBox renders as a standalone component
    Given the AIResearchBox organism is rendered in isolation
    When a developer views the component
    Then the strategy input text area is displayed
    And the Analyze button is displayed

  Scenario: AIResearchBox submits strategy text and navigates to Strategy Builder
    Given the AIResearchBox organism is rendered
    And the user has entered strategy text
    When the user clicks the Analyze button
    Then the strategy text is stored in strategyState
    And the user is navigated to "/strategy-builder"

  Scenario: FunctionGateways renders all gateway cards
    Given the FunctionGateways organism is rendered in isolation
    When a developer views the component
    Then all function gateway cards are displayed

  Scenario: FunctionGateways navigates to the correct route on card click
    Given the FunctionGateways organism is rendered
    When the user clicks a gateway card
    Then the user is navigated to the card's corresponding route

@smoke @ui
Feature: Performance Result Sub-Organisms
  As a developer
  I want the Performance Result page composed from standalone organism components
  So that PerformanceMetricGrid and PerformancdeChartTabs can be tested independently

  Scenario: PerformanceMetricGrid renders as a standalone component
    Given the PerformanceMetricGrid organism is rendered in isolation
    When a developer views the component
    Then the performance metric tiles are displayed in their default order

  Scenario: PerformanceMetricGrid tiles can be reordered via drag-and-drop
    Given the PerformanceMetricGrid organism is rendered
    When a developer drags a metric tile to a new position
    Then the tile order updates to reflect the new position

  Scenario: PerformancdeChartTabs renders as a standalone component
    Given the PerformancdeChartTabs organism is rendered in isolation
    When a developer views the component
    Then the equity curve chart tab is active by default
    And the chart data is displayed

  Scenario: PerformancdeChartTabs switches between chart tabs
    Given the PerformancdeChartTabs organism is rendered
    When the user clicks the drawdown tab
    Then the drawdown chart is displayed
    And the equity curve chart is no longer visible
