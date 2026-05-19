# Feature Specification: Enterprise AI Backtest Platform — Main Application Page

**Feature Branch**: `001-home-page-svelte`
**Created**: 2026-05-18
**Status**: Draft
**Input**: User description: "Use prototype/ai_backtest_platform_prototype.mhtml as base to create src/routes/+page.svelte"

## User Scenarios & Testing _(mandatory)_

### User Story 1 — View Investment Research Dashboard (Priority: P1)

A financial researcher opens the platform and immediately sees an investment research workbench showing live market metrics (S&P 500, Nasdaq, Hang Seng, VIX, 10Y Yield), personal strategy count, backtest queue status, and active alerts — not a marketing welcome screen.

**Why this priority**: The dashboard is the first thing every user sees and must deliver immediate, actionable market context. It is the entry point for all downstream research workflows.

**Independent Test**: Can be fully tested by loading the home page and verifying all metric tiles display correct categories and sample values, plus the AI Research Box and function gateway cards are visible.

**Acceptance Scenarios**:

1. **Given** the user navigates to the root URL, **When** the page loads, **Then** the Investment Research Workbench dashboard is displayed as the default active section (not a welcome or login page).
2. **Given** the dashboard is displayed, **When** the user views the metric grid, **Then** at least 8 metric tiles are visible covering markets (S&P 500, Nasdaq, Hang Seng), risk (VIX), rates (10Y Yield), and personal usage (strategies saved, backtest queue, alerts).
3. **Given** the dashboard is displayed and the user has typed strategy text, **When** the user clicks "Convert to Strategy," **Then** the AI Strategy Builder section becomes active with the typed text pre-filled in the natural language input.
4. **Given** the dashboard is displayed, **When** the user views the function gateway, **Then** at least 6 feature cards are shown (AI Strategy Builder, Fundamental Screening, Technical Screening, Backtest Engine, Market Regime, Sentiment & Events).

---

### User Story 2 — Navigate Between Research Sections (Priority: P2)

A user clicks a navigation item in the sidebar to switch between the platform's research sections (Strategy Builder, Fundamental Screener, Technical Screener, Backtest Engine, Performance Result, Market Regime, Sentiment/Events, Trade Log, Settings).

**Why this priority**: Navigation is the core shell behavior. Users must move freely between tools without page reloads, and the active section must update to reflect their selection.

**Independent Test**: Can be tested by clicking each navigation button and verifying the correct section content appears while other sections are hidden.

**Acceptance Scenarios**:

1. **Given** the application is loaded, **When** the user clicks "AI Strategy Builder" in the left navigation, **Then** the AI Strategy Builder section becomes visible and all other sections are hidden.
2. **Given** any section is active, **When** the user clicks a different navigation item, **Then** the previously active section is hidden, the newly selected section is shown, and the clicked navigation item is visually marked as active.
3. **Given** the page is freshly loaded, **When** no navigation click has occurred, **Then** the Dashboard section is the active default.
4. **Given** the user has entered text in the AI Strategy Builder and navigated away, **When** the user navigates back to AI Strategy Builder, **Then** the previously entered strategy text is still present (state preserved for the session).

---

### User Story 3 — AI Strategy Builder Input (Priority: P3)

A user types a natural language investment strategy description (e.g., specifying PE ratio filters, revenue growth thresholds, technical indicators, backtest period, position sizing, and stop-loss rules) and submits it for parsing into a structured strategy object.

**Why this priority**: This is the platform's core AI-powered value proposition. Converting free-text investment intent into a structured, actionable strategy is what differentiates the platform.

**Independent Test**: Can be tested by entering sample strategy text, clicking "Parse Strategy," and verifying a structured output table (market, fundamental filter, technical filter, backtest period, position size, risk rule) is displayed alongside the input.

**Acceptance Scenarios**:

1. **Given** the AI Strategy Builder section is active, **When** the user enters strategy text in the input area and clicks "Parse Strategy," **Then** a structured strategy object panel is shown with categorized fields (Market, Fundamental Filter, Technical Filter, Backtest Period, Position Size, Risk Rule).
2. **Given** the structured strategy is displayed, **When** the user clicks "Send to Backtest," **Then** the application transitions to the Backtest Engine section with the strategy parameters pre-filled.
3. **Given** the AI Strategy Builder section is active, **When** the user clicks "Open Fundamental Screener" or "Open Technical Screener," **Then** the corresponding screener section becomes active.

---

### User Story 4 — View Backtest Performance Results (Priority: P4)

