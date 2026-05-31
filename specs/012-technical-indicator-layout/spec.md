# Feature Specification: Technical Indicator Page Two-Column Layout

**Feature Branch**: `012-technical-indicator-layout`

**Created**: 2026-05-31

**Status**: Cancelled — route deleted by product decision (2026-05-31). The page was considered a duplicate of `technical-screener`. Spec retained for audit trail only.

**Input**: User description: "src/routes/technical-indicator has two columns, the first column should have Indicator Selection Organism and Chart Pattern Selection Organism while the second column should shows Pattern Preview Organism."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Indicator and Pattern Selection Panel (Priority: P1)

A trader navigates to the Technical Indicator page and sees a two-column layout. The left column presents the Indicator Selection organism (to choose technical indicators such as RSI, MACD, Bollinger Bands) and the Chart Pattern Selection organism (to choose chart patterns such as Head and Shoulders, Double Bottom). The right column shows the Pattern Preview organism, which renders a visual preview of the selected indicator/pattern combination.

**Why this priority**: This is the foundational layout of the page; without it, neither selection nor preview organisms have a home.

**Independent Test**: Navigate to `/technical-indicator`. The page renders with two visible columns. The left column contains the Indicator Selection and Chart Pattern Selection sections. The right column contains the Pattern Preview section. No other pages are affected.

**Acceptance Scenarios**:

1. **Given** the user is on the Technical Indicator page, **When** the page loads, **Then** two side-by-side columns are visible with the left column containing Indicator Selection and Chart Pattern Selection organisms, and the right column containing the Pattern Preview organism.
2. **Given** the two-column layout is rendered, **When** the viewport is wide, **Then** the columns appear side by side; when the viewport is narrow, the columns stack vertically.

---

### User Story 2 - Select a Technical Indicator (Priority: P2)

A trader uses the Indicator Selection organism in the left column to choose one or more technical indicators. After each selection or deselection, the Pattern Preview organism in the right column updates to overlay all currently selected indicators on the live chart.

**Why this priority**: Indicator selection drives the preview — this is the core interaction flow of the page.

**Independent Test**: Select multiple indicators in the Indicator Selection organism. The Pattern Preview organism in the right column overlays all selected indicators on the live chart simultaneously.

**Acceptance Scenarios**:

1. **Given** the page is loaded, **When** the user selects one or more indicators from the Indicator Selection organism, **Then** the Pattern Preview organism overlays all selected indicators on the live chart.
2. **Given** multiple indicators are selected, **When** the user deselects one, **Then** the Pattern Preview organism updates to remove that indicator's overlay while keeping the rest.
3. **Given** no indicator is selected, **When** the user opens the page, **Then** the Pattern Preview organism shows the base chart with no indicator overlays.

---

### User Story 3 - Select a Chart Pattern (Priority: P3)

A trader uses the Chart Pattern Selection organism in the left column to choose a chart pattern. After selection, the Pattern Preview organism in the right column updates to reflect the chosen chart pattern.

**Why this priority**: Complements indicator selection — delivers value once the layout and indicator selection are working.

**Independent Test**: Select any chart pattern in the Chart Pattern Selection organism. The Pattern Preview organism in the right column updates accordingly.

**Acceptance Scenarios**:

1. **Given** the page is loaded, **When** the user selects a chart pattern from the Chart Pattern Selection organism, **Then** the Pattern Preview organism reflects the selected pattern.
2. **Given** both an indicator and a chart pattern are selected, **When** the user changes the chart pattern, **Then** the Pattern Preview organism updates to show the new combination.

---

### Edge Cases

