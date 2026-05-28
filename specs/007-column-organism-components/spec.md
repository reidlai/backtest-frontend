# Feature Specification: Backtest Engine Column Organism Components

**Feature Branch**: `007-column-organism-components`

**Created**: 2026-05-28

**Status**: Implemented

**Input**: User description: "in src/routes/backtest-engine/+page.svelte, there are three columns. Each column should be organisms components and has its own state."

## Clarifications

### Session 2026-05-28

- Q: Should each organism's state be a dedicated singleton (importable, globally shared), or local reactive state scoped to the component instance? → A: Dedicated singleton per organism (e.g., `src/lib/state/universe-capital.svelte.ts`) — matches existing project pattern.
- Q: What should happen to the existing `backtestState` singleton once three per-organism singletons exist? → A: Remove `backtestState` entirely; update all import sites (`+page.svelte`, `QuickActionsPanel.svelte`) to use the relevant per-organism singleton.
- Q: When "Run Backtest" is clicked, where should coordination logic that reads from all three singletons live? → A: `+page.svelte` owns `handleRun`, imports all three singletons, and passes it as a prop/callback to the Order Types organism.
- Q: Where should the `$effect` that writes `appState.backtestPrefillSymbol` into the universe field live after the refactor? → A: Keep `$effect` in `+page.svelte`; it writes to `universeCapitalState.universe` directly, keeping the organism unaware of `appState`.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Extract Universe & Capital Column (Priority: P1)

A developer opens the backtest engine page and sees the "Universe & Capital" column rendered by a self-contained organism component. The component manages its own state for backtest mode, universe/symbol, and initial capital inputs, independently of the other columns.

**Why this priority**: This is the primary input column that determines what gets backtested. Extracting it first establishes the organism pattern and state isolation model for the remaining columns.

**Independent Test**: Can be tested by rendering the organism in isolation and verifying it initializes with correct defaults and accepts user input without requiring the other columns to exist.

**Acceptance Scenarios**:

1. **Given** the backtest engine page loads, **When** the Universe & Capital column is rendered, **Then** it uses its own organism component with independently managed state for mode, universe, and initial capital.
2. **Given** a user selects a backtest mode, **When** they change the universe field, **Then** only the Universe & Capital organism's state updates without affecting other columns.
3. **Given** the organism is rendered in isolation, **When** the component initializes, **Then** it displays the correct default values from its own state.

---

### User Story 2 - Extract Schedule & Execution Column (Priority: P2)

A developer opens the backtest engine page and sees the "Schedule & Execution" column rendered by a self-contained organism component. The component manages its own state for start date, end date, timeframe, and trading direction.

**Why this priority**: Establishes consistent organism pattern for time-range and execution configuration, decoupling schedule-related state from the other columns.

**Independent Test**: Can be tested by rendering the organism in isolation and verifying date range inputs, timeframe selector, and direction selector all function with their own contained state.

**Acceptance Scenarios**:

1. **Given** the backtest engine page loads, **When** the Schedule & Execution column is rendered, **Then** it uses its own organism component with independently managed state.
2. **Given** a user sets a start date, **When** they change the timeframe, **Then** only the Schedule & Execution organism's state updates.
3. **Given** the organism initializes, **When** default values are applied, **Then** start date, end date, timeframe, and direction reflect their expected defaults.

---

### User Story 3 - Extract Order Types Column (Priority: P3)

A developer opens the backtest engine page and sees the "Order Types" column rendered by a self-contained organism component. The component manages its own state for selected order types and exposes the "Run Backtest" action.

**Why this priority**: Completes the three-column decomposition. The order types column includes the run action, so its state boundary needs clear definition.

**Independent Test**: Can be tested by rendering the organism in isolation, toggling order type checkboxes, and triggering the run action to verify state is self-contained.

**Acceptance Scenarios**:

1. **Given** the backtest engine page loads, **When** the Order Types column is rendered, **Then** it uses its own organism component with independently managed state for selected order types.
2. **Given** a user toggles an order type checkbox, **When** they toggle another order type, **Then** only the Order Types organism's state updates.
3. **Given** the user clicks "Run Backtest", **When** the action triggers, **Then** the organism invokes the `onRun` callback supplied by the page, not its own coordination logic.

---

### Edge Cases

