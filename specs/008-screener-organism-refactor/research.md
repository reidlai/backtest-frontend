# Research: Fundamental Screener Organism Refactor

**Branch**: `008-screener-organism-refactor` | **Date**: 2026-05-29

## Resolved Decisions

### 1. SvelteKit Snapshot Re-export Pattern

**Decision**: Filter organism exports a `snapshot` constant; page re-exports it.

**Finding**: SvelteKit's snapshot API requires `export const snapshot: Snapshot` on the `+page.svelte` module. Svelte module scripts (`<script module>`) support re-exporting constants from imported modules. The pattern is:

```ts
// In ScreenerFilterPanel.svelte (script module block)
export const snapshot: Snapshot = { capture, restore };

// In +page.svelte (script module block)
export { snapshot } from '$lib/components/organisms/ScreenerFilterPanel.svelte';
```

This satisfies SvelteKit's requirement (snapshot is on the page module) while keeping the implementation in the organism that owns the state.

**Alternatives considered**: Page owns snapshot with bindable props — rejected per spec clarification.

---

### 2. Svelte 5 Runes — Internal State Pattern

**Decision**: Use `$state()` runes inside the organism for filter state; no `$bindable()`.

**Finding**: Existing organisms (`LiveControlForm.svelte`, `OrderTypesConfig.svelte`) use `let state = $state<T>(Schema.parse({}))` to initialise state from a Zod schema default. The filter organism follows the same pattern:

```ts
let state = $state<FundamentalScreenerState>(FundamentalScreenerSchema.parse({}));
```

Since state is fully internal, no `$props()` or `$bindable()` declarations are needed on the filter organism.

---

### 3. Callback Prop Pattern for Backtest Action

**Decision**: Result organism accepts `onBacktest: (symbol: string) => void` as a prop.

**Finding**: `QuickActionsPanel.svelte` and `ScreenerResultRow.svelte` already use `onBacktest` as a callback prop name. The result organism declares:

```ts
let { onBacktest }: { onBacktest: (symbol: string) => void } = $props();
```

The page passes `handleBacktest` which calls `appState.backtestPrefillSymbol = symbol; goto('/backtest-engine')`.

---

### 4. Existing Schema Reuse

**Decision**: Create `screener-filter-panel.schema.ts` that re-exports `FundamentalScreenerSchema` under the canonical organism name.

**Finding**: `FundamentalScreenerSchema` already defines all four fields with correct defaults. A thin wrapper/alias schema file follows the project convention (one schema file per organism). The snapshot `restore` continues to use `FundamentalScreenerSchema.safeParse(value)`.

---

### 5. Storybook Story Pattern

**Decision**: Stories live in `src/stories/` using `@storybook/addon-svelte-csf` CSF format.

**Finding**: All existing organism stories (`QuickActionsPanel.stories.svelte`, `OrderTypesConfig.stories.svelte`) use `defineMeta` from `@storybook/addon-svelte-csf`. Navigation stubs (`nav.goto = () => {}`) are applied at the module level for organisms that trigger navigation. The result organism story needs this stub; the filter organism story does not.