- What happens when neither an indicator nor a chart pattern is selected? Pattern Preview organism should render a placeholder or empty state.
- How does the layout handle very long organism content in the left column? The right column should remain visible without horizontal scrolling.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Technical Indicator page MUST render a two-column layout where the first (left) column contains the Indicator Selection organism and the Chart Pattern Selection organism stacked vertically, and the second (right) column contains the Pattern Preview organism.
- **FR-002**: The Indicator Selection organism MUST be placed at the top of the left column.
- **FR-003**: The Chart Pattern Selection organism MUST be placed below the Indicator Selection organism in the left column.
- **FR-004**: The Pattern Preview organism MUST occupy the full height of the right column, MUST render a chart using mock/static OHLCV data, MUST overlay all currently selected indicators simultaneously, and MUST render the selected chart pattern as an annotation (trendlines, boundary shapes) directly on the same chart. Real API integration is out of scope for this feature.
- **FR-005**: The layout MUST be responsive — columns stack vertically on narrow viewports and appear side by side on wide viewports.
- **FR-006**: All three organisms (Indicator Selection, Chart Pattern Selection, Pattern Preview) MUST be implemented as fully interactive components — multi-select for indicators, single-select for chart patterns, and live chart rendering for preview.
- **FR-007**: All user-visible strings in the three organisms MUST use the project's i18n message catalogue (paraglide messages), consistent with the pattern established in other routes.

### Terminology Note

Component filenames follow the project's "Panel" suffix convention (e.g., `IndicatorSelectionPanel.svelte`). They are nonetheless classified as **Organisms** per Atomic Design, consistent with the `src/lib/components/organisms/` directory. The terms "Indicator Selection Organism" and "IndicatorSelectionPanel" refer to the same component throughout this feature.

### Key Entities

- **Indicator Selection Organism**: A UI component that allows the user to browse and select one or more technical indicators (e.g., RSI, MACD, EMA); multiple indicators can be active simultaneously and all are overlaid on the preview chart.
- **Chart Pattern Selection Organism**: A UI component that allows the user to browse and select a chart pattern (e.g., Head and Shoulders, Double Bottom, Triangle); the selected pattern is rendered as an annotation overlay (trendlines, boundary shapes) directly on the live chart in the Pattern Preview.
- **Pattern Preview Organism**: A UI component that renders mock/static OHLCV data as a chart, with the selected indicators overlaid as Spline layers and the selected chart pattern rendered as `Rule` annotation lines. Real API integration is deferred to a future feature.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The Technical Indicator page displays two columns with the correct organisms in each column on all screen sizes above 320px width.
- **SC-002**: All three panel headings ("Indicator Selection", "Chart Pattern Selection", "Pattern Preview") are visible and labelled without scrolling on viewports ≥ 1024px wide.
- **SC-003**: The layout renders without layout-breaking overflow or scroll issues across common viewport widths (320px to 2560px).
- **SC-004**: Selecting or deselecting an indicator or chart pattern in the left column causes the Pattern Preview in the right column to visually update within 300ms (mock data; no network latency).

## Clarifications

### Session 2026-05-31

- Q: Does the Pattern Preview organism render real historical chart data or a static/illustrative mockup? → A: Real historical chart data fetched live, with the selected indicator/pattern overlaid on the chart.
- Q: Can users select multiple indicators simultaneously, or only one at a time? → A: Multi-select — users can choose several indicators and all are overlaid on the preview chart simultaneously.
- Q: How does the selected chart pattern appear in the Pattern Preview alongside indicators and live data? → A: The chart pattern is annotated/overlaid directly on the same live chart (e.g., trendlines, shapes marking pattern boundaries), unified with the indicator overlays.
- Q: Where does the Pattern Preview source its historical chart data? → A: Mock/static OHLCV data for now; real API integration is deferred to a future feature.
- Q: Where should selection state (selectedIndicators, selectedPattern) live? → A: Maximise organism-local state — each selection organism owns its own $state; the page holds mirror copies via onchange callbacks only for PatternPreviewPanel rendering and snapshot persistence.

## Assumptions

- The `technical-indicator` route already exists under `src/routes/technical-indicator/` but does not yet have the two-column layout implemented.
- The Pattern Preview organism uses mock/static OHLCV data in this feature; live market data API integration is explicitly deferred to a future feature.
- The Indicator Selection, Chart Pattern Selection, and Pattern Preview organisms may need to be created as new stub components under `src/lib/components/organisms/` following the project's Atomic Design conventions.
- Responsive breakpoints follow the existing design system already used in other routes (e.g., `technical-screener`, `strategy-builder`).
- Each selection organism (Indicator Selection, Chart Pattern Selection) owns its own `$state` internally (Constitution Rule 12 — organism-level state). The page holds mirror copies updated via `onchange` callbacks, used only to feed `PatternPreviewPanel` and the snapshot. No global store required.