A user who has configured and run a backtest views a comprehensive results board showing performance metrics (total return, net profit, max drawdown, Sharpe ratio, win rate, profit factor), equity curve chart, regime breakdown, long/short split, and a full performance summary table.

**Why this priority**: Performance results are the ultimate output of the platform's research workflow. Users must be able to review, compare, and export their backtesting outcomes.

**Independent Test**: Can be tested by navigating to Performance Result and verifying all metric tiles, regime table, chart tabs, long/short split table, and full performance summary table are displayed with realistic sample data.

**Acceptance Scenarios**:

1. **Given** the Performance Result section is active, **When** the user views the results board, **Then** at least 8 draggable metric tiles are shown (Total Return, Net Profit, Max Drawdown, Sharpe Ratio, Win Rate, Profit Factor, Volatility, Exposure Time).
2. **Given** the results board is visible, **When** the user clicks a chart type tab (Equity Curve, Drawdown, Benchmark Overlay, Monthly Heatmap), **Then** the chart area updates to show the selected chart type.
3. **Given** the results board is visible, **When** the user double-clicks a metric tile, **Then** an edit modal appears allowing the user to update the metric value.

---

### User Story 5 — Use Right-Sidebar AI Tools (Priority: P5)

A user uses the persistent right sidebar to review AI-generated strategy analysis (grade, confidence, risk flags), monitor resource/token usage, and send questions to the AI chat for strategy guidance.

**Why this priority**: The AI review and chat provide contextual intelligence throughout the research workflow. Resource monitoring ensures users stay within their plan limits.

**Independent Test**: Can be tested by verifying the right sidebar always remains visible regardless of which main section is active, and that the AI Review grade, resource metrics, and chat input are all accessible.

**Acceptance Scenarios**:

1. **Given** any main section is active, **When** the user views the right sidebar, **Then** the AI Review panel (with strategy grade and confidence level), Resource & Cost panel (token usage, backtest quota, queue position), AI Chat panel, and Quick Actions panel are all visible.
2. **Given** the AI Chat panel is visible, **When** the user types a question and clicks "Send Message to AI," **Then** the chat area updates to show the submitted question and an AI response placeholder.
3. **Given** the Resource & Cost panel is visible, **When** the user views it, **Then** token usage, backtest quota (used/total), queue position, estimated runtime, complexity score, and plan impact are all displayed.

---

### Edge Cases

