# Research: Billing Card Organisms

**Branch**: `015-billing-card-organisms` | **Date**: 2026-06-01

## Decision 1: Schema reuse vs. new per-organism schemas

**Decision**: Create three new, dedicated schema files — `token-usage-card.schema.ts`,
`backtest-runs-card.schema.ts`, `system-status-card.schema.ts` — each wrapping the
relevant subset of `ResourceUsageSchema` fields via `.pick()`.

**Rationale**: The existing `ResourceUsageSchema` covers all required fields. Rather than
importing the whole schema into each organism (coupling organisms to fields they don't use),
each organism schema picks only the fields it needs and sets organism-specific defaults. This
mirrors the `ResourceCostPanelSchema` pattern already in use.

**Alternatives considered**:
- Reuse `ResourceUsageSchema` directly in each organism: rejected — each organism uses a
  subset of fields; importing the full schema creates unnecessary coupling.
- Single shared `BillingPageSchema` wrapping all three card schemas: rejected — organisms
  must be independently mountable without a parent schema.

---

## Decision 2: Prop-based data flow vs. store-based

**Decision**: Each organism receives data exclusively via props validated through the Zod schema.
Local `$state` is derived from the parsed props.

**Rationale**: Consistent with all 30 existing organisms in the codebase. The billing page
already uses `sampleResourceUsage` from a shared mock; passing it as props to each organism
preserves the isolation guarantee from the spec.

**Alternatives considered**:
- Reading from a Svelte store inside the organism: rejected — organisms must be independently
  renderable without store context; spec explicitly rules this out.

---

## Decision 3: Storybook story structure

**Decision**: One `.stories.svelte` file per organism, placed in `src/stories/`, using
`defineMeta` and `@storybook/addon-svelte-csf` — consistent with `RegimeCardsGrid.stories.svelte`
and all other organism stories.

**Rationale**: Existing stories follow this exact pattern; reuse avoids introducing a new
Storybook configuration approach.

---

## Decision 4: BDD feature file scope

**Decision**: A new `features/billing-card-organisms.feature` covers the three organisms.
The existing `features/zod-schema-organisms.feature` organism and schema count references
will be updated to reflect the new totals (30 → 33 organisms, schema count updated accordingly).

**Rationale**: Constitution Rule 6 requires BDD scenarios defined before implementation.
The existing `zod-schema-organisms.feature` hardcodes organism counts; those counts must
stay accurate to keep the CI BDD suite green.

---

## Decision 5: Fallback/error state for schema failures

**Decision**: If `Schema.parse(props)` throws (invalid data), each organism catches the
error and renders a simple `<p class="text-destructive text-sm">Invalid data</p>` fallback
inside the card body using Svelte's `try/catch` in the `$derived` block or `$effect`.

**Rationale**: Consistent minimal approach; no custom error component needed. Keeps organisms
stateless-presentational at the error boundary without introducing a new component atom.
