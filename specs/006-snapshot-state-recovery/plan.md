# Implementation Plan: Snapshot State Recovery

**Branch**: `006-snapshot-state-recovery` | **Date**: 2026-05-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-snapshot-state-recovery/spec.md`

## Summary

Implement SvelteKit's `snapshot` export across three `+page.svelte` files and the root `+layout.svelte` to preserve component-local state on navigation and hard refresh. The implementation refactors `AIResearchBox`, `AIChatPanel`, and `AIReviewSidebar` to expose local state as Svelte 5 `$bindable()` props, creates two new Zod schemas (`FundamentalScreenerSchema`, `TechnicalScreenerSchema`), and wires `snapshot.capture/restore` to four route files. State previously lost on navigation — `aiText`, chat `messages`/`chatInput`, screener filter fields, and pattern/indicator selections — will be transparently restored on return navigation or hard refresh.

## Technical Context

**Language/Version**: TypeScript 5.x, SvelteKit 2.57.x, Svelte 5.55.x

**Primary Dependencies**: SvelteKit snapshot API (built-in), Svelte 5 `$state` / `$bindable()`, Zod 4.4.x

**Storage**: Browser `sessionStorage` (managed by SvelteKit's snapshot API; per-tab, survives hard refresh, not cross-tab or browser-restart)

**Testing**: Vitest 4.x (unit), Playwright 1.59.x (e2e in `e2e-tests/`), Storybook with `@storybook/addon-svelte-csf` (component verification)

**Target Platform**: Web browser; SvelteKit 2.x with client-side navigation enabled

**Project Type**: SvelteKit frontend web application (single virtual module)

**Performance Goals**: Snapshot capture and restore MUST add <50ms overhead to page navigation (SC-002)

**Constraints**: sessionStorage-scoped only; no cross-tab or browser-restart persistence; AIChatPanel snapshot capped at 50 most recent messages to avoid storage overflow

**Scale/Scope**: 4 snapshot targets (3 `+page.svelte` + 1 `+layout.svelte`), 3 organism refactors, 2 new Zod schemas

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Gate | Rule | Check | Status |
|---|---|---|---|
| Branch name follows `###-feature-name` format | Rule 1 | `006-snapshot-state-recovery` matches `[0-9]{3}-[a-z0-9-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios for all 3 User Stories | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | Feature touches no Docker configuration | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | No new CI jobs required; existing gates must remain green | N/A |
| Required directory structure included | Rule 9 | `features/` ✅ (adding `snapshot-state-recovery.feature`); `e2e-tests/` ✅ | ✅ |
| UI components follow Atomic Design + Storybook (if frontend feature) | Rule 12 | New Zod schemas precede implementation; Storybook stories updated for modified organisms | ✅ |
| Virtual module structure respected (if adding new module) | Rule 11 | All changes within existing `src/` SvelteKit hierarchy; no new module | ✅ |
| No secrets or credentials in planned artifacts | Rule 4 | No secrets involved; sessionStorage data is ephemeral browser state | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/006-snapshot-state-recovery/
├── plan.md              ← This file (/speckit-plan output)
├── research.md          ← Phase 0 output (/speckit-plan output)
├── data-model.md        ← Phase 1 output (/speckit-plan output)
└── tasks.md             ← Phase 2 output (/speckit-tasks — NOT created here)
```

Note: No `contracts/` directory — this feature has no external API interfaces (pure client-side state management).

### Source Code

```text
src/
├── lib/
│   ├── components/
│   │   └── organisms/
│   │       ├── AIResearchBox.svelte        [modified] expose aiText as $bindable(); validationError stays local
│   │       ├── AIChatPanel.svelte          [modified] expose messages, chatInput as $bindable()
│   │       └── AIReviewSidebar.svelte      [modified] declare messages, chatInput as $bindable(); pass to AIChatPanel
│   └── schemas/
│       ├── fundamental-screener.schema.ts  [new] FundamentalScreenerSchema
│       ├── technical-screener.schema.ts    [new] TechnicalScreenerSchema
│       └── index.ts                        [modified] add new schema exports
├── routes/
│   ├── +layout.svelte                      [modified] declare chat $state vars; bind to AIReviewSidebar; add snapshot export
│   ├── research-workbench/
│   │   └── +page.svelte                    [modified] declare aiText $state; bind to AIResearchBox; add snapshot export
│   ├── fundamental-screener/
│   │   └── +page.svelte                    [modified] promote universe to $state; add snapshot export
│   └── technical-screener/
│       └── +page.svelte                    [modified] promote trendIndicator/momentumIndicator to $state; add snapshot export (Set↔Array)
└── stories/
    ├── AIResearchBox.stories.svelte        [modified] supply aiText prop for bindable story
    └── AIChatPanel.stories.svelte          [modified] supply messages/chatInput props for bindable story

features/
└── snapshot-state-recovery.feature        [new] BDD scenarios for all 3 User Stories

e2e-tests/
└── (existing; no new e2e tests in this feature scope)
```

**Structure Decision**: Single SvelteKit project. All changes within the existing `src/` hierarchy. No new top-level directories required beyond the BDD feature file under `features/`.

## Complexity Tracking

> No Constitution Check violations to justify.