- **Narrow viewport**: When the browser window is narrower than 1280px, the three-column layout clips and the page scrolls horizontally; no responsive reflow is applied.
- **Non-numeric metric edit**: When a user enters a non-numeric value in the metric tile edit modal, the field shows a red error state and the Apply button is disabled until a valid number is entered.
- **Empty AI Research Box submit**: When a user clicks "Convert to Strategy" with an empty input, the text area shows a red error state and the action is blocked.
- **Empty state — Performance Result**: When no backtest has been run, the Performance Result section displays an explanatory placeholder message ("No backtest results yet") and a call-to-action button that navigates the user to the Backtest Engine section.
- **Empty state — Trade Log**: When no backtest has been run, the Trade Log section displays an explanatory placeholder message and a call-to-action button navigating to the Backtest Engine section.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The page MUST display a three-column layout: a persistent left navigation sidebar, a scrollable main content area, and a persistent right AI tools sidebar.
- **FR-002**: The left sidebar MUST contain a brand header (logo and platform name), two navigation groups labelled "LEVEL 1 / MAIN" and "LEVEL 2 / RESULT," and a live controls section with three numerical inputs (Total Return %, Max Drawdown %, Win Rate %) and a "Simulate Re-run" button. Clicking "Simulate Re-run" MUST apply the entered values to the corresponding metric tiles in the Performance Result section and display a brief toast confirmation.
- **FR-003**: The main content area MUST support ten distinct sections: Dashboard, AI Strategy Builder, Fundamental Screener, Technical Screener, Backtest Engine, Performance Result, Market Regime, Sentiment & Events, Trade Log, and Settings/Billing.
- **FR-004**: Only one main content section MUST be visible at a time; the Dashboard section MUST be the default on page load.
- **FR-005**: Switching between sections MUST NOT trigger a full page reload; transitions MUST be immediate or include a brief entrance animation. All organism-level state (strategy text, screener filters, backtest parameters) MUST be retained when the user navigates away and returns to a section within the same browser session. Exception: "New Strategy" and "New Backtest" shortcut actions MUST reset the AI Strategy Builder and Backtest Engine sections respectively to their default blank state, overriding session persistence.
- **FR-006**: A top bar in the main content area MUST include a global search input (styled and visible as a placeholder — non-functional for this feature), a language switcher (EN / 中文), and three action buttons: Save, Export JSON, Send to AI. The language switcher MUST be visible on every section and switch all user-visible strings between English and Traditional Chinese without a page reload. The selected language MUST persist globally across all section navigations and remain active for the entire browser session. The Save button MUST display a brief success toast notification with no data persistence. The Export JSON button MUST trigger a download of the current structured strategy configuration (market scope, fundamental filters, technical filters, backtest period, position size, risk rules) as a JSON file. The Send to AI button MUST navigate to the AI Strategy Builder section and focus the natural language input field.
- **FR-007**: The Dashboard section MUST display a metric grid with market and usage tiles, an AI Research Box panel with a natural language text area, quick-action shortcut chips, and a function gateway card list linking to each major feature area. Clicking "Convert to Strategy" with non-empty text MUST navigate to the AI Strategy Builder section with the typed text pre-filled in the input. Submitting with an empty input MUST show an inline error state on the text area and block the action.
- **FR-008**: The AI Strategy Builder section MUST provide a natural language text input area, action buttons (Parse Strategy, Send to Backtest, Open Fundamental Screener, Open Technical Screener), and a structured strategy output panel displaying category-value pairs in a table.
- **FR-009**: The Fundamental Screener section MUST provide filter controls for: universe selection, valuation filters (PE ratio, EV/EBITDA, FCF Yield), quality/profitability filters (ROIC, margins), growth filters (revenue CAGR, EPS growth), and debt/balance sheet filters; a factor ranking weight table; and a ranked screener results table with per-stock scores and an individual "Backtest" action per row. Clicking the per-row "Backtest" action MUST navigate to the Backtest Engine section with mode set to "Single Stock" and the selected stock's symbol pre-filled in the Universe field.
- **FR-010**: The Technical Screener section MUST provide dropdown selectors for trend indicators, momentum indicators, volatility indicators, and volume indicators; a chart pattern chip selector; a pattern explanation display area; and an interactive chart preview area rendered using LayerChart.
- **FR-011**: The Backtest Engine section MUST allow selection of backtest mode (Single Stock, Watchlist, Screener Result, Index Universe, Strategy Comparison, Benchmark Comparison) and configuration of: initial capital, date range, market, universe, timeframe, commission model, slippage model, position size, stop loss, take profit, long/short direction, rebalance frequency, and order types (Market, Limit, Stop, Stop-Limit, Trailing Stop, Bracket, OCO, Short Sell). A "Run Backtest" button MUST be present; clicking it MUST display a "Backtest queued…" toast notification and keep the user on the Backtest Engine section (no navigation or data change, consistent with mock data scope).
- **FR-012**: The Performance Result section MUST display: draggable metric tiles (at least 8), a regime performance breakdown table (return, max drawdown, win rate by regime), selectable chart tabs (Equity Curve, Drawdown, Benchmark Overlay, Monthly Heatmap) rendered using LayerChart with hover tooltip support, a long/short split metrics table, and a full performance summary table with all standard backtest statistics.
- **FR-013**: Metric tiles in the Performance Result section MUST support drag-to-reorder interaction and double-click to open an edit modal for updating the displayed value.
- **FR-014**: The Market Regime section MUST display classification cards for at least 7 regime types (Bull Trend, Bear Trend, High Volatility, Low Volatility, Risk-On, Risk-Off, Inflation Shock, Rate Cut Cycle) with logic descriptions, visual status indicators, and an AI-generated regime summary statement.
- **FR-015**: The Sentiment & Events section MUST display a table of event and sentiment data including: news sentiment, earnings calendar, earnings surprise, analyst revisions, Fed event, CPI/NFP events, insider trading activity, and social sentiment.
- **FR-016**: The Trade Log section MUST display a scrollable table with columns: Trade ID, Symbol, Long/Short, Entry Date, Entry Price, Exit Date, Exit Price, Quantity, Commission, Slippage, Net PnL, Return %, Holding Days, Exit Reason.
- **FR-017**: The Settings/Billing section MUST display usage metric tiles covering: tokens used today, backtests used (vs. daily quota), queue position, and complexity score.
- **FR-018**: The right sidebar MUST remain visible on all main content sections and contain: an AI Review panel (strategy grade, confidence level, itemized risk flags with color-coded status dots), a Resource & Cost panel (token usage, backtest quota, queue position, runtime, complexity, plan impact), an AI Chat panel (conversation display and message submission), and a Quick Actions panel with shortcut buttons for common workflows. The AI Review panel MUST be pre-populated with sample data (B+ grade, medium confidence, three risk flag items) on initial page load before any strategy is parsed. The Quick Actions panel MUST include navigation shortcuts (New Strategy → AI Strategy Builder, New Backtest → Backtest Engine, Fundamental → Fundamental Screener, Technical → Technical Screener, Report → Performance Result, Regime → Market Regime), an Export CSV action that downloads the Trade Log sample data as a CSV file, and an Export PDF action that displays a "PDF export coming soon" toast notification.
- **FR-019**: An edit metric modal MUST be accessible by double-clicking any metric tile; the modal MUST allow value update and provide Apply and Cancel actions. If the entered value is non-numeric, the field MUST show an inline error state and the Apply button MUST be disabled until a valid number is entered.
- **FR-020**: The page MUST render exclusively in dark mode at all times; no light theme variant or user-facing theme toggle is required.
- **FR-021**: The Performance Result and Trade Log sections MUST display an empty state when no backtest data is present, consisting of an explanatory message and a call-to-action button that navigates the user to the Backtest Engine section.
- **FR-022**: All interactive UI controls, tables, dialogs, and form elements MUST be composed from shadcn-svelte Atom components. Molecules MUST be purely presentational (no internal state). Organisms MUST encapsulate all state management for their respective section. The three-column page shell MUST be implemented as a SvelteKit layout (Template), with the full page composed as a SvelteKit page (Page).
- **FR-023**: The page MUST support multilingual display for all user-visible strings. English and Traditional Chinese MUST both be fully supported in this feature. All labels, headings, placeholder text, button text, and descriptive content MUST be externalized (not hardcoded) to allow language switching. The active language selection MUST be stored as global session state so it persists uniformly across all ten sections for the lifetime of the browser session.

