# Implementation Plan: Extract Organisms into Dedicated Components and SvelteKit Routes

**Branch**: `004-extract-sidebar-panels` | **Date**: 2026-05-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-extract-sidebar-panels/spec.md`

## Summary

This feature has two interrelated goals: (1) extract four inline panels from `AIReviewSidebar.svelte` into dedicated, self-contained Svelte 5 organism components; and (2) convert each of the 10 main section organisms into dedicated SvelteKit `+page.svelte` routes, update the app layout to use SvelteKit's native routing slot, extract Research Workbench and Performance Result sub-organisms, create two new Svelte 5 reactive state stores (`strategyState`, `backtestState`), remove the `organism-refs` context entirely, migrate all `appState.activeSection` mutations to `goto()`, and add `path: string` to the `NavSection` type. All four changes are pure structural reorganizations — no new features or data flows are introduced.

## Technical Context

**Language/Version**: TypeScript 6.0 / Svelte 5.55.2 / SvelteKit

**Primary Dependencies**: Storybook 10.4 (`@storybook/addon-svelte-csf`), `svelte-sonner` (toast notifications), `$app/navigation` (`goto`), `$app/state` (`page`), `@sveltejs/kit` (`redirect`), `$lib/state/app.svelte` (appState — modified), `$lib/data/strategy.ts` (sampleAIReview, sampleResourceUsage, sampleStrategy), `$lib/data/trades.ts` (sampleTrades, tradesToCsv), `$lib/data/market.ts` (sampleMarketMetrics, sampleMarketRegimes), `$lib/data/performance.ts` (sampleBacktestResult, defaultMetricTiles), `$lib/components/ui/` (Button, Textarea, Badge, Progress), `$lib/components/molecules/RiskFlagItem.svelte`, `layerchart` (chart rendering in PerformancdeChartTabs)

**Storage**: N/A — all data is in-memory mock; no persistence layer

**Testing**: Storybook 10.4 visual verification (Constitution Rule 12); manual browser side-by-side comparison for SC-002, SC-005; `npm run check` and `npm run lint` for type and lint gates

**Target Platform**: Web browser (SvelteKit SPA)

**Project Type**: Frontend web application (SvelteKit)

**Performance Goals**: N/A — pure structural refactor; no new latency or throughput requirements

**Constraints**: Identical visual and behavioral output required; `<aside>` wrapper remains in `AIReviewSidebar`; `.scrollbar-hide` CSS migrates to `AIChatPanel`; all organisms self-contained (no props from parent); `goto()` replaces all `appState.activeSection` mutations; `organism-refs` context removed entirely; `NavSection.path` field added (not SectionId changed)

**Scale/Scope**: 2 new state store `.svelte.ts` files, 5 new Storybook `.stories.svelte` files, 4 new organism `.svelte` files (Part A — complete), 1 new `+page.server.ts` route, 1 modified `+layout.svelte`, ~12 modified `.svelte` files across organisms and routes

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate | Rule | Check | Status |
|------|------|-------|--------|
| Branch name follows `###-feature-name` format | Rule 1 | `004-extract-sidebar-panels` matches `[0-9]{3}-[a-z-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios for all 7 user stories (US1–US7) | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | No Docker changes in this refactor | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Existing CI pipeline runs on PR to main; T056 covers `npm run lint && npm run check`; no new CI jobs required | ✅ |
| Required directory structure included | Rule 9 | `features/` exists; `deploy/docker/` unchanged | ✅ |
| UI components follow Atomic Design + Storybook (if frontend feature) | Rule 12 | All 9 new organisms have Storybook stories (4 Part A complete; 5 Part C/D pending via T036–T045) | ✅ |
| Virtual module structure respected (if adding new module) | Rule 11 | No new virtual module; new files go into existing `src/lib/` structure | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | No secrets introduced | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/004-extract-sidebar-panels/
├── plan.md              ← this file
├── research.md          ← Phase 0 output (updated for Parts B–H)
├── data-model.md        ← Phase 1 output (updated for strategyState, backtestState, NavSection.path)
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/lib/state/
├── app.svelte.ts                      (modified — remove activeSection, strategyInputText)
├── strategy.svelte.ts                 (new — strategyState reactive store: inputText, parsedStrategy, reset(), getStrategyConfig())
└── backtest.svelte.ts                 (new — backtestState reactive store: all form fields, reset())

