# Feature Specification: Performance Summary & Edit Modal Organisms

**Feature Branch**: `020-performance-summary-edit-modal-organisms`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "in src/routes/performance-result/+page.svelte, Convert Performance Summary block into organism with local state and zod schema support. Convert Edit Modal Dialog block into organism with local state and zod schema support"

## Clarifications

### Session 2026-06-02

- Q: Should `EditMetricModal` be a fully controlled component (parent owns `open` state) or self-contained (organism owns `open` state internally, triggered by a prop)? → A: Fully controlled — parent owns `open` state, passes it as a prop; organism emits `onClose` to signal the parent to set it to `false`.
- Q: Should `PerformanceSummary` accept stats as a prop or import `samplePerfSummary` directly? → A: Self-contained — imports `samplePerfSummary` directly; no stats prop. Future ReactiveX + API data layer is out of scope for this feature.
- Q: Should Zod schemas be co-located in `.svelte` files or extracted to separate schema files? → A: Separate `*.schema.ts` files under `src/lib/schemas/`, matching existing project convention.

### Session 2026-06-02 (continued)

- Q: When the parent re-opens the modal with a new `tileId`/`initialValue`, should `editValue` auto-reset? → A: Yes — reset `editValue` to `initialValue` each time `open` transitions from `false` → `true`.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Statistics Summary (Priority: P1)

A user navigating to the performance results page sees a Statistics Summary panel that displays key backtest statistics in a two-column grid. The data is self-contained within the organism and renders correctly regardless of what other components are on the page.

**Why this priority**: The Statistics Summary is a read-only display component. Extracting it as an organism with local state and a validated schema ensures consistent rendering and makes it independently reusable and testable.

**Independent Test**: Can be tested by mounting `PerformanceSummary` in isolation and confirming all stat rows render correctly with their labels and values.

**Acceptance Scenarios**:

1. **Given** the performance results page is loaded, **When** the Statistics Summary organism mounts, **Then** it displays each stat from its data source as a labeled row with a value.
2. **Given** the Statistics Summary organism receives data conforming to its schema, **When** it renders, **Then** each row shows the correct label and value without errors.
3. **Given** the Statistics Summary organism receives data that does not conform to its schema, **When** it tries to render, **Then** it fails gracefully (empty state or error boundary) without crashing the page.

---

### User Story 2 - Edit Metric Value via Modal (Priority: P2)

A user can open a modal dialog to edit a metric tile value. The modal contains an input field that validates the entered value (must be a valid number), shows an inline error if invalid, and allows the user to apply or cancel the change.

**Why this priority**: The Edit Modal encapsulates its own open/close state, editing state, and validation logic. Extracting it as an organism makes that logic reusable and independently verifiable.

**Independent Test**: Can be tested by mounting `EditMetricModal` with controlled props, opening it, entering values, and confirming the apply/cancel callbacks fire correctly.

**Acceptance Scenarios**:

1. **Given** the parent sets `open=true`, `tileId`, and `initialValue` on the `EditMetricModal` organism, **When** the user enters a valid numeric value and clicks Apply, **Then** the `onApply` callback is called with the new value and the parent sets `open=false` closing the modal.
2. **Given** the Edit Modal is open and the user enters a non-numeric value, **When** the input changes, **Then** the Apply button is disabled and an inline validation error message is shown.
3. **Given** the Edit Modal is open, **When** the user clicks Cancel, **Then** the modal closes and no changes are applied.
4. **Given** the Edit Modal is open with an empty input, **When** the user has not entered anything, **Then** the Apply button is disabled and no error message is shown (error only shows after user types an invalid value).

---

### Edge Cases