### Key Entities _(include if feature involves data)_

- **Strategy**: A user-defined investment strategy composed of market scope, fundamental filters, technical filters, backtest period, position sizing rules, and risk management rules.
- **Backtest Result**: All performance metrics computed from running a strategy over historical data, including return, drawdown, Sharpe ratio, win rate, regime breakdown, and trade-level detail.
- **Market Metric**: A point-in-time snapshot of a market index or risk indicator (index level, percentage change, regime label).
- **Trade Record**: An individual executed trade with entry/exit details, position size, commission, slippage, and realized PnL.
- **Market Regime**: A classification of the current market environment (Bull, Bear, High Volatility, etc.) with supporting indicator logic and an AI narrative summary.
- **AI Review**: A structured strategy assessment including an overall letter grade, confidence level, and specific risk findings (overfitting risk, regime dependency, bias checks).
- **Resource Usage**: Session-level tracking of token consumption, backtest quota usage, queue position, and estimated compute cost.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can reach any of the ten main research sections within 2 clicks from any currently active section.
- **SC-002**: Section transitions complete within 300 milliseconds of a navigation click with no full page reload.
- **SC-003**: All metric tiles in the Dashboard and Performance Result sections display without layout overflow or clipping on viewports at or above 1280px wide.
- **SC-004**: Users can enter strategy text and see a structured output displayed in the AI Strategy Builder without leaving the page.
- **SC-005**: All navigation items across both sidebar levels are reachable, and each activates the correct corresponding section (100% navigation correctness).
- **SC-006**: The right sidebar remains fully visible and non-overlapping with main content on all ten sections at viewports of 1280px and above.
- **SC-007**: The Trade Log table displays all 14 column headers and sample row data without horizontal truncation on viewports at or above 1280px wide.
- **SC-008**: All user-visible strings render correctly in both English and Traditional Chinese with no untranslated fallback strings visible to the user in either language.

## Assumptions

