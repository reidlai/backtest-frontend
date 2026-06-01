# Implementation Plan: Sentiment Events Table Organism

**Branch**: `013-sentiment-events-organism` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/013-sentiment-events-organism/spec.md`

## Summary

Extract the inline sentiment events table block from `src/routes/sentiment-events/+page.svelte` into a self-contained SvelteKit organism component (`SentimentEventsTable.svelte`). The organism accepts a list of raw events as a prop, reactively derives a validated list via the existing `SentimentEventSchema` (already in `$lib/schemas/sentiment-event.schema.ts`), and renders the table with badge and score-bar styling. An empty-state row is shown when no valid events remain. The parent page is reduced to a single organism tag.

## Technical Context

**Language/Version**: TypeScript 5 / SvelteKit 5 (Svelte 5 runes)

**Primary Dependencies**: Zod (schema already defined), shadcn-svelte Table + Badge components, `cn` utility

**Storage**: N/A

**Testing**: Vitest (unit), Playwright (e2e), Cucumber/Gherkin BDD feature files in `features/`

**Target Platform**: Web browser (SvelteKit SSR + client hydration)

**Project Type**: Frontend web application (SvelteKit)

**Performance Goals**: Validate and render 100 events in < 50 ms

**Constraints**: No new npm packages; use existing `SentimentEventSchema` from `$lib/schemas`; Svelte 5 `$derived` rune for reactive validation

**Scale/Scope**: Single page, ~12 sample events; schema handles any future volume

## Constitution Check

| Gate | Rule | Check | Status |
|---|---|---|---|
| Branch name follows `###-feature-name` format | Rule 1 | `013-sentiment-events-organism` matches `[0-9]{3}-[a-z_-]+` | ✅ |
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
specs/013-sentiment-events-organism/
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
│   │   └── sentiment-event.schema.ts   # EXISTING — SentimentEventSchema (no changes needed)
│   └── components/
│       └── organisms/
│           └── SentimentEventsTable.svelte   # NEW
├── routes/
│   └── sentiment-events/
│       └── +page.svelte   # UPDATE — replace inline table with organism tag

features/
└── sentiment-events-organism.feature   # NEW — BDD scenarios

src/lib/schemas/__tests__/
└── sentiment-event.schema.test.ts   # NEW — schema validation unit tests
```
