# Research: Technical Indicator Page Two-Column Layout

**Branch**: `012-technical-indicator-layout` | **Date**: 2026-05-31

## Decisions

### 1. Chart Rendering Library

**Decision**: `layerchart` (already in project)

**Rationale**: Already used in `technical-screener/+page.svelte` with `Chart`, `Spline`, `Axis`, `Tooltip`. Using the same library maintains consistency, avoids a new dependency, and leverages established patterns in the codebase.

**Alternatives considered**:
- `recharts` / `chart.js` — would introduce a new dependency with no benefit over the existing layerchart integration.

---

### 2. Multi-Select vs Single-Select for Indicators

**Decision**: Multi-select — all selected indicators overlaid simultaneously on the chart.

**Rationale**: Users specified they want to compare multiple indicators at once (RSI + MACD together). The colour palette (7 distinct Tailwind stroke colours) provides sufficient visual separation. `SvelteSet` / `string[]` state is sufficient.

**Alternatives considered**:
- Single-select — simpler but rejected because user explicitly requested multi-select in clarification Q2.

---

### 3. Chart Pattern Annotation Approach

**Decision**: Vertical `Spline` segments with dashed stroke at deterministic positions (25%, 50%, 75% of the dataset) as boundary markers.

**Rationale**: layerchart does not expose a `Rule` component in its public API at the version used by this project. Using narrow `Spline` segments with `[stroke-dasharray:4_3]` achieves the same visual result (vertical reference lines) using only supported primitives.

**Alternatives considered**:
- `Rule` component — not available in the installed layerchart version.
- SVG `<line>` elements via `{@html}` — possible but bypasses layerchart's coordinate system; rejected for maintainability.

---

### 4. Mock Data vs Live API

**Decision**: Static mock OHLCV data (`src/lib/data/mock-ohlcv.ts`) — 90 candles, deterministic random walk from `2024-01-02`.

**Rationale**: User clarification Q4 explicitly deferred API integration to a future feature. Mock data keeps this feature self-contained, testable offline, and avoids API key management.

**Alternatives considered**:
- Live market data API — explicitly deferred.
- Existing `technical-screener` inline mock (60 points) — reused pattern but created a dedicated module for 90 candles to give more chart context.

---

### 5. State Management Scope

**Decision**: Organism-local `$state` — each selection organism owns its own state. The page holds mirror copies updated via `onchange` callbacks; a `snapshotKey` forces remount on snapshot restore.

**Rationale**: Constitution Rule 12 mandates organism-level state. `IndicatorSelectionPanel` owns `selectedIndicators` and `ChartPatternSelectionPanel` owns `selectedPattern`. The page mirror copies are the minimum required to feed `PatternPreviewPanel` (which needs both values) and the SvelteKit snapshot. No global store required.

**Alternatives considered**:
- Page-level `$state` with `$bindable` — initial implementation; rejected as a constitution Rule 12 violation.
- Svelte store (writable) — avoids the remount pattern but introduces global coupling; rejected.
- `$bindable` with organisms as source of truth — not possible in Svelte 5: `$bindable` makes the binding target the source of truth, which is the parent (page).

---

### 6. Responsive Layout Strategy

**Decision**: Tailwind `grid gap-6 lg:grid-cols-3` — left `lg:col-span-1`, right `lg:col-span-2`.

**Rationale**: Exactly matches the pattern used in `technical-screener/+page.svelte`, ensuring visual and behavioural consistency across sibling routes.

**Alternatives considered**:
- Flexbox layout — less explicit column width control; rejected for consistency.
- CSS Grid custom properties — unnecessary complexity.
