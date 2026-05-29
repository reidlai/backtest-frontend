# Feature Specification: Fundamental Screener Organism Refactor

**Feature Branch**: `008-screener-organism-refactor`

**Created**: 2026-05-29

**Status**: Draft

**Input**: User description: "in src/routes/fundamental-screener, Filter block should be converted into one organism component and Result should be another and it should read sample file instead of at page level"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Filter Controls as Reusable Component (Priority: P1)

As a developer maintaining the fundamental screener page, I want the filter block (Universe, PE Ratio, ROIC, Rev Growth) to be encapsulated in a dedicated organism component so that the page component remains thin and concerns are properly separated.

**Why this priority**: This is the foundational refactor that separates state ownership from page-level concerns, enabling the result component to be decoupled too.

**Independent Test**: The filter organism can be rendered in isolation with default values and its state changes propagate correctly to the parent via events or bound props.

**Acceptance Scenarios**:

1. **Given** the fundamental screener page loads, **When** the filter organism renders, **Then** all four filter controls (Universe select, PE Ratio input, ROIC input, Rev Growth input) are visible with their default values.
2. **Given** a user changes the Universe select, **When** a new value is selected, **Then** the filter organism updates its internal state and re-renders the control with the new value (state does not propagate to the page).
3. **Given** snapshot capture/restore is active, **When** the page navigates away and returns, **Then** filter values are restored correctly through the organism's snapshot participation.

---

### User Story 2 - Results Table as Reusable Component (Priority: P2)

As a developer, I want the results table (column headers + rows) to be encapsulated in a dedicated organism component that receives its data from a passed-in source rather than importing sample data at the page level.

**Why this priority**: Decoupling data sourcing from the result presentation makes both components independently testable and prepares the results component for real API data in future.

**Independent Test**: The result organism can be rendered with any array of screener result records and renders the correct rows and columns without any page-level import.

**Acceptance Scenarios**:

1. **Given** the result organism receives a list of screener records, **When** it renders, **Then** each record appears as a row with all expected columns (Symbol, Name, P/E, EV/EBITDA, FCF Yield, ROIC, Rev Growth, EPS Growth, Score, Action).
2. **Given** a user clicks the "Backtest" action in a row, **When** the action fires, **Then** the organism emits the selected symbol so the page can navigate to the backtest engine.
3. **Given** an empty list is passed, **When** the result organism renders, **Then** the table header is visible and the body contains no rows (no crash).

---

### User Story 3 - Sample Data Moved to Organism Level (Priority: P3)

As a developer, I want the sample screener data import (`sampleScreenerResults`) to be consumed inside the result organism rather than imported at the page level, so that the page component has no direct data dependency.

**Why this priority**: Moves data sourcing responsibility to the organism, keeping the page a pure composition shell.

**Independent Test**: The page file contains no import of `sampleScreenerResults`; the result organism loads and displays the sample data autonomously when no external data is supplied.

**Acceptance Scenarios**:

1. **Given** the page file is inspected, **When** checking imports, **Then** no reference to `sampleScreenerResults` exists at the page level.
2. **Given** the result organism is rendered without explicit data props, **When** it mounts, **Then** it internally sources sample data and displays all sample rows.

---

### Edge Cases

- What happens when the sample data array is empty? The result organism must render the table header without crashing.
- What happens if snapshot restore receives invalid data? The filter organism must ignore it gracefully (existing Zod schema validation behaviour preserved).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST extract the filter block (Universe, PE Ratio ≤, ROIC (%) ≥, Rev Growth (%) ≥) into a dedicated organism component named `ScreenerFilterPanel` (or equivalent).
- **FR-002**: System MUST extract the results table into a dedicated organism component named `ScreenerResultTable` (or equivalent).
- **FR-003**: The filter organism MUST manage all four filter state variables (`universe`, `peMax`, `roicMin`, `revGrowthMin`) as fully internal state — no bindable props or events are exposed to the page.
- **FR-004**: The filter organism MUST own and export its own `snapshot` object (`capture`/`restore`); the page MUST re-export the organism's snapshot to satisfy SvelteKit's routing contract.
- **FR-005**: The result organism MUST source `sampleScreenerResults` data internally, not at the page level.
- **FR-006**: The result organism MUST accept an optional callback or event for the "Backtest" action to allow the page to handle navigation.
- **FR-007**: The page component (`+page.svelte`) MUST be simplified to compose only the filter and result organisms with minimal logic.
- **FR-008**: All existing visual behaviour and layout MUST be preserved — no regressions in appearance or interaction.

### Key Entities

- **ScreenerFilterPanel**: Organism that owns filter state (universe, PE max, ROIC min, rev growth min) and participates in snapshot.
- **ScreenerResultTable**: Organism that sources sample data and renders the results table, emitting backtest action events.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The page component (`+page.svelte`) script block contains no direct import of sample data after the refactor.
- **SC-002**: Each organism component can be individually imported and rendered without requiring the full page context.
- **SC-003**: All existing screener UI interactions (filter changes, backtest button) work identically to pre-refactor behaviour — zero regressions observable in manual testing.
- **SC-004**: The `+page.svelte` template block is reduced to the two organism components plus the page heading, with no inline filter or table markup remaining.

## Clarifications

### Session 2026-05-29

- Q: Who owns snapshot logic? → A: Filter organism owns and exports its own snapshot; page re-exports it.
- Q: Should filter state be exposed externally? → A: Filter state is fully internal — no bindable props or events; organism is self-contained.

## Assumptions

- The `FundamentalScreenerSchema` Zod schema used for snapshot validation will remain at the shared schema level and be imported by whichever component owns snapshot logic.
- The `sampleScreenerResults` mock data stays in `$lib/shared-mockdata/market` — only the import location moves from page to result organism.
- Mobile/responsive layout behaviour is unchanged (existing Tailwind classes are preserved inside the organism templates).
- No new filtering logic (actual data filtering by PE/ROIC/RevGrowth values) is in scope for this refactor — display remains unfiltered sample data.
