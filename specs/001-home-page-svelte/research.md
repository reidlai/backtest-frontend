# Phase 0 Research: Enterprise AI Backtest Platform — Main Application Page

**Date**: 2026-05-18 | **Feature**: [spec.md](spec.md)

All NEEDS CLARIFICATION items from the technical context have been resolved. Decisions below are final for implementation.

---

## Decision 1: UI Component Library (Atoms)

**Decision**: shadcn-svelte v2 via CLI  
**Rationale**: Svelte 5 + TailwindCSS 4 compatible. CLI generates component source files into `src/lib/components/ui/`, directly matching the Atomic Design "Atoms" layer (FR-022). Components are owned by the project, enabling dark-theme customization without fighting an external API.  
**Install commands**:

```sh
pnpx shadcn-svelte@latest init
pnpx shadcn-svelte@latest add button card dialog input label select separator sonner table tabs textarea tooltip badge progress
```

`init` generates `components.json` at project root and `src/lib/utils.ts` with the `cn()` helper. Accept defaults during prompts (Style: Default, Base color: Slate, CSS variables: Yes).  
**Alternatives considered**: Skeleton UI (heavier, less composable), Melt UI (lower-level primitives requiring more manual assembly), custom from scratch (too slow given breadth of required components).

---

## Decision 2: Charting Library

**Decision**: LayerChart (latest) with D3 as peer dependency  
**Rationale**: Explicitly required by spec (FR-010, FR-012). Svelte-native, Svelte 5 compatible. Composable primitives (`Chart`, `Spline`, `Area`, `Bars`, `Tooltip`, `Axis`) make equity curves, drawdown charts, monthly heatmaps, and technical previews straightforward to implement with hover tooltip support.  
**Install commands**:

```sh
pnpm add layerchart d3
pnpm add -D @types/d3
```

**Components used per section**:

- Performance Result: `Chart` + `Spline` (equity curve), `Chart` + `Area` (drawdown), `Chart` + `Bars` (monthly heatmap), `Tooltip`
- Technical Screener: `Chart` + `Spline` or `CandlestickSeries` for interactive preview  
  **Alternatives considered**: Chart.js (not Svelte-native, requires wrapper boilerplate), Recharts (React only), ECharts (heavier bundle, imperative API).

---

## Decision 3: Drag-to-Reorder for Metric Tiles

**Decision**: Native HTML5 Drag & Drop API with Svelte 5 event handlers  
**Rationale**: FR-013 requires drag-to-reorder for metric tiles. The scope is a flat list of ~8–12 tiles within a single grid. Native HTML5 DnD handles this without any library dependency, avoiding Svelte 5 runes compatibility risk. Complexity of interaction does not justify a library.  
**Implementation pattern**:

```svelte
<!-- In PerformanceResultSection.svelte -->
let draggedIndex = $state<number | null>(null);

function ondragstart(e: DragEvent, index: number) {
  draggedIndex = index;
}
function ondragover(e: DragEvent) { e.preventDefault(); }
function ondrop(e: DragEvent, targetIndex: number) {
  if (draggedIndex === null || draggedIndex === targetIndex) return;
  const reordered = [...tiles];
  const [moved] = reordered.splice(draggedIndex, 1);
  reordered.splice(targetIndex, 0, moved);
  tiles = reordered;
  draggedIndex = null;
}
```

Each tile molecule receives `draggable="true"` and forwards the drag events to the organism.  
**Alternatives considered**: svelte-dnd-action (Svelte 5 runes support uncertain as of writing), @neodrag/svelte (individual dragging, not list reordering), sortablejs (heavier, imperative API).

---

## Decision 4: Internationalization — Adding zh-TW Locale

**Decision**: Extend existing Paraglide JS v2 setup; add `zh-TW` locale  
**Rationale**: Paraglide is already installed and fully wired (Vite plugin, `hooks.ts`, `hooks.server.ts`). Adding Traditional Chinese requires minimal changes: update `project.inlang/settings.json` and create `messages/zh-TW.json`. The Paraglide runtime is regenerated automatically by the Vite dev server.  
**Changes required**:

