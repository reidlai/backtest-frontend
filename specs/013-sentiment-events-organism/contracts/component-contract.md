# Component Contract: SentimentEventsTable

## Location

`src/lib/components/organisms/SentimentEventsTable.svelte`

## Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `events` | `unknown[]` | Yes | — | Raw event list; organism validates internally |

## Emits

None. This is a display-only organism.

## Slots

None.

## Behaviour Contract

1. **Valid events** — rendered as table rows in the order received after filtering.
2. **Invalid events** — silently excluded; a `console.warn` is emitted per invalid item.
3. **Empty list** — a single "No events found" row spanning all 6 columns is shown.
4. **Prop update** — `$derived` recomputes the validated list on every prop change; the table re-renders automatically.

## Visual Contract

- Outer wrapper: `div.overflow-hidden.rounded-xl.border.bg-card.shadow-sm`
- Table: shadcn-svelte `Table.Root / Table.Header / Table.Body`
- Six columns in order: Type | Symbol | Date | Headline | Sentiment | Score
- Headline column width: `w-[400px]`
- Score bar: bidirectional, centred at 0, 50% half-width maps to score ±1.0

## Exports

```typescript
export { SentimentEventsTable as default } from './SentimentEventsTable.svelte';
```

The schema and its TypeScript type are not re-exported from this file; import directly from `$lib/schemas`.
