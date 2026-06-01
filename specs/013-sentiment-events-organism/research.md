# Research: Sentiment Events Table Organism

## Decision 1: Schema location

**Decision**: Reuse the existing `SentimentEventSchema` from `$lib/schemas/sentiment-event.schema.ts` (already exported via `$lib/schemas/index.ts`).
**Rationale**: The schema was created in a prior feature (005-zod-schema-organisms) and already covers all required fields. No new file needed; FR-003 is satisfied by the existing export.
**Alternatives considered**: Creating a new schema file — rejected because the schema already exists and duplicating it would violate single source of truth.

## Decision 2: Reactive validation pattern

**Decision**: Use Svelte 5 `$derived` rune to compute the validated list from the prop.

```svelte
let validatedEvents = $derived(
  props.events.flatMap(e => {
    const result = SentimentEventSchema.safeParse(e);
    if (!result.success) { console.warn(...); return []; }
    return [result.data];
  })
);
```

**Rationale**: `$derived` re-runs automatically whenever the prop reference changes, satisfying FR-004 and FR-005 without manual `$effect` subscriptions.
**Alternatives considered**: `$state` + `$effect` (Option C from clarification) — adds boilerplate and risk of stale state on rapid prop changes.

## Decision 3: Empty-state row

**Decision**: Render a `<Table.Row>` with a single `<Table.Cell colspan={6}>` containing "No events found" when `validatedEvents.length === 0`.
**Rationale**: Matches shadcn-svelte table conventions used in `ScreenerResultTable.svelte`; avoids a confusing blank table body.
**Alternatives considered**: Hiding the table entirely — rejected because the header gives users useful structural context.

## Decision 4: Symbol fallback

**Decision**: Display `event.symbol || 'Global'` in the Symbol cell.
**Rationale**: The mock data uses empty string `''` for global events; the existing inline code uses the same pattern. The schema types `symbol` as `z.string()` (not nullable), so `|| 'Global'` handles both empty string and any future null/undefined edge.

## Decision 5: BDD feature file

**Decision**: Create `features/sentiment-events-organism.feature` tagged `@frontend @smoke`.
**Rationale**: Constitution Rule 6 and Rule 8 require a Gherkin feature file for every new behavior. The file uses the same tag conventions as `zod-schema-organisms.feature`.

## Decision 6: Storybook story

**Decision**: Add a Storybook story for `SentimentEventsTable` (default + empty state) before the component implementation task, per Constitution Rule 12.
**Rationale**: Rule 12 mandates Storybook verification before backend implementation. Although there is no backend here, the rule applies to all UI organisms and the story documents all renderable states.