1. `project.inlang/settings.json`: add `"zh-TW"` to `locales` array
2. Create `messages/zh-TW.json` with all message keys translated
3. Run `pnpm dev` once to regenerate `src/lib/paraglide/` runtime  
   **Language switching mechanism**: Use `overrideLocale(locale)` from `$lib/paraglide/runtime` for client-side locale switching without URL navigation. This keeps the SPA on a single route while all `m.*` message functions return strings for the overridden locale.  
   **Locale identifiers**: `en` (base, existing), `zh-TW` (Traditional Chinese, new)  
   **Alternatives considered**: svelte-i18n (additional dependency, duplicates Paraglide), custom message store (more boilerplate, loses Paraglide's compile-time type safety).

---

## Decision 5: Global Session State

**Decision**: Svelte 5 module-level reactive state in `src/lib/state/app.svelte.ts`  
**Rationale**: Svelte 5 enables `$state` in `.svelte.ts` files at module level, producing shared reactive state without Svelte stores. This is the idiomatic Svelte 5 pattern for app-wide cross-component state and avoids store boilerplate.  
**State shape**:

```typescript
// src/lib/state/app.svelte.ts
export let activeSection = $state<SectionId>('dashboard');
export let currentLocale = $state<'en' | 'zh-TW'>('en');
```

Any component can import and mutate these directly.  
**Organism-level state**: Each organism keeps its own internal `$state` for form inputs, filter values, etc. Organisms are **never unmounted** (see Decision 6), so their `$state` naturally persists for the browser session.  
**Alternatives considered**: Svelte stores (outdated pattern in Svelte 5 runes projects), Context API (correct for subtree scoping but overkill for two global values), URL state (not applicable for a single-route SPA).

---

## Decision 6: Section Visibility and State Preservation

**Decision**: All 10 section organisms remain mounted; inactive sections hidden via `style:display="none"`  
**Rationale**: FR-005 requires per-section organism state (strategy text, filter values, backtest params) to persist when navigating away and back. If `{#if}` blocks are used, Svelte unmounts the component on hide, destroying `$state`. Keeping all organisms mounted and using CSS display toggling preserves all state at zero extra implementation cost.  
**Pattern in `+page.svelte`**:

```svelte
<div style:display={$activeSection === 'dashboard' ? 'block' : 'none'}>
	<DashboardSection />
</div>
<div style:display={$activeSection === 'strategy-builder' ? 'block' : 'none'}>
	<StrategyBuilderSection bind:this={strategyBuilderRef} />
</div>
<!-- ...one wrapper per section... -->
```

**Exception (FR-005)**: "New Strategy" and "New Backtest" actions call an exported `reset()` method on the relevant organism via `bind:this`, explicitly clearing that organism's `$state`.  
**Alternatives considered**: `{#if}` with state lifted to parent (requires passing all state as props — defeats Atomic Design organism encapsulation), Svelte `<svelte:component>` (still unmounts on switch).

---

## Decision 7: Dark Theme

**Decision**: Add `class="dark"` to `<html>` in `src/app.html`; no runtime toggle  
**Rationale**: FR-020 requires dark-only rendering with no user-facing toggle. Setting `class="dark"` on the root `<html>` element at build time activates all Tailwind `dark:` utilities globally for the entire document. No JavaScript, no conditional logic.  
**Change**: `src/app.html` — `<html lang="%paraglide.lang%" dir="%paraglide.dir%" class="dark">`  
shadcn-svelte's init base color "Slate" provides the deep navy/charcoal palette matching the prototype.

---

## Decision 8: Toast Notifications

**Decision**: Sonner via shadcn-svelte integration; 3-second auto-dismiss  
**Rationale**: shadcn-svelte includes a pre-built Sonner component matching the dark theme automatically. Covers all toast use cases in the spec: Save (FR-006), Simulate Re-run (FR-002), Backtest queued (FR-011), Export PDF coming soon (FR-018). Auto-dismiss at 3s satisfies "brief" requirement while giving sufficient read time.  
**Setup**: `pnpx shadcn-svelte@latest add sonner` → place `<Toaster />` in `src/routes/+layout.svelte` → call `toast.success('message')` / `toast.info('message')` from any organism.

---

## Decision 9: Section Transition Animation

**Decision**: Tailwind CSS `fade-in` animation (150ms) on section reveal  
**Rationale**: FR-005 mentions "brief entrance animation." A CSS opacity fade from 0→1 is the lightest possible animation: no JavaScript, no library, imperceptible to section transition timing (150ms << 300ms SC-002 threshold).  
**Implementation**: Apply `animate-in fade-in duration-150` (tailwindcss-animate, included with shadcn-svelte) to each section wrapper div when it becomes visible.

---

## Decision 10: Export JSON (Empty State Behavior)

**Decision**: Always export; use empty/default values when no strategy has been parsed  
**Rationale**: FR-006 requires Export JSON to download the current strategy configuration. Disabling the button conditionally adds UX complexity and a new edge case not specified. Exporting a template JSON with default empty values is consistent, always functional, and sets user expectation about the export format.  
**Implementation**: `StrategyBuilderSection` exports a `getStrategyConfig()` function; `TopBar` calls it on Export JSON click and triggers a `Blob` download via programmatic `<a>` click.

---

## Decision 11: TypeScript Strict Mode & Svelte 5 Runes

**Decision**: Full TypeScript strict mode; Svelte 5 runes-only (no legacy stores or `$:` reactive statements)  
**Rationale**: The project's `svelte.config.js` already enables `runes: true` project-wide. TypeScript 6 is installed. Using only runes patterns (`$state`, `$derived`, `$effect`, `$props`) ensures consistency and avoids hybrid-mode confusion.  
**Key patterns**:

- Props: `let { label, value }: Props = $props()`
- Internal state: `let count = $state(0)`
- Derived: `let doubled = $derived(count * 2)`
- Side effects: `$effect(() => { /* reactive */ })`
- Bindable refs for `reset()` calls: `bind:this={ref}` on organism components
