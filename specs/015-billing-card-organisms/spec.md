# Feature Specification: Billing Card Organisms

**Feature Branch**: `015-billing-card-organisms`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "in src/routes/setting-billing/+page.svelte, please convert three cards into three organism which has local state and zod schema support"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Token Usage Organism (Priority: P1)

A developer wants the Token Usage card to be a self-contained organism that manages its own display state and validates resource usage data through a schema, so that data integrity is guaranteed before rendering and the card can be reused independently.

**Why this priority**: Token usage is the primary billing metric. It must display correctly and validate data shape before rendering to prevent runtime errors.

**Independent Test**: Can be tested by mounting the organism in isolation with mock data matching/violating the schema, verifying the progress bar and labels render correctly for valid data and the organism handles invalid/missing data gracefully.

**Acceptance Scenarios**:

1. **Given** valid token usage data, **When** the Token Usage organism mounts, **Then** it displays current usage, total quota, a progress bar at the correct percentage, and the daily reset note.
2. **Given** data that violates the schema (e.g., negative tokens or missing total), **When** the organism receives that data, **Then** it shows a fallback/error state instead of rendering corrupt values.
3. **Given** tokens at 100% of quota, **When** the organism renders, **Then** the progress bar is full and a visual cue indicates quota exhaustion.

---

### User Story 2 - Backtest Runs Organism (Priority: P2)

A developer wants the Backtest Runs card to be a self-contained organism that manages display state and validates daily run quota data through a schema, including the current plan name, so it can be rendered and tested in isolation.

**Why this priority**: Backtest quota is the second core billing metric and includes plan context, which affects downstream feature gating.

**Independent Test**: Can be tested by mounting the organism with varied run counts and plan names, confirming correct progress rendering and plan badge display.

**Acceptance Scenarios**:

1. **Given** valid backtest run data with a plan name, **When** the Backtest Runs organism mounts, **Then** it displays runs used vs total, a progress bar, and the current plan name prominently.
2. **Given** schema-invalid data (e.g., used > total, missing plan), **When** the organism receives that data, **Then** it falls back gracefully without crashing.
3. **Given** zero runs used, **When** the organism renders, **Then** the progress bar is at 0% and the plan name is still shown.

---

### User Story 3 - System Status Organism (Priority: P3)

A developer wants the System Status card to be a self-contained organism that manages its own display state and validates system metric fields (queue position, complexity score, estimated runtime) through a schema.

**Why this priority**: System status data is supplementary context for the user. It must still render reliably even when data is partially missing.

**Independent Test**: Can be tested by mounting the organism with full and partial data, verifying each metric row renders or is omitted cleanly.

**Acceptance Scenarios**:

1. **Given** valid system status data, **When** the System Status organism mounts, **Then** it displays queue position, complexity score, and estimated runtime as labeled rows.
2. **Given** a missing or null field (e.g., no estimated runtime), **When** the organism renders, **Then** that row is omitted or shows a placeholder rather than crashing.
3. **Given** schema-invalid complexity score (e.g., above 100 or negative), **When** the organism receives that data, **Then** it shows a fallback state.

---

### Edge Cases

- What happens when the resource usage API returns null or undefined for any field?
- How does each organism handle schema parse failures at runtime — show error UI or silently hide?
- What happens when tokensUsed equals tokensTotal exactly (100% progress)?
- How does the Backtest Runs organism render if the plan name string is empty?
- What if complexityScore is outside the 0–100 range?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Each of the three billing cards MUST be extracted into its own Svelte organism component file under `$lib/components/organisms/`.
- **FR-002**: Each organism MUST define a Zod schema that describes the shape of its input data, including types and constraints (e.g., non-negative numbers, non-empty strings).
- **FR-003**: Each organism MUST hold local Svelte state derived from its props, validated through the Zod schema on mount or prop change.
- **FR-004**: Each organism MUST render a fallback or error state when input data fails schema validation.
- **FR-005**: The `setting-billing` page MUST be refactored to import and use the three organism components, passing existing mock data as props.
- **FR-006**: Each organism MUST be independently renderable and testable without requiring the full page context.
- **FR-007**: The Token Usage organism schema MUST enforce non-negative integers for `tokensUsed` and `tokensTotal`, with `tokensUsed <= tokensTotal`.
- **FR-008**: The Backtest Runs organism schema MUST enforce non-negative integers for `backtestsUsed` and `backtestsTotal`, plus a non-empty string for `planName`.
- **FR-009**: The System Status organism schema MUST enforce a number in 0–100 range for `complexityScore`, a positive integer for `queuePosition`, and a non-empty string for `estimatedRuntime`.

### Key Entities

- **TokenUsageData**: `{ tokensUsed: number, tokensTotal: number }` — validated to be non-negative integers with used ≤ total.
- **BacktestRunsData**: `{ backtestsUsed: number, backtestsTotal: number, planName: string }` — validated run counts and non-empty plan name.
- **SystemStatusData**: `{ queuePosition: number, complexityScore: number, estimatedRuntime: string }` — validated ranges and non-empty runtime string.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All three organism components can be mounted in isolation with valid mock data and render without errors.
- **SC-002**: Each organism correctly rejects invalid input data (schema violations) and displays a fallback state in 100% of tested invalid cases.
- **SC-003**: The `setting-billing` page renders identically to the pre-refactor state when provided with the same valid mock data.
- **SC-004**: Each organism component file is independently importable and contains no direct dependency on the parent page's context.
- **SC-005**: Schema validation covers all required fields — no required field is left without a type constraint.

## Assumptions

- The existing `sampleResourceUsage` mock data from `$lib/shared-mockdata/strategy` will continue to be used as the data source during this refactor; no API integration is in scope.
- The visual design and layout of each card are preserved exactly — this is a structural refactor, not a visual redesign.
- Zod is already available as a project dependency (used in feature 005 and subsequent organisms).
- Each organism receives its data exclusively via props; no stores or context are used within the organisms for this feature.
- Error/fallback UI for schema failures can be a simple text message or hidden card body — exact design is left to implementation.
- Svelte 5 runes (`$props`, `$derived`, `$state`) are used consistent with the existing project pattern.
