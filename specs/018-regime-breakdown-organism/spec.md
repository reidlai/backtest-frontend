# Feature Specification: Regime Breakdown Organism

**Feature Branch**: `018-regime-breakdown-organism`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "in src/performance-result/+page.svelte convert Regime Breakdown div into organism with local state and zod schema support"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Regime Breakdown Table (Priority: P1)

A user viewing the performance result page sees the Regime Breakdown section rendered as a self-contained component that manages its own data and validates it against a schema.

**Why this priority**: This is the core deliverable — extracting the inline markup into a reusable organism. All other stories build on it.

**Independent Test**: Can be fully tested by navigating to the performance result page and confirming the Regime Breakdown table renders with the correct columns and rows.

**Acceptance Scenarios**:

1. **Given** the performance result page loads, **When** the Regime Breakdown section renders, **Then** a table with columns "Regime", "Return", "Max DD", and "Win Rate" is visible.
2. **Given** valid regime breakdown data, **When** the organism renders, **Then** each row displays regime name, return percentage (green for positive, red for negative), max drawdown (red), and win rate.
3. **Given** the organism is mounted, **When** data is accessed internally, **Then** it has been validated against the Zod schema before rendering.

---

### User Story 2 - Schema Validation Feedback (Priority: P2)

A developer reviewing the organism's internal data can confirm that invalid rows are silently excluded rather than causing a render crash, providing confidence that future API data will be safe to wire in.

**Why this priority**: Schema validation prevents silent data bugs during development and future API integration.

**Independent Test**: Can be tested by temporarily injecting a malformed row into the organism's internal mock data and confirming the organism excludes it without crashing the page.

**Acceptance Scenarios**:

1. **Given** data with a missing required field, **When** the organism validates the data, **Then** the invalid rows are excluded or a fallback empty state is shown.
2. **Given** all data rows are valid, **When** the organism validates the data, **Then** all rows render without error.

---

### User Story 3 - Local State Isolation (Priority: P3)

The organism owns its data state internally so the parent page is not responsible for managing regime breakdown data.

**Why this priority**: Encapsulation makes the organism independently reusable on other pages without coupling to parent state.

**Independent Test**: Can be tested by confirming the parent page (`+page.svelte`) no longer imports `sampleRegimeBreakdown` for this section, and the organism renders correctly in isolation.

**Acceptance Scenarios**:

1. **Given** the organism is used on the performance result page, **When** the page script is reviewed, **Then** `sampleRegimeBreakdown` is no longer referenced directly in the page for this section.
2. **Given** the organism is placed in a different page, **When** it mounts, **Then** it renders the table with its own internal data without requiring props.

---

### Edge Cases

- What happens when the regime breakdown data array is empty? (Organism MUST show a "No data available" message in place of the table rows.)
- What happens when a numeric field (e.g., `returnPct`) is `NaN` or `null`? (Schema validation should reject the row.)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: A new Svelte organism component named `RegimeBreakdownTable` MUST be created under `src/lib/components/organisms/`.
- **FR-002**: The organism MUST manage its regime breakdown data as internal local state with no props — mock data is the sole data source until a future API integration feature replaces it.
- **FR-003**: The organism MUST validate its data against `RegimeBreakdownSchema` (the existing Zod schema) before rendering rows.
- **FR-004**: The organism MUST render a table with columns: Regime, Return, Max DD, Win Rate — matching the current inline implementation.
- **FR-005**: Return percentage values MUST be displayed with a green color for positive values and red for negative values.
- **FR-006**: Max drawdown values MUST be displayed in red.
- **FR-007**: The parent page (`src/routes/performance-result/+page.svelte`) MUST replace the entire inline Regime Breakdown section — the outer `<div class="space-y-4">` containing the `<h2>Regime Breakdown</h2>` heading, the inner card `<div class="overflow-hidden rounded-xl border bg-card shadow-sm">`, and the `<Table.Root>` block — with a single `<RegimeBreakdownTable />` tag. The organism is responsible for rendering the full section including the heading.
- **FR-008**: The parent page MUST no longer directly import or reference `sampleRegimeBreakdown` if no other section requires it.
- **FR-009**: When the internal data array is empty, the organism MUST display a "No data available" message in place of the table rows.

### Key Entities

- **RegimeBreakdown**: A single row of regime performance data — regime name (string), return percentage (number), max drawdown (number), win rate (number), trade count (number). Validated by `RegimeBreakdownSchema`.
- **RegimeBreakdownTable organism**: The new Svelte component encapsulating the table markup, local state, and schema validation.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The Regime Breakdown table on the performance result page renders identically before and after the refactor (same columns, same rows, same color coding).
- **SC-002**: The parent page script block no longer contains inline regime breakdown state or data imports used solely for this section.
- **SC-003**: Invalid data rows (failing Zod schema validation) are excluded from the rendered table without causing a page crash.
- **SC-004**: The new organism can be dropped into a blank test page and render the table without any props from the parent.

## Clarifications

### Session 2026-06-01

- Q: Does the organism accept an optional data prop or manage data as strictly local state with no props? → A: Zero-props — internal mock data only. Mock data is temporary; API integration is a separate future feature.
- Q: What should the organism display when the data array is empty? → A: Show a "No data available" message in place of the table rows.
- Q: Does the organism include just the `<Table.Root>` or the full section (heading + card wrapper + table)? → A: Full section — the organism wraps the outer `<div class="space-y-4">`, the `<h2>Regime Breakdown</h2>` heading, the inner card div, and the table. The parent page is reduced to a single `<RegimeBreakdownTable />` tag. (Resolved via speckit-analyze finding U1.)

## Assumptions

- The existing `RegimeBreakdownSchema` in `src/lib/schemas/regime-breakdown.schema.ts` is the authoritative schema and will not be changed as part of this feature.
- The organism will use `sampleRegimeBreakdown` from the shared mock data as its initial local state, mimicking the current behavior until a real data source is wired up.
- The `tradeCount` field exists in the schema and mock data but is not currently rendered in the table; this behavior is preserved (not rendered) unless explicitly requested.
- Mobile/responsive styling is out of scope — match the current table layout.
- No new external dependencies are introduced; the existing Zod and shadcn-svelte Table primitives are used.