- The page operates as a single-route, single-page application shell; all ten sections are toggled by client-side navigation with no separate URL routes per section.
- All data displayed (market metrics, performance numbers, trade records, AI review content) is sample/mock data; live data integration and real AI API calls are outside the scope of this feature.
- The three-column layout targets a minimum viewport width of 1280px; responsive or mobile layouts are out of scope for this feature.
- User authentication and session management are out of scope; the page is accessible without a login step.
- Backtest computation (running actual historical data calculations) is out of scope; the Backtest Engine section covers the parameter configuration and trigger UI only.
- The page supports multilingual content; English and Traditional Chinese are the two languages required for this feature. All user-visible strings (labels, headings, placeholders, descriptions, button text) must be externalized for translation rather than hardcoded.
- The drag-to-reorder behavior for metric tiles persists only for the current session and does not require server-side storage.
- **shadcn-svelte is the required UI component library** for all interactive controls, tables, dialogs, forms, and navigation elements throughout the page.
- The page MUST use a dark color theme at all times (no light mode, no user toggle); the visual palette follows the prototype's deep navy/black color scheme.
- **LayerChart is the required charting library** for all chart visualizations (equity curve, drawdown, technical chart preview); it is Svelte-native and compatible with the chosen component stack.
- **Atomic Design is the required component organization pattern**, mapped to SvelteKit conventions as follows:
  - **Atoms**: Installed shadcn-svelte components used as-is (Button, Input, Select, Table, Dialog, etc.)
  - **Molecules**: Purely presentational composite components with no internal state or business logic, built from atoms (e.g., MetricTile, RegimeCard, TradeRow)
  - **Organisms**: Stateful composite components that own and manage their section's state (e.g., NavigationSidebar, DashboardSection, StrategyBuilderSection, AIReviewPanel)
  - **Templates**: SvelteKit `+layout.svelte` files defining the three-column page shell
  - **Pages**: SvelteKit `+page.svelte` files composing organisms into the full view

## Clarifications

### Session 2026-05-18 (continued)

- Q: What UI component library should be used for this implementation? → A: shadcn-svelte
- Q: What does the "Convert to Strategy" button in the Dashboard AI Research Box do when text is present? → A: Navigate to the AI Strategy Builder section with the typed text pre-filled in the input, ready for the user to click "Parse Strategy"
- Q: What does the per-row "Backtest" action in the Fundamental Screener results table do? → A: Navigate to the Backtest Engine section with mode set to "Single Stock" and the selected stock's symbol pre-filled in the Universe field
- Q: What should "Export PDF" and "Export CSV" in the Quick Actions panel do? → A: Export CSV downloads the Trade Log sample data as a CSV file; Export PDF shows a "PDF export coming soon" toast notification
- Q: When a user clicks "New Strategy" or "New Backtest" shortcuts, should the destination section reset to blank or preserve existing state? → A: Reset to blank — "New" actions clear the destination section's state; this is an explicit exception to the session state persistence rule
- Q: Where should the language switcher be placed? → A: In the top bar alongside Save / Export JSON / Send to AI, visible on every section
- Q: What should the global search input in the top bar do? → A: Visual placeholder only — styled and visible but non-functional for this feature; real search is out of scope
- Q: What should the "Simulate Re-run" button in the left sidebar do? → A: Apply the three entered values (Total Return %, Max Drawdown %, Win Rate %) to the corresponding Performance Result metric tiles and show a toast confirming the simulated re-run
- Q: How should input validation and narrow-viewport behavior be handled? → A: Inline validation — non-numeric/empty inputs show a red error state and disable the submit action; viewport below 1280px clips and scrolls horizontally
- Q: What should the "Run Backtest" button do when clicked? → A: Display a "Backtest queued…" toast notification and remain on the Backtest Engine section; no navigation or data change
- Q: What color theme should the page use? → A: Dark theme only — always renders in dark mode matching the prototype's deep navy/black palette
- Q: What charting solution should be used for equity curves and technical chart previews? → A: LayerChart library (layerchart.com), a Svelte-native charting library
- Q: What data does the "Export JSON" top-bar action export? → A: The current structured strategy configuration (market, filters, period, position size, risk rules) as a downloaded JSON file
- Q: What should the Performance Result and Trade Log sections display before any backtest has been run? → A: Placeholder message with a call-to-action button navigating to the relevant upstream section
- Q: How should UI components be organized structurally? → A: Atomic Design — Atoms = installed shadcn-svelte components; Molecules = presentational composites (no state); Organisms = stateful section components (own state management); Templates = SvelteKit layouts; Pages = SvelteKit routes
- Q: What should the AI Review panel in the right sidebar display before any strategy has been created? → A: Pre-populated with sample data — always shows the prototype's sample output (B+ grade, medium confidence, three risk flags) as the initial state
- Q: Should organism-level section state persist when the user navigates away and returns within the same browser session? → A: Yes — all organism state (strategy text, screener filters, backtest parameters) is retained for the duration of the browser session
- Q: What language(s) should the page support for labels and content? → A: Multilingual with English and Traditional Chinese supported in this feature
- Q: What should the "Save" button in the top bar do? → A: Display a brief success toast notification ("Saved") with no actual data persistence; consistent with mock data scope
- Q: What should the "Send to AI" button in the top bar do? → A: Navigate to the AI Strategy Builder section and focus the natural language input
- Q: Does the selected language (EN / 中文) persist across section navigation? → A: Yes — language selection persists globally for the entire browser session; switching language at any point applies to all ten sections and survives navigation between them
