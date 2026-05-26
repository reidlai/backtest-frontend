# Research: Snapshot State Recovery

**Branch**: `006-snapshot-state-recovery` | **Date**: 2026-05-26

## Decision 1: SvelteKit Snapshot API for `+layout.svelte`

**Decision**: Use `export const snapshot` in `+layout.svelte` for AIChatPanel state, supplemented by `export const snapshot` in each `+page.svelte` for page-local state.

**Rationale**: SvelteKit's snapshot API is supported in both `+page.svelte` and `+layout.svelte` files. For the root `+layout.svelte` (which is never remounted during client-side navigation because all routes share it), `capture()` is called on full page unload (hard refresh / F5) and `restore()` is called on re-initialization when sessionStorage contains a prior snapshot. This makes the layout snapshot ideal for hard-refresh recovery of the global chat sidebar, and serves as forward-looking infrastructure for future child layouts that will remount on navigation. Page snapshots (`capture`/`restore`) are triggered on every client-side navigation away from and back to a given route.

**Alternatives considered**:
- Storing chat state in a global `$state` module store (rejected — module stores survive client-side navigation but are wiped on hard refresh, which is exactly the scenario the layout snapshot addresses)
- Custom sessionStorage writes in `onMount`/`onDestroy` (rejected — more code, bypasses SvelteKit's built-in snapshot lifecycle and Zod validation integration)

---

## Decision 2: Svelte 5 `$bindable()` Prop Pattern for State Bubbling

**Decision**: Each organism exposes snapshot-relevant state fields as individual `$bindable()` props. Intermediate container components (AIReviewSidebar) declare the same props as `$bindable()` and pass them through with `bind:`. Parent pages/layout declare the matching `$state` variables and own the snapshot.

**Rationale**: Svelte 5's `$bindable()` creates a two-way reactive binding between a child prop and a parent state variable. This is the idiomatic Svelte 5 approach for lifting state while keeping the component's internal behavior unchanged. The binding chain `AIChatPanel ↔ AIReviewSidebar ↔ +layout.svelte` propagates mutations both up (from component interaction) and down (from snapshot restore) without additional event dispatching.

**Implementation pattern**:
```svelte
<!-- AIChatPanel.svelte -->
let { messages = $bindable([]), chatInput = $bindable('') } = $props();

<!-- AIReviewSidebar.svelte -->
let { messages = $bindable([]), chatInput = $bindable('') } = $props();
<!-- template: -->
<AIChatPanel bind:messages bind:chatInput />

<!-- +layout.svelte -->
let messages = $state([]);
let chatInput = $state('');
<!-- template: -->
<AIReviewSidebar bind:messages bind:chatInput />
<!-- snapshot: -->
export const snapshot = {
  capture: () => ({ messages: messages.slice(-50), chatInput }),
  restore: (v) => { /* Zod parse, then assign */ }
};
```

**Alternatives considered**:
- Svelte 5 context API (`setContext`/`getContext`) for sharing state without prop threading (rejected — context is reactive but one-directional; snapshot capture requires the parent to own the state reference, which context does not guarantee)
- A shared reactive store module (rejected — stores survive navigation and would not be restored by the snapshot API, defeating the purpose)

---

## Decision 3: `Set<string>` Serialization at Snapshot Boundary

**Decision**: `selectedPatterns` stays as `Set<string>` in the Technical Screener's component state. The `snapshot.capture` function converts it to `Array<string>` for JSON serialization; `snapshot.restore` converts the validated array back to a `Set<string>` before assigning.

**Rationale**: `Set` objects serialize to `{}` under `JSON.stringify`, silently losing all data. Converting at the snapshot boundary (not the component level) keeps the component's `togglePattern` logic unchanged and avoids changing the runtime type used throughout the template (`selectedPatterns.has(pattern)`, `selectedPatterns.delete(pattern)`, etc.).

**Implementation pattern**:
```typescript
export const snapshot = {
  capture: () => ({
    selectedPatterns: [...selectedPatterns],  // Set → Array
    trendIndicator,
    momentumIndicator
  }),
  restore: (v: unknown) => {
    const parsed = TechnicalScreenerSchema.safeParse(v);
    if (!parsed.success) return;
    selectedPatterns = new Set(parsed.data.selectedPatterns);  // Array → Set
    trendIndicator = parsed.data.trendIndicator;
    momentumIndicator = parsed.data.momentumIndicator;
  }
};
```

**Alternatives considered**:
- Change `selectedPatterns` type to `Array<string>` throughout (rejected — requires changing `togglePattern` logic and all `has`/`delete` calls; more invasive, no benefit)
- Store `selectedPatterns` as a plain object map `{ [key: string]: boolean }` (rejected — less idiomatic, would require changing the BDD test assertions)

---

## Decision 4: `validationError` Excluded from AIResearchBox Snapshot

**Decision**: Only `aiText: string` is snapshotted for `AIResearchBox`. `validationError: boolean` is kept as purely local state, always initialized to `false`.

**Rationale**: Restoring `validationError: true` from a prior snapshot would display a validation error on the textarea without any user action on the current visit — surprising and potentially confusing UX. The error is triggered by user interaction (clicking "Convert to Strategy" with an empty textarea), not by page load. Excluding it means the component behaves identically on first load and on snapshot restore.

**Implementation pattern**:
```svelte
<!-- AIResearchBox.svelte -->
let { aiText = $bindable('') } = $props();
let validationError = $state(false);  // not exposed, not snapshotted

<!-- research-workbench/+page.svelte -->
let aiText = $state('');
<AIResearchBox bind:aiText />
export const snapshot = {
  capture: () => ({ aiText }),
  restore: (v) => { const r = AIResearchBoxSnapshotSchema.safeParse(v); if (r.success) aiText = r.data.aiText; }
};
```

A lightweight snapshot schema (`AIResearchBoxSnapshotSchema`) with only `{ aiText: z.string().default('') }` is used for validation — distinct from the full `AIResearchBoxSchema` which includes `validationError`.

**Alternatives considered**:
- Always restore `validationError: false` explicitly (accepted as part of the decision — `$state(false)` initialization achieves this without needing snapshot handling)
- Include `validationError` with forced restore to `false` (rejected — unnecessary complexity; the field simply isn't in the snapshot)

---

## Decision 5: Zod Snapshot Schema vs. Organism Schema

**Decision**: Two new dedicated snapshot schemas are created in `src/lib/schemas/`:
- `FundamentalScreenerSchema` — covers all four filter/selector fields captured by the Fundamental Screener snapshot
- `TechnicalScreenerSchema` — covers `selectedPatterns: z.array(z.string())`, `trendIndicator: z.string()`, `momentumIndicator: z.string()`

A lightweight `AIResearchBoxSnapshotSchema` is defined inline in the page (not exported to the schema barrel) since it is a strict subset of the existing `AIResearchBoxSchema`.

The existing `AIChatPanelSchema` is reused directly for the layout snapshot validation.

**Rationale**: New schemas are needed where none exist (Fundamental Screener, Technical Screener). Creating them in `src/lib/schemas/` and exporting via the barrel aligns with Constitution Rule 12 (Zod schema creation follows Storybook verification). The `AIResearchBoxSnapshotSchema` is intentionally kept inline (not barrel-exported) because it is a narrowing of an existing schema rather than a new standalone contract.

**Alternatives considered**:
- Reuse existing organism schemas for all snapshot validation (rejected — `AIResearchBoxSchema` includes `validationError: boolean` which must not be snapshotted; reusing it would require manually stripping the field rather than cleanly separating concerns)
- Create a single unified `SnapshotSchema` covering all targets (rejected — over-coupling unrelated pages; would require conditional field access during restore)
