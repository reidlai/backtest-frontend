# Implementation Plan: Market Regime Page Organisms

**Branch**: `010-market-regime-organisms` | **Date**: 2026-05-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/010-market-regime-organisms/spec.md`

## Summary

Extract the Market Environment Summary panel and the Regime Cards grid from the Market Regime page (`src/routes/market-regime/+page.svelte`) into two dedicated organism components — `MarketEnvironmentSummary.svelte` and `RegimeCardsGrid.svelte` — each backed by a Zod schema in `src/lib/schemas/`. The page becomes a thin composition layer with no visual changes.

## Technical Context

**Language/Version**: TypeScript (SvelteKit, Svelte 5 runes)

**Primary Dependencies**: Zod (schema validation), `$lib/schemas` (existing schema index), `$lib/components/molecules/RegimeCard` (consumed by RegimeCardsGrid)

**Storage**: N/A

**Testing**: Vitest (unit), Storybook (component isolation)

**Target Platform**: Web browser (SvelteKit SSR/CSR)

**Project Type**: Frontend web application (SvelteKit)

**Performance Goals**: No new targets — UI refactor preserves existing render performance

**Constraints**: Zero visual regressions; no new prop drilling or state management complexity

**Scale/Scope**: 2 new organism components, 2 new schema files, 1 updated schema index, 1 updated page

## Constitution Check

| Gate | Rule | Check | Status |
| ---- | ---- | ----- | ------ |
| Branch name follows `###-feature-name` format | Rule 1 | `010-market-regime-organisms` matches `[0-9]{3}-[a-z_-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios for both organisms | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | No Docker changes in this feature | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Tasks will include ci-sca, ci-format-lint, ci-secrets-scan, ci-unit-tests | ✅ |
| Required directory structure included | Rule 9 | No new directories required; organisms/ and schemas/ already exist | N/A |
| UI components follow Atomic Design + Storybook (if frontend feature) | Rule 12 | New organisms to be verified in Storybook before backend work; Zod schemas defined post-Storybook | ✅ |
| Virtual module structure respected (if adding new module) | Rule 11 | No new virtual module; working within existing `src/lib/` | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | No secrets involved | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/010-market-regime-organisms/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code Changes

```text
src/
├── lib/
│   ├── schemas/
│   │   ├── market-environment-summary.schema.ts   ← NEW
│   │   ├── regime-cards-grid.schema.ts            ← NEW
│   │   └── index.ts                               ← UPDATED (2 new exports)
│   └── components/
│       └── organisms/
│           ├── MarketEnvironmentSummary.svelte    ← NEW
│           └── RegimeCardsGrid.svelte             ← NEW
└── routes/
    └── market-regime/
        └── +page.svelte                           ← UPDATED (uses 2 organisms)
```

## Implementation Phases

### Phase 1: Zod Schemas

1. Create `src/lib/schemas/market-environment-summary.schema.ts`
   - Export `MarketEnvironmentSummarySchema` with `summary: z.string().default('')`
2. Create `src/lib/schemas/regime-cards-grid.schema.ts`
   - Export `RegimeCardsGridSchema` with `regimes: z.array(MarketRegimeSchema).default([])`
3. Update `src/lib/schemas/index.ts` — add two export lines

### Phase 2: Organism Components

4. Create `src/lib/components/organisms/MarketEnvironmentSummary.svelte`
   - Import and use `MarketEnvironmentSummarySchema`
   - State: `let state = $state<z.infer<typeof MarketEnvironmentSummarySchema>>(MarketEnvironmentSummarySchema.parse({}))`
   - Accept `summary` prop and assign to state
   - Render: AI badge + heading + styled summary paragraph (exact markup from current page)

5. Create `src/lib/components/organisms/RegimeCardsGrid.svelte`
   - Import and use `RegimeCardsGridSchema` and `RegimeCard` molecule
   - State: `let state = $state<z.infer<typeof RegimeCardsGridSchema>>(RegimeCardsGridSchema.parse({}))`
   - Accept `regimes` prop and assign to state
   - Render: responsive grid of `RegimeCard` molecules; show "No regime data available" when `state.regimes` is empty

### Phase 3: Page Refactor

6. Update `src/routes/market-regime/+page.svelte`
   - Import `MarketEnvironmentSummary` and `RegimeCardsGrid`
   - Replace inline divs with the two organism components
   - Pass `aiSummary` to `MarketEnvironmentSummary` and `sampleMarketRegimes` to `RegimeCardsGrid`

### Phase 4: CI Verification

7. Run `pnpm check` (type check)
8. Run `pnpm lint` (format + lint)
9. Verify the page renders correctly in the dev server (visual regression check)
