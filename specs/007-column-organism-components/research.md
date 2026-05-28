# Research: Backtest Engine Column Organism Components

**Phase**: 0 — Research & Unknowns
**Date**: 2026-05-28

## Decision 1: Schema Split Strategy

**Decision**: Create three new schema files under `src/lib/schemas/`, each owning the Zod definitions for its column's fields. Shared enum schemas (`BacktestModeSchema`, `OrderTypeSchema`) move to the schema file of the organism that primarily defines them. Remove `backtest-state.schema.ts` entirely.

**Rationale**: The existing per-organism schema pattern (one schema file per organism, named `<kebab-case-organism>.schema.ts`) is consistently used across all 16 organism schemas in the project. Splitting `BacktestStateSchema` into three files aligns with this convention. Moving `BacktestModeSchema` to `universe-capital-config.schema.ts` and `OrderTypeSchema` to `order-types-config.schema.ts` keeps each enum co-located with its primary consumer and avoids a shared-enum barrel that would create an additional dependency layer.

**Schema assignments**:
- `universe-capital-config.schema.ts` → `BacktestModeSchema`, `UniverseCapitalConfigSchema`
- `schedule-execution-config.schema.ts` → `ScheduleExecutionConfigSchema`
- `order-types-config.schema.ts` → `OrderTypeSchema`, `OrderTypesConfigSchema`

**Alternatives considered**:
- Keep `backtest-state.schema.ts` for shared enums, create 3 new files: Rejected — creates a 4-file dependency split and keeps the original file alive as a partial artifact. Cleaner to remove it fully.
- Single shared `backtest-enums.schema.ts` for enum types: Rejected — over-engineering for only two enums; direct cross-schema imports are already used elsewhere in the project.

---

## Decision 2: State Singleton File Naming

**Decision**: Name state singleton files `<kebab-case>.svelte.ts` matching their organism name: `universe-capital-config.svelte.ts`, `schedule-execution-config.svelte.ts`, `order-types-config.svelte.ts`. Export singleton instances as `universeCapitalConfigState`, `scheduleExecutionConfigState`, `orderTypesConfigState`.

**Rationale**: The existing state file naming pattern (`app.svelte.ts`, `backtest.svelte.ts`, `strategy.svelte.ts`) uses `<topic>.svelte.ts`. Aligning with the organism name (rather than a shorter topic name) keeps the state/component pairing unambiguous as the codebase grows. The exported singleton instance name follows camelCase of the file's kebab-case name.

**Class names**: `UniverseCapitalConfigState`, `ScheduleExecutionConfigState`, `OrderTypesConfigState`.

**Alternatives considered**:
- Shorter names (`universe.svelte.ts`, `schedule.svelte.ts`, `orders.svelte.ts`): Less precise — could be confused with domain entities rather than UI organism state.

---

## Decision 3: `SvelteSet` Initialization in `OrderTypesConfigState`

**Decision**: Initialize `selectedOrderTypes` as `new SvelteSet<OrderType>(OrderTypesConfigSchema.parse({}).selectedOrderTypes as OrderType[])`, matching the pattern in the existing `BacktestState`.

**Rationale**: `SvelteSet` is Svelte 5's reactive equivalent of `Set`. The existing `BacktestState` already demonstrates the initialization pattern: parse defaults from the Zod schema (which returns a plain array), cast to the correct type, and pass to `SvelteSet`. The `reset()` method clears and repopulates the set from a fresh `Schema.parse({})` call, mirroring the existing `backtestState.reset()` implementation.

**Alternatives considered**:
- Store `selectedOrderTypes` as a reactive `$state<OrderType[]>` array: Rejected — the existing codebase uses `SvelteSet` for this field (`.has()`, `.add()`, `.delete()` semantics); changing to an array would require updating the checkbox binding logic in the organism.

---

## Decision 4: `onRun` Prop Pattern in Svelte 5

**Decision**: Use Svelte 5 `$props()` destructuring with a default no-op to accept the `onRun` callback in `OrderTypesConfig.svelte`:

```typescript
let { onRun = () => {} }: { onRun?: () => void } = $props();
```

**Rationale**: Svelte 5 replaces `export let` with `$props()` rune destructuring. Providing a default no-op (`= () => {}`) satisfies FR-005's requirement that the organism does not own run coordination while also handling the edge case (FR edge case: "If `onRun` prop is not provided, the Run Backtest button should be disabled or render a no-op") without requiring the button to be conditionally disabled. A no-op is simpler and keeps the organism self-contained for Storybook rendering without a required prop.

**Alternatives considered**:
- Make `onRun` required (no default): Rejected — would break Storybook stories that render the organism in isolation without a page-level handler.
- Disable the button when `onRun` is not provided: Valid alternative, but adds conditional rendering complexity for no behavioral benefit in the page context where `onRun` is always provided.

---

## Decision 5: `$effect` Placement for `appState.backtestPrefillSymbol`

**Decision**: The `$effect` that writes `appState.backtestPrefillSymbol` to the universe field stays in `+page.svelte`, updated to reference `universeCapitalConfigState.universe`:

```typescript
$effect(() => {
    if (appState.backtestPrefillSymbol) {
        universeCapitalConfigState.universe = appState.backtestPrefillSymbol;
    }
});
```

**Rationale**: Confirmed by clarification Q4 — the page owns all cross-state coordination. The `UniverseCapitalConfig` organism remains unaware of `appState`, keeping it independently renderable in Storybook and test harnesses without `appState` context.

**Alternatives considered**:
- Move `$effect` inside `UniverseCapitalConfig` organism: Rejected in clarification — violates the organism's independence guarantee.

---

## Decision 6: BDD Feature File

**Decision**: Create `features/column-organism-components.feature` with Gherkin scenarios covering all three organism user stories and the key cross-organism behaviors (reset, prefill effect, run callback).

**Rationale**: Constitution Rule 6 requires all BDD feature files in `./features/` with Given/When/Then scenarios. Rule 8 requires AI agents to generate or update BDD feature files for any new behaviors introduced. This feature introduces 3 new organisms with distinct behavioral contracts that require BDD coverage.

**Tags**: `@organisms`, `@backtest-engine`, `@smoke`

---

## Decision 7: Backward Compatibility of `BacktestStateSchema` Exports

**Decision**: Remove `BacktestStateSchema`, `BacktestModeSchema`, and `OrderTypeSchema` from `src/lib/schemas/index.ts` and replace with the new per-organism schema exports. Add `BacktestModeSchema` and `OrderTypeSchema` re-exports in the new schema files' barrel entries.

**Rationale**: Grep confirms `BacktestStateSchema` is only imported from `src/lib/state/backtest.svelte.ts` (which is being removed) and `src/lib/schemas/index.ts`. `BacktestModeSchema` and `OrderTypeSchema` are imported from `$lib/schemas` in `+page.svelte`. After the refactor, they will be imported from the new schema files via the updated barrel. No external consumers outside the project reference these exports.