- What happens when an organism component is rendered outside the backtest engine page (e.g., in a story or test harness)?
- If `onRun` prop is not provided to the Order Types organism, the Run Backtest button is a no-op (the prop defaults to an empty function `() => {}`; the button remains enabled and visible but clicking it has no effect).
- What happens if one column's organism state fails to initialize (missing schema defaults)?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The backtest engine page MUST render each of its three columns as a dedicated organism component.
- **FR-002**: Each organism component MUST manage its own internal state via a dedicated singleton state file (e.g., `src/lib/state/universe-capital-config.svelte.ts`), following the existing project state pattern. State is not shared between sibling organisms.
- **FR-003**: The Universe & Capital organism MUST encapsulate state for: backtest mode, universe/symbol, and initial capital.
- **FR-004**: The Schedule & Execution organism MUST encapsulate state for: start date, end date, timeframe, and trading direction.
- **FR-005**: The Order Types organism MUST encapsulate state for the set of selected order types. It MUST accept a `onRun` callback prop rather than owning run coordination logic itself.
- **FR-006**: Each organism MUST initialize its state from the same schema-driven defaults currently used by the page.
- **FR-007**: The backtest engine page MUST remain visually and functionally equivalent before and after the refactor.
- **FR-008**: Each organism MUST be independently renderable (usable outside the page context for testing or reuse).
- **FR-009**: The existing `backtestState` singleton MUST be removed, and all existing import sites (`+page.svelte`, `QuickActionsPanel.svelte`) MUST be updated to reference the appropriate per-organism singleton instead.
- **FR-010**: The `reset()` capability previously on `backtestState` MUST be preserved — each per-organism singleton MUST expose its own `reset()` method, and call sites (e.g., `QuickActionsPanel`) MUST call reset on all three singletons.
- **FR-011**: The backtest engine page (`+page.svelte`) MUST own `handleRun`, importing all three per-organism singletons to aggregate their state, and MUST pass `handleRun` as a prop/callback to the Order Types organism.
- **FR-012**: The `$effect` that writes `appState.backtestPrefillSymbol` into the universe field MUST remain in `+page.svelte`, updated to write to `universeCapitalConfigState.universe`. The `UniverseCapitalConfig` organism MUST NOT import `appState`.

### Key Entities

- **UniverseCapitalConfig Organism**: Self-contained component for backtest mode, universe/symbol input, and initial capital input. State file: `src/lib/state/universe-capital-config.svelte.ts`; class `UniverseCapitalConfigState`; singleton `universeCapitalConfigState`.
- **ScheduleExecutionConfig Organism**: Self-contained component for date range, timeframe, and trading direction selection. State file: `src/lib/state/schedule-execution-config.svelte.ts`; class `ScheduleExecutionConfigState`; singleton `scheduleExecutionConfigState`.
- **OrderTypesConfig Organism**: Self-contained component for order type checkbox selection and the run backtest action. State file: `src/lib/state/order-types-config.svelte.ts`; class `OrderTypesConfigState`; singleton `orderTypesConfigState`.
- **Organism State**: A dedicated singleton state class per organism, each exported as a module-level instance, mirroring the current `BacktestState` pattern. All class and file names use the `Config` suffix (e.g., `UniverseCapitalConfigState`, not `UniverseCapitalState`).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All three columns render via distinct organism components — verifiable by inspecting the page component tree showing three named organisms, not inline markup.
- **SC-002**: Each organism can be instantiated and interact with independently without importing or referencing sibling organism state.
- **SC-003**: The backtest engine page's visual layout and interactive behavior are identical before and after the refactor, as confirmed by manual comparison (T026 in tasks.md).
- **SC-004**: Zero regressions introduced — all existing tests pass after the refactor.

## Assumptions

- The existing `BacktestStateSchema` defaults will be reused per organism, not replaced with new schemas.
- The existing `backtestState` singleton will be fully removed; there is no backward-compat shim.
- `QuickActionsPanel.svelte` is the only non-page consumer of `backtestState`; its `reset()` call site will be updated to reset all three per-organism singletons.
- The "Run Backtest" action in the Order Types column will continue to trigger a toast notification (existing behavior) — cross-organism data aggregation for actual API calls is out of scope for this feature.
- No new UI elements or fields are added; the refactor is structural only.
- The three organisms follow the existing organism naming and file placement conventions in `src/lib/components/organisms/`.
- Each organism owns only the state fields currently rendered within that column; no state fields move between columns.
- The `$effect` for `appState.backtestPrefillSymbol` remains in `+page.svelte` as cross-state coordination; organism components do not import `appState`.