src/lib/types/
└── index.ts                           (modified — add path: string to NavSection; remove SectionId if unused)

src/lib/components/organisms/
├── AIReviewSidebar.svelte             (modified — <aside> wrapper + 4 organism imports; ~70% line reduction ✅)
├── AIReviewPanel.svelte               (new ✅ — AI review grade, confidence badge, risk flags list)
├── ResourceCostPanel.svelte           (new ✅ — token + backtest progress bars, runtime + plan impact stats)
├── AIChatPanel.svelte                 (new ✅ — message list, textarea, send button; owns local $state; includes <style>)
├── QuickActionsPanel.svelte           (existing ✅ → update: remove organism-refs, use strategyState/backtestState/goto)
├── TopBar.svelte                      (existing → update: remove organism-refs, use strategyState/goto)
├── MainMenuGroup.svelte               (existing → update: add path field + anchor tags + page.url.pathname active state)
├── ResultMenuGroup.svelte             (existing → update: add path field + anchor tags + page.url.pathname active state)
├── AIResearchBox.svelte               (existing → update: use strategyState.inputText + goto('/strategy-builder'))
├── FunctionGateways.svelte            (existing → update: use goto('/' + card.id) instead of appState.activeSection)
├── DashboardMetricGrid.svelte         (existing ✅ — stateless; reads sampleMarketMetrics; no changes needed)
├── PerformanceMetricGrid.svelte       (existing ✅ — stateful; initialized from defaultMetricTiles; no changes needed)
└── PerformancdeChartTabs.svelte       (existing ✅ — stateful; reads sampleBacktestResult; no changes needed)

src/routes/
├── +page.svelte                       (existing → update: strip section-switching markup, remove organism-refs setContext)
├── +page.server.ts                    (new — redirect(307, '/research-workbench'))
├── +layout.svelte                     (modified ✅ — already uses {@render children()})
├── backtest-engine/+page.svelte       (new ✅ → update: bind form inputs to backtestState fields)
├── research-workbench/+page.svelte    (new ✅ — composes DashboardMetricGrid, AIResearchBox, FunctionGateways)
├── fundamental-screener/+page.svelte  (new ✅ → update: replace appState.activeSection with goto('/backtest-engine'))
├── market-regime/+page.svelte         (new ✅ → fix: directory rename; fix: $lib alias import)
├── performance-result/+page.svelte    (new ✅ → update: replace appState.activeSection with goto('/backtest-engine'))
├── sentiment-events/+page.svelte      (new ✅ — no changes needed)
├── setting-billing/+page.svelte       (new ✅ — no changes needed)
├── strategy-builder/+page.svelte      (new ✅ → update: use strategyState; replace appState.activeSection × 3 with goto)
├── technical-screener/+page.svelte    (new ✅ — no changes needed)
└── trade-lot/+page.svelte             (new ✅ → update: replace appState.activeSection × 2 with goto('/backtest-engine'))

src/stories/
├── AIReviewPanel.stories.svelte       (new ✅ — Storybook story, title: Organisms/AIReviewPanel)
├── ResourceCostPanel.stories.svelte   (new ✅ — Storybook story, title: Organisms/ResourceCostPanel)
├── AIChatPanel.stories.svelte         (new ✅ — Storybook story, title: Organisms/AIChatPanel)
├── QuickActionsPanel.stories.svelte   (new ✅ — Storybook story, title: Organisms/QuickActionsPanel)
├── DashboardMetricGrid.stories.svelte (new — Storybook story, title: Organisms/DashboardMetricGrid)
├── AIResearchBox.stories.svelte       (new — Storybook story; mocks goto as no-op)
├── FunctionGateways.stories.svelte    (new — Storybook story; mocks goto as no-op)
├── PerformanceMetricGrid.stories.svelte  (new — Storybook story, title: Organisms/PerformanceMetricGrid)
└── PerformancdeChartTabs.stories.svelte  (new — Storybook story, title: Organisms/PerformancdeChartTabs; filename typo preserved)

features/
└── ai-review-sidebar-panels.feature   (existing ✅ Part A; → extend: add US5–US7 Gherkin scenarios)
```

**Structure Decision**: New state stores placed in `src/lib/state/` alongside the existing `app.svelte.ts`, following the established Svelte 5 reactive store pattern. Route pages follow SvelteKit file-based routing conventions. Storybook stories in `src/stories/` follow the existing `*.stories.svelte` convention.
