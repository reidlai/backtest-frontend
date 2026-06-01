# Implementation Plan: Fix Technical Screener Reactive State

**Branch**: `017-fix-technical-screener-state` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/017-fix-technical-screener-state/spec.md`

## Summary

`selectedPatterns` in `src/routes/technical-screener/+page.svelte` is declared as a plain `SvelteSet<string>` without the `$state(...)` wrapper, causing Svelte 5's reactivity system to ignore mutations. The fix is a single-line declaration change. A Playwright end-to-end test and a Cucumber/Gherkin feature file will be added to prevent regression.

## Technical Context

**Language/Version**: TypeScript / Node 24, Svelte 5 (runes mode)

**Primary Dependencies**: SvelteKit 2, `svelte/reactivity` (SvelteSet), Playwright 1.59, Vitest 4

**Storage**: N/A (client-side page state only)

**Testing**: Playwright (e2e), Vitest (unit/component), Cucumber/Gherkin feature files

**Target Platform**: SvelteKit web application (browser)

**Project Type**: Frontend web application

**Performance Goals**: Pattern selection/deselection reflects in UI within one render cycle

**Constraints**: Fix scope limited to `selectedPatterns` declaration; no schema or component API changes

**Scale/Scope**: Single-file change; one new e2e test file; one new feature file

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate                                                                 | Rule    | Check                                                                             | Status |
| -------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------- | ------ |
| Branch name follows `###-feature-name` format                        | Rule 1  | `017-fix-technical-screener-state` matches `[0-9]{3}-[a-z_-]+`                   | ✅     |
| BDD acceptance criteria defined in spec before this plan             | Rule 6  | spec.md has Given/When/Then scenarios in User Stories 1 & 2                       | ✅     |
| Docker image uses distroless base (if feature touches Docker)        | Rule 3  | No Docker changes in this fix                                                     | N/A    |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests)      | Rule 7  | Existing CI workflow covers these gates; no new CI jobs required                  | ✅     |
| Required directory structure included                                | Rule 9  | `features/` exists; `e2e-tests/` exists; new files will be added to both          | ✅     |
| UI components follow Atomic Design + Storybook (if frontend feature) | Rule 12 | Bug fix only — no new component; no Storybook task needed                         | N/A    |
| Virtual module structure respected (if adding new module)            | Rule 11 | No new module; existing SvelteKit page route modified                              | N/A    |
| No secrets or credentials in planned artifacts                       | Rule 4  | No secrets involved                                                               | ✅     |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/017-fix-technical-screener-state/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/routes/technical-screener/
└── +page.svelte          ← single-line fix: wrap selectedPatterns with $state()

e2e-tests/
└── technical-screener-reactive-state.e2e.ts   ← new Playwright test

features/
└── technical-screener-reactive-state.feature  ← new Cucumber/Gherkin feature file
```
