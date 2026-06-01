# Implementation Plan: Trade Lot Table Organism

**Branch**: `014-trade-lot-table-organism` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/014-trade-lot-table-organism/spec.md`

## Summary

Extract the inline trades table block from `src/routes/trade-lot/+page.svelte` into a self-contained SvelteKit organism component (`TradeLotTable.svelte`). The organism accepts a list of raw trade records as an `unknown[]` prop, reactively derives a validated list via the existing `TradeRecordSchema` (already in `src/lib/schemas/trade-record.schema.ts`), and renders the 14-column table with direction and PnL color styling. An empty-state card with navigation button is shown when no valid trades remain. The parent page is reduced to a single organism tag.

## Technical Context

**Language/Version**: TypeScript 5 / SvelteKit 5 (Svelte 5 runes)

**Primary Dependencies**: Zod (schema already defined as `TradeRecordSchema`), shadcn-svelte Table + Button components, `$app/navigation` goto

**Storage**: N/A

**Testing**: Vitest (unit), Playwright (e2e), Cucumber/Gherkin BDD feature files in `features/`

**Target Platform**: Web browser (SvelteKit SSR + client hydration)

**Project Type**: Frontend web application (SvelteKit)

**Performance Goals**: Validate and render up to 200 trade records in < 50 ms

**Constraints**: No new npm packages; use existing `TradeRecordSchema` from `$lib/schemas`; Svelte 5 `$derived` rune for reactive validation; follow `SentimentEventsTable` pattern exactly

**Scale/Scope**: Single page, sample trades dataset; schema handles any future volume

## Constitution Check

| Gate | Rule | Check | Status |
|---|---|---|---|
| Branch name follows `###-feature-name` format | Rule 1 | `014-trade-lot-table-organism` matches `[0-9]{3}-[a-z_-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios | ✅ |
| Docker image uses distroless base | Rule 3 | No Docker changes in this feature | N/A |
| CI gates covered by tasks | Rule 7 | Existing CI workflow covers SCA, lint, secrets scan, unit tests | ✅ |
| Required directory structure included | Rule 9 | No new required directories introduced | N/A |
| UI components follow Atomic Design + Storybook | Rule 12 | Storybook story task planned before implementation tasks | ✅ |
| Virtual module structure respected | Rule 11 | No new module added; files go into existing `src/lib/` | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | No secrets involved | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/014-trade-lot-table-organism/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── schemas/
│   │   ├── trade-record.schema.ts         # EXISTING — TradeRecordSchema (no changes needed)
│   │   └── __tests__/
│   │       └── trade-record.schema.test.ts  # NEW — schema validation unit tests
│   └── components/
│       └── organisms/
│           └── TradeLotTable.svelte        # NEW — organism component
├── routes/
│   └── trade-lot/
│       └── +page.svelte                   # UPDATE — replace inline table with organism tag
├── stories/
│   └── TradeLotTable.stories.svelte       # NEW — Storybook stories

features/
└── trade-lot-table-organism.feature       # NEW — BDD scenarios
```
