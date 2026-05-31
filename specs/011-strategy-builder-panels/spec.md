# Feature Specification: Strategy Builder Input and Output Panels

**Feature Branch**: `011-strategy-builder-panels`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "in src/routes/strategy-builder/+page.svelte, it should include two organisms, one is Input Panel another one is Output Panel"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Configure Strategy Inputs (Priority: P1)

A user navigates to the Strategy Builder page and uses the Input Panel organism to define strategy parameters — such as entry/exit conditions, asset selection, and backtest date range — before triggering a backtest run.

**Why this priority**: The Input Panel is the entry point for all strategy configuration. Without it, users cannot interact with the strategy builder at all.

**Independent Test**: Can be fully tested by loading the Strategy Builder page and verifying that the Input Panel renders with all configuration controls visible and interactive, delivering usable strategy parameter entry without needing the Output Panel.

**Acceptance Scenarios**:

1. **Given** the user navigates to `/strategy-builder`, **When** the page loads, **Then** the Input Panel organism is rendered and all configuration controls are visible and interactive.
2. **Given** the Input Panel is displayed, **When** the user fills in strategy parameters, **Then** the inputs accept and retain the entered values.
3. **Given** the Input Panel has valid configuration, **When** the user submits the form, **Then** the strategy configuration is passed downstream for processing.

---

### User Story 2 - View Strategy Results (Priority: P2)

A user who has submitted strategy parameters via the Input Panel views the results — such as performance metrics, charts, or trade summaries — in the Output Panel organism on the same page.

**Why this priority**: The Output Panel delivers the core value of the strategy builder by displaying backtest results. It depends on the Input Panel being functional first.

**Independent Test**: Can be tested by providing mock strategy results and verifying the Output Panel renders them correctly, independently of the Input Panel's submission flow.

**Acceptance Scenarios**:

1. **Given** the strategy has been submitted, **When** results are available, **Then** the Output Panel organism displays the results clearly on the same page.
2. **Given** no results are available yet, **When** the Output Panel is rendered, **Then** an appropriate empty or loading state is shown.
3. **Given** results contain performance metrics, **When** the Output Panel renders, **Then** all key metrics are visible without scrolling past the panel boundary.

---

### User Story 3 - Side-by-Side Layout (Priority: P3)

A user can view both the Input Panel and Output Panel simultaneously on the Strategy Builder page, allowing them to compare configuration with results without navigating away.

**Why this priority**: Co-location of input and output improves usability and iteration speed but is a layout concern secondary to each panel functioning correctly.

**Independent Test**: Can be tested by resizing the browser to desktop width and verifying both panels are visible on screen at the same time without overlap or overflow.

**Acceptance Scenarios**:

1. **Given** a desktop-width viewport, **When** the Strategy Builder page is loaded, **Then** both the Input Panel and Output Panel are visible side by side.
2. **Given** a narrow viewport, **When** the page is loaded, **Then** the panels stack vertically without content loss.

---

### Edge Cases

- What happens when the Output Panel receives malformed or empty result data? → If the async backtest call fails (server error, timeout, invalid strategy), an error message is shown inside the Output Panel; the Input Panel remains editable for retry.
- How does the Input Panel handle validation errors (e.g., invalid date range, missing required fields)? → Inline validation errors appear next to each invalid field; the "Run" button remains disabled until all fields are valid.
- What is shown in the Output Panel while results are loading? → A loading state (spinner or skeleton) is displayed; the "Run" button in the Input Panel is disabled.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Strategy Builder page MUST include an Input Panel organism that encapsulates all strategy configuration controls.
- **FR-002**: The Strategy Builder page MUST include an Output Panel organism that encapsulates all strategy result displays.
- **FR-003**: Both organisms MUST be composed within `src/routes/strategy-builder/+page.svelte` as top-level children of the page layout.
- **FR-004**: The Input Panel organism MUST accept user inputs for strategy configuration and include a "Run" button that triggers an async backtest execution.
- **FR-004a**: While the async backtest is running, the Output Panel MUST display a loading state and the "Run" button MUST be disabled to prevent duplicate submissions.
- **FR-005**: The Output Panel organism MUST display strategy results comprising: (a) key performance metrics — total return, Sharpe ratio, and max drawdown; (b) an equity curve chart; and (c) a trade summary table.
- **FR-006**: The Output Panel MUST display an appropriate empty or loading state when no results are available.
- **FR-007**: Both panels MUST be independently renderable — the Output Panel must not depend on the Input Panel being mounted.
- **FR-008**: After a backtest completes, the user MUST be able to modify Input Panel parameters and click "Run" again without any explicit reset step; the Output Panel MUST replace its previous results with the new run's output.
- **FR-009**: The Input Panel MUST display inline validation errors adjacent to each invalid field and MUST keep the "Run" button disabled until all required fields contain valid values.
- **FR-010**: When the async backtest call fails, the Output Panel MUST display an inline error message describing the failure; the Input Panel MUST remain fully editable so the user can adjust parameters and retry.

### Key Entities

- **Input Panel**: An organism component encapsulating all user-facing controls for defining a trading strategy (parameters, conditions, date range, asset selection).
- **Output Panel**: An organism component encapsulating all result displays for a completed backtest: key performance metrics (total return, Sharpe ratio, max drawdown), an equity curve chart, and a trade summary table.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Both the Input Panel and Output Panel organisms render on the Strategy Builder page without errors in 100% of page loads.
- **SC-002**: Users can complete strategy configuration in the Input Panel in under 2 minutes for standard use cases.
- **SC-003**: The Output Panel displays results within 1 second of receiving result data.
- **SC-004**: Both panels remain usable (no content overflow or clipping) at viewport widths from 768px to 1920px.
- **SC-005**: 90% of users can identify and interact with the Input Panel and Output Panel without additional guidance.

## Clarifications

### Session 2026-05-31

- Q: What specific content should the Output Panel display? → A: Key performance metrics (total return, Sharpe ratio, max drawdown) + equity curve chart + trade summary table.
- Q: How are results passed from Input Panel to Output Panel? → A: User clicks a "Run" button in the Input Panel → async call → Output Panel shows loading state → results appear when ready.
- Q: Can users modify Input Panel parameters and resubmit after viewing results? → A: Yes — user can freely modify inputs and click "Run" again; the Output Panel replaces previous results with the new run's output.
- Q: How does the Input Panel handle validation errors? → A: Inline validation errors appear next to each invalid field; the "Run" button is disabled until all fields are valid.
- Q: What happens in the Output Panel when the async backtest call fails? → A: An error message is shown inside the Output Panel explaining what went wrong; the Input Panel remains editable so the user can adjust and retry.

## Assumptions

- The Strategy Builder page at `src/routes/strategy-builder/+page.svelte` already exists and has a basic page shell; this feature adds the two organism components to it.
- Organism components follow the existing atomic design conventions established in the codebase (atoms → molecules → organisms).
- The specific strategy configuration fields for the Input Panel and the specific result displays for the Output Panel will be defined during the planning phase based on existing data models.
- Mobile support (viewports below 768px) is out of scope for this iteration; responsive stacking at tablet width is sufficient.
- Shared state between the two panels (e.g., passing results from Input to Output) will use the existing state management pattern in the project.
