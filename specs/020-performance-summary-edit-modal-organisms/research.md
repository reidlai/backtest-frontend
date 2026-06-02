# Research: Performance Summary & Edit Modal Organisms

## Decision 1: Schema file naming and placement

**Decision**: Create `src/lib/schemas/performance-summary.schema.ts` and `src/lib/schemas/edit-metric-modal.schema.ts`.

**Rationale**: Existing schema files follow the pattern `<organism-kebab-name>.schema.ts` directly in `src/lib/schemas/`. Confirmed from inspection: `regime-breakdown.schema.ts`, `performance-metric-grid.schema.ts`, `live-control-form.schema.ts`. Both new files follow this convention. Export both via `src/lib/schemas/index.ts`.

**Alternatives considered**: Co-locating schemas in the organism `.svelte` file — rejected per Q3 clarification and existing project convention.

---

## Decision 2: PerformanceSummary schema structure

**Decision**: Define `PerformanceSummarySchema` as:

```ts
const PerformanceSummarySchema = z.object({
  stats: z.array(PerfSummaryItemSchema).default([])
});
```

Reuse the existing `PerfSummaryItemSchema` (`{ label: z.string(), value: z.string() }`) from `perf-summary-item.schema.ts`.

**Rationale**: `PerfSummaryItemSchema` already exists and matches the `samplePerfSummary` data shape. The organism-level schema wraps it in an array with a default of `[]` to support the empty state requirement (SC-004).

**Alternatives considered**: Defining a standalone schema without reusing `PerfSummaryItemSchema` — rejected as duplication.

---

## Decision 3: EditMetricModal schema structure

**Decision**: Define two schemas in `edit-metric-modal.schema.ts`:

```ts
// Local state schema
const EditMetricModalStateSchema = z.object({
  editValue: z.string().default('')
});

// Input validation schema (used for Apply button gate)
const EditMetricValueSchema = z.string()
  .min(1, 'Value is required')
  .refine(v => !isNaN(parseFloat(v.trim())) && v.trim() !== '', {
    message: 'Must be a valid number'
  });
```

**Rationale**: The state schema captures the organism's internal reactive state (just `editValue`; the parent owns `open`/`tileId`/`initialValue`). The value validation schema is kept separate so it can be used directly in `isValid` derivation. The existing `MetricEditPayloadSchema` (`{ tileId, newValue }`) represents the emitted payload, not the form state — no conflict.

**Alternatives considered**: Reusing `MetricEditPayloadSchema` for validation — rejected; that schema represents the outbound callback payload, not the input field constraint.

---

## Decision 4: Reactive reset of editValue on open transition

**Decision**: Use a Svelte 5 `$effect` watching the `open` prop. When `open` transitions to `true`, set `state.editValue = props.initialValue`.

```ts
let prevOpen = false;
$effect(() => {
  if (props.open && !prevOpen) {
    state.editValue = props.initialValue;
  }
  prevOpen = props.open;
});
```

**Rationale**: Svelte 5 `$effect` is the idiomatic way to react to prop changes. Tracking `prevOpen` ensures the reset fires exactly on the `false → true` edge, not on every render. Confirmed by Q4 clarification (Option A).

**Alternatives considered**: Resetting on every `tileId` or `initialValue` change (Option B) — rejected per clarification.

---

## Decision 5: PerformanceSummary organism internal state pattern

**Decision**: Follow the `RegimeBreakdownTable` pattern exactly:

```ts
const stats = $state(
  samplePerfSummary.filter(item => PerfSummaryItemSchema.safeParse(item).success)
);
```

Rows failing schema validation are silently excluded; the organism shows an empty state when the array is empty.

**Rationale**: `RegimeBreakdownTable` uses identical pattern for the same use case (self-contained mock data + schema filter + empty state). Replicating it ensures consistency and passes Acceptance Scenario 3 (graceful failure on invalid data).

---

## Decision 6: Storybook stories (Constitution Rule 12)

**Decision**: Create Storybook stories for both organisms:
- `src/lib/components/organisms/PerformanceSummary.stories.ts`
- `src/lib/components/organisms/EditMetricModal.stories.ts`

Stories must cover: default state, empty state (PerformanceSummary); open with valid/invalid input, closed (EditMetricModal).

**Rationale**: Constitution Rule 12 mandates Storybook verification BEFORE backend implementation. This feature is frontend-only, so Storybook tasks precede any integration wiring.

---

## Decision 7: BDD feature file

**Decision**: Create `features/performance-summary-edit-modal-organisms.feature` tagged `@performance-summary-edit-modal @frontend`.

Scenarios to cover:
- PerformanceSummary renders stat rows (smoke)
- PerformanceSummary shows empty state when no valid data (smoke)
- EditMetricModal Apply button disabled on invalid input (smoke)
- EditMetricModal resets input on re-open (integration)
- EditMetricModal emits onApply with new value (smoke)
- Parent page no longer has inline modal state vars (smoke)

**Rationale**: Constitution Rule 6 requires all new behaviors covered by BDD feature files in `features/`.
