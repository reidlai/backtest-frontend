# Implementation Plan: Extract AI Review Sidebar Panels into Separate Organisms

**Branch**: `004-extract-sidebar-panels` | **Date**: 2026-05-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-extract-sidebar-panels/spec.md`

## Summary

Extract four inline panels from `src/lib/components/organisms/AIReviewSidebar.svelte` into dedicated, self-contained Svelte 5 organism components — `AIReviewPanel`, `ResourceCostPanel`, `AIChatPanel`, and `QuickActionsPanel` — each importing its own data and managing its own state. Compose the four organisms back into a slimmed-down `AIReviewSidebar`. Add Storybook stories for all four new organisms per Constitution Rule 12. No new data models, API contracts, or behavioral changes are introduced.

## Technical Context

**Language/Version**: TypeScript 6.0 / Svelte 5.55.2 / SvelteKit

**Primary Dependencies**: Storybook 10.4 (`@storybook/addon-svelte-csf`), `svelte-sonner` (toast), `$lib/state/app.svelte` (appState), `$lib/data/strategy.ts` (sampleAIReview, sampleResourceUsage), `$lib/data/trades.ts` (sampleTrades, tradesToCsv), `$lib/components/ui/` (Button, Textarea, Badge, Progress), `$lib/components/molecules/RiskFlagItem.svelte`

**Storage**: N/A — all data is in-memory mock; no persistence layer

**Testing**: Storybook 10.4 visual verification (Constitution Rule 12); manual browser side-by-side comparison for SC-002

**Target Platform**: Web browser (SvelteKit SPA)

**Project Type**: Frontend web application

**Performance Goals**: N/A — pure structural refactor; no new latency or throughput requirements

**Constraints**: Identical visual and behavioral output required; `<aside>` wrapper remains in `AIReviewSidebar`; `.scrollbar-hide` CSS migrates to `AIChatPanel`; organisms are self-contained (no props from sidebar); `QuickActionsPanel` calls `getContext('organism-refs')` internally

**Scale/Scope**: 4 new organism `.svelte` files, 4 new Storybook `.stories.svelte` files, 1 modified `AIReviewSidebar.svelte`

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate | Rule | Check | Status |
|------|------|-------|--------|
| Branch name follows `###-feature-name` format | Rule 1 | `004-extract-sidebar-panels` matches `[0-9]{3}-[a-z-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios for all 4 user stories | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | No Docker changes in this refactor | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Existing CI pipeline runs on PR to main; no new jobs required | ✅ |
| Required directory structure included | Rule 9 | `features/` exists; `deploy/docker/` unchanged | ✅ |
| UI components follow Atomic Design + Storybook (if frontend feature) | Rule 12 | **OVERRIDE**: spec assumption stated "no new automated tests required" — Constitution Rule 12 is non-negotiable and supersedes spec assumptions; plan includes Storybook story creation for all 4 new organisms | ⚠️ Resolved |
| Virtual module structure respected (if adding new module) | Rule 11 | No new virtual module; new organisms go into existing `src/lib/components/organisms/` | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | No secrets introduced | ✅ |

**Violations**:

| Violation | Why Needed | Resolution |
|-----------|------------|------------|
| Rule 12 — spec assumption exempted Storybook | Spec said "no new automated tests required" (scoped to unit/behavioral tests) | Plan overrides assumption: 4 Storybook story files will be created for new organisms. The constitution supersedes spec-level assumptions. No waiver required since stories are being added. |

## Project Structure

### Documentation (this feature)

```text
specs/004-extract-sidebar-panels/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks — not created by /speckit-plan)
```

### Source Code (repository root)

```text
src/lib/components/organisms/
├── AIReviewSidebar.svelte           (modified — <aside> wrapper + 4 organism imports; ~70% line reduction)
├── AIReviewPanel.svelte             (new — AI review grade, confidence badge, risk flags list)
├── ResourceCostPanel.svelte         (new — token + backtest progress bars, runtime + plan impact stats)
├── AIChatPanel.svelte               (new — message list, textarea, send button; owns local $state; includes <style>)
└── QuickActionsPanel.svelte         (new — 4 action buttons; self-contained handlers + getContext)

src/stories/
├── AIReviewPanel.stories.svelte     (new — Storybook story, title: Organisms/AIReviewPanel)
├── ResourceCostPanel.stories.svelte (new — Storybook story, title: Organisms/ResourceCostPanel)
├── AIChatPanel.stories.svelte       (new — Storybook story, title: Organisms/AIChatPanel)
└── QuickActionsPanel.stories.svelte (new — Storybook story, title: Organisms/QuickActionsPanel)
```

**Structure Decision**: New organisms placed in `src/lib/components/organisms/` following existing project conventions. Storybook stories placed in `src/stories/` following the existing `*.stories.svelte` convention established by `RiskFlagItem.stories.svelte`, `NavItem.stories.svelte`, etc.