- When `PerformanceSummary` has no valid stats (empty or all-invalid data), it MUST display a "No statistics available" fallback message in place of the grid — the organism MUST NOT crash.
- When `EditMetricModal` receives a `null` or unrecognised `tileId` while `open=true`, the Apply button MUST remain disabled; the organism renders normally but no value can be submitted.
- When the user enters whitespace-only input (e.g., `"   "`) in `EditMetricModal`, it MUST be treated as invalid: the Apply button is disabled and an inline error message is shown (whitespace-only fails the `v.trim() !== ''` check in `EditMetricValueSchema`).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: A `PerformanceSummary` organism MUST encapsulate the Statistics Summary UI block currently inline in `+page.svelte`, importing `samplePerfSummary` directly as its internal data source (no props); a future ReactiveX + API layer will replace this in a separate feature.
- **FR-002**: `PerformanceSummary` MUST define a Zod schema for its data shape in `src/lib/schemas/performance-summary.schema.ts` and validate its internal data against it.
- **FR-003**: `PerformanceSummary` MUST manage any local display state internally (e.g., loading, empty state).
- **FR-004**: An `EditMetricModal` organism MUST encapsulate the Edit Modal Dialog block currently inline in `+page.svelte`, including internal `editValue` editing state and validation logic; `open` state is owned by the parent (not internal to the organism).
- **FR-005**: `EditMetricModal` MUST define a Zod schema for the metric value being edited in `src/lib/schemas/edit-metric-modal.schema.ts` (must be a valid number, non-empty) and use it for validation.
- **FR-006**: `EditMetricModal` MUST expose a fully controlled interface: accept `open`, `tileId`, and `initialValue` as props and emit `onApply(newValue)` and `onClose` callbacks; the parent owns the `open` state.
- **FR-006a**: `EditMetricModal` MUST reset its internal `editValue` to `initialValue` each time `open` transitions from `false` to `true`; stale input from a previously opened tile MUST NOT persist.
- **FR-007**: `EditMetricModal` MUST disable the Apply button when the current input value fails schema validation.
- **FR-008**: `EditMetricModal` MUST display an inline validation error message only when the user has entered a non-empty, invalid value.
- **FR-009**: Both organisms MUST follow the existing project organism conventions (file location under `$lib/components/organisms/`, Svelte 5 runes syntax).
- **FR-010**: `+page.svelte` MUST be updated to use the new `PerformanceSummary` and `EditMetricModal` organisms in place of the inline blocks.

### Key Entities

- **PerformanceSummary**: An organism representing the statistics summary panel. Owns its data source (initially `samplePerfSummary`) and renders it as a two-column labeled grid.
- **EditMetricModal**: An organism representing the edit metric value dialog. Parent owns `open` state (fully controlled); organism owns internal `editValue` and validation state; communicates changes via `onApply` and `onClose` callbacks.
- **Stat Item**: A single row in the summary panel — has a `label` (string) and a `value` (string). Both fields are required strings, matching `PerfSummaryItemSchema`.
- **Metric Edit Input**: The value being edited in the modal — must parse as a finite number.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Both organisms can be mounted in isolation in a test environment and rendered correctly without depending on the parent page's state.
- **SC-002**: The `+page.svelte` script block no longer contains the `editValue` or `isValid` declarations after the refactor; `modalOpen` and `editingTileId` remain in the page as props passed to the `EditMetricModal` organism.
- **SC-003**: Invalid numeric input in the Edit Modal is caught and surfaced to the user within the same render cycle — no incorrect values can be applied.
- **SC-004**: The Statistics Summary organism renders all stat rows when given valid data and shows an empty or fallback state when given no data.

## Assumptions

- `PerformanceSummary` imports `samplePerfSummary` directly as its internal data source. A future feature will introduce ReactiveX observables and API calls to replace the mock data; that migration is explicitly out of scope here.
- Svelte 5 runes (`$state`, `$derived`, `$props`) are the required state management pattern for both organisms, consistent with the rest of the codebase.
- Zod is already available as a project dependency. Schema files follow the existing convention at `src/lib/schemas/*.schema.ts`.
- The `onApply` callback in `EditMetricModal` will update the parent `tiles` array; the organism itself is not responsible for mutating global state.
- Drag-and-drop functionality (currently commented out in `+page.svelte`) is out of scope for this feature.
- Mobile responsiveness follows the same conventions as existing organisms and does not require additional specification here.
