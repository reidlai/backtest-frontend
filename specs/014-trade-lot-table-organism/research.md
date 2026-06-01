# Research: Trade Lot Table Organism

**Feature**: `014-trade-lot-table-organism` | **Date**: 2026-06-01

## Decisions

### 1. Schema validation approach

**Decision**: Use `TradeRecordSchema.safeParse(e)` inside a `$derived` `flatMap` — identical to the pattern in `SentimentEventsTable.svelte`.

**Rationale**: `safeParse` never throws; invalid entries are silently excluded with a `console.warn`. The `$derived` rune ensures the validated list updates reactively whenever the `trades` prop changes. This pattern is already proven in the codebase.

**Alternatives considered**:
- `parse` (throws): rejected — unhandled errors would crash the component.
- Pre-validation in parent page: rejected — couples schema logic to the route, defeating the organism's encapsulation goal.

---

### 2. Empty-state navigation

**Decision**: Use `goto('/backtest-engine')` from `$app/navigation` directly inside the organism.

**Rationale**: The existing inline implementation uses `goto` in the same location. Keeping the same approach avoids adding a callback prop that the parent doesn't need to customize.

**Alternatives considered**:
- Callback prop `onGoToEngine`: would make the organism more reusable across contexts, but the spec explicitly lists the navigation target as fixed (`/backtest-engine`), and no other use case is planned.

---

### 3. Component file location and naming

**Decision**: `src/lib/components/organisms/TradeLotTable.svelte`

**Rationale**: All organisms live at `src/lib/components/organisms/`. The name `TradeLotTable` mirrors the route name (`/trade-lot`) and describes the component's role (table of trade-lot records).

**Alternatives considered**:
- `TradesTable.svelte`: too generic; could conflict with other trade tables in future.
- `TradeRecordTable.svelte`: matches the schema name but not the route; `TradeLotTable` better aligns with page context.

---

### 4. Storybook story structure

**Decision**: Three stories — `Default` (full sample data), `Empty` (no records), `WithInvalidRecords` (mix of valid + invalid).

**Rationale**: Mirrors the three-story pattern used in `SentimentEventsTable.stories.svelte`. Covers all acceptance scenarios visually.

---

### 5. No new dependencies

**Decision**: All required UI primitives (`Table.*`, `Button`) are already installed via shadcn-svelte; `zod` is already a dependency; `$app/navigation` is a SvelteKit built-in.

**Rationale**: Adding zero new packages keeps the bundle stable and avoids SCA review overhead.
