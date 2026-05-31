# Implementation Plan: Technical Indicator Page Two-Column Layout

**Branch**: `012-technical-indicator-layout` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-technical-indicator-layout/spec.md`

## Summary

Create the `src/routes/technical-indicator` SvelteKit route with a responsive two-column layout. The left column hosts the `IndicatorSelectionPanel` organism (multi-select indicator toggle buttons) and `ChartPatternSelectionPanel` organism (single-select chart pattern toggle buttons). The right column hosts the `PatternPreviewPanel` organism, which renders mock OHLCV data as a layerchart chart with all selected indicator Spline overlays and a selected chart pattern annotation.

Each selection organism owns its own `$state` internally (Constitution Rule 12). The page holds mirror copies updated via `onchange` callbacks, used only to feed `PatternPreviewPanel` and the SvelteKit snapshot. A `snapshotKey` forces organism remount on snapshot restore so organisms re-initialize from the correct seed values.

## Technical Context

**Language/Version**: TypeScript 5 / Svelte 5 / SvelteKit 2

**Primary Dependencies**:
- `layerchart` — Chart, Spline, Axis, Tooltip (chart rendering)
- `shadcn-svelte` — Button, Select UI primitives
- `zod` — Schema validation for organism props and snapshot restore
- `@inlang/paraglide-sveltekit` — i18n message catalogue
- `d3` — `scaleTime` for x-axis

**Storage**: None — all state is organism-scoped; snapshot via SvelteKit session storage

**Testing**: Vitest (unit), Playwright (e2e), Cucumber/Gherkin BDD (`features/technical-indicator-layout.feature`)

**Target Platform**: Web browser (SvelteKit SSR + client hydration), Node.js adapter

**Performance Goals**: Selection → preview update < 300ms (client-side reactive state, no network)

**Constraints**:
- Mock OHLCV data only — no live API calls in this feature
- Max 7 simultaneous indicator overlays (colour palette limit)
- Organism-local state mandatory per Constitution Rule 12

**Scale/Scope**: Single page, 3 organism components, 4 Zod schemas, 1 mock data module

## Constitution Check

| Gate | Rule | Check | Status |
|---|---|---|---|
| Branch name follows `###-feature-name` format | Rule 1 | `012-technical-indicator-layout` | ✅ |
| BDD acceptance criteria defined in spec before plan | Rule 6 | `features/technical-indicator-layout.feature` — 9 `@smoke` scenarios | ✅ |
| Docker image uses distroless base | Rule 3 | Frontend-only feature — no new Dockerfile | N/A |
| CI gates covered by tasks | Rule 7 | Existing `ci.yaml` covers all CI gates | ✅ |
| Required directories present | Rule 9 | `features/` populated; `deploy/docker/` pre-existing | ✅ |
| UI components follow Atomic Design + Storybook | Rule 12 | Storybook stories precede schemas; **organisms own their `$state`** | ✅ |
| Virtual module structure respected | Rule 11 | SvelteKit `src/` — no new module | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | Mock data only | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/012-technical-indicator-layout/
├── plan.md          ← this file
├── research.md      ← Phase 0 output
├── data-model.md    ← Phase 1 output
├── quickstart.md    ← Phase 1 output
├── tasks.md         ← all 28 tasks ✅
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── routes/
│   └── technical-indicator/
│       └── +page.svelte          ← mirror copies + snapshotKey; no business state
├── lib/
│   ├── components/
│   │   └── organisms/
│   │       ├── IndicatorSelectionPanel.svelte    ← owns selectedIndicators $state
│   │       ├── ChartPatternSelectionPanel.svelte ← owns selectedPattern $state
│   │       └── PatternPreviewPanel.svelte        ← stateless; receives props
│   ├── data/
│   │   └── mock-ohlcv.ts
│   └── schemas/
│       ├── ohlcv-point.schema.ts
│       ├── indicator-selection-panel.schema.ts
│       ├── chart-pattern-selection-panel.schema.ts
│       ├── pattern-preview-panel.schema.ts
│       └── index.ts
├── stories/
│   ├── IndicatorSelectionPanel.stories.svelte
│   ├── ChartPatternSelectionPanel.stories.svelte
│   └── PatternPreviewPanel.stories.svelte
features/
└── technical-indicator-layout.feature
messages/
└── en.json   ← +5 i18n keys
```

**Structure Decision**: Single SvelteKit project (`src/`) — frontend-only feature.

## Complexity Tracking

No constitution violations — no complexity justification required.
