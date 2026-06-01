# Data Model: Sentiment Events Table Organism

## Entity: SentimentEvent

Already defined and exported from `$lib/schemas/sentiment-event.schema.ts`.

| Field | Zod Type | Constraints | Notes |
|---|---|---|---|
| `id` | `z.string()` | Non-empty | Unique row key for `{#each}` |
| `type` | `z.enum([...])` | One of: news, earnings, fed, macro, insider, social | Displayed as uppercase badge |
| `symbol` | `z.string()` | May be empty string | Fallback display: "Global" |
| `date` | `z.string()` | ISO date string | Displayed as-is, muted style |
| `headline` | `z.string()` | Free text | Up to ~120 chars in sample data |
| `sentiment` | `z.enum([...])` | One of: positive, negative, neutral | Drives badge colour |
| `score` | `z.number()` | Range −1.0 to +1.0 | Drives bidirectional bar width |

### Score Bar Computation

```
barWidth = Math.abs(score) * 50   // % of half-bar
direction = score > 0 ? 'left-1/2' : 'right-1/2'
colour    = score > 0 ? 'bg-green-500' : 'bg-red-500'
```

Score of exactly `0` → bar width `0%`, label `0.00`.

### Sentiment Badge Colour Map

| Value | Border | Background | Text |
|---|---|---|---|
| positive | `border-green-500/20` | `bg-green-500/10` | `text-green-500` |
| negative | `border-red-500/20` | `bg-red-500/10` | `text-red-500` |
| neutral | — | `bg-muted` | `text-muted-foreground` |

## Component Prop Interface

```typescript
// SentimentEventsTable.svelte props
interface Props {
  events: unknown[];  // raw, unvalidated — schema filters internally
}
```

Using `unknown[]` (not `SentimentEvent[]`) at the prop boundary enforces that the organism is the sole validation point, not the caller.

## State

| Name | Rune | Type | Description |
|---|---|---|---|
| `validatedEvents` | `$derived` | `SentimentEvent[]` | Filtered, schema-valid events derived from `events` prop |
