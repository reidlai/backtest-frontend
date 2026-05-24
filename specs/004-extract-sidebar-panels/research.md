# Research: Extract Organisms into Dedicated Components and SvelteKit Routes

**Feature**: `004-extract-sidebar-panels` | **Date**: 2026-05-24 (updated from 2026-05-23)

All research items were resolved by inspecting the existing codebase. No external unknowns required third-party research.

---

## R-001: Svelte Context Propagation to Child Organisms _(Superseded by R-006)_

**⚠️ Status**: Superseded — `organism-refs` is removed entirely (FR-019b). The original decision to use `getContext('organism-refs')` in `QuickActionsPanel` and `TopBar` is no longer valid. See R-006 for the replacement approach.

**Original Decision (2026-05-23)**: `QuickActionsPanel` can safely call `getContext('organism-refs')` directly — no plumbing changes needed in `AIReviewSidebar`.

**Why superseded**: The `strategyBuilderRef` and `backtestRef` bound via `bind:this` in `+page.svelte` pointed to the now-deleted section organism components (`StrategyBuilderSection`, `BacktestEngineSection`). After the section organism files were deleted, `organism-refs` was already broken. Rather than relocate the context, the clarification process determined that dedicated state stores (`strategyState`, `backtestState`) are the correct replacement.

---

## R-002: Svelte 5 `$state` Per-Instance Isolation

**Decision**: `AIChatPanel`'s `messages` and `chatInput` declared as `$state([])` and `$state('')` will reset to their initial values on every mount — no special handling required.

**Rationale**: In Svelte 5, `$state` is per-component-instance. Each time `AIChatPanel` is mounted, a fresh instance is created with initial state values. This matches the current sidebar behavior (the sidebar never persisted chat state across page navigations). Confirmed expected behavior per spec clarification Q3.

**Alternatives considered**: Svelte store for cross-mount persistence — rejected as a new feature outside refactor scope.

---

## R-003: Storybook Story Format (Svelte 5 + `@storybook/addon-svelte-csf`)

**Decision**: Use `.stories.svelte` files with `<script module lang="ts">`, `defineMeta` from `@storybook/addon-svelte-csf`, and `<Story name="..." />` elements.

**Rationale**: All existing stories in `src/stories/` (e.g., `RiskFlagItem.stories.svelte`, `NavItem.stories.svelte`) follow this pattern. The project uses Storybook 10.4 with `@storybook/addon-svelte-csf` which natively supports this format for Svelte 5.

**Story design for self-contained organisms** (no props): Stories render the component directly with no `args`. Since organisms import sample data internally, Storybook renders them with live sample data. For `QuickActionsPanel`, `getContext('organism-refs')` will return `undefined` in Storybook context (no `setContext` in story), but all handlers use optional chaining (`organismRefs?.strategyBuilder?.reset?.()`) so the component renders safely — buttons are visible, clicks are no-ops for the context-dependent actions.

**Alternatives considered**: Args-based stories passing mock data — not applicable since organisms accept no props.

---

## R-004: CSS Scoping — `.scrollbar-hide` Migration

**Decision**: The `.scrollbar-hide` CSS block moves from `AIReviewSidebar.svelte`'s `<style>` to `AIChatPanel.svelte`'s `<style>`.

**Rationale**: Svelte's `<style>` is component-scoped by design. After extraction, `AIChatPanel` markup will no longer be in the same component as the `.scrollbar-hide` rule in `AIReviewSidebar`. Svelte would scope the selector to `AIReviewSidebar`'s own DOM scope hash, making it unreachable by `AIChatPanel`'s elements. Moving the rule to `AIChatPanel` ensures correct scoping without any global stylesheet pollution.

**Alternatives considered**: Global stylesheet (`app.css`) — rejected; rule is specific to one component's internal scroll container.

---

## R-005: Organism Naming and File Conventions

**Decision**: File names match entity names exactly: `AIReviewPanel.svelte`, `ResourceCostPanel.svelte`, `AIChatPanel.svelte`, `QuickActionsPanel.svelte`.

**Rationale**: Existing organisms use PascalCase filenames matching their component names (e.g., `AIReviewSidebar.svelte`, `TopBar.svelte`). The entity names in the spec are authoritative.

**Storybook title grouping**: Use `Organisms/` prefix (e.g., `title: 'Organisms/AIReviewPanel'`) to group new stories alongside any future organism stories. Existing molecule stories use `Molecules/` prefix, establishing this convention.

---

---

## R-006: organism-refs Removal and State Store Replacement

**Decision**: Remove `organism-refs` context entirely. Create `$lib/state/strategy.svelte.ts` (`strategyState`) and `$lib/state/backtest.svelte.ts` (`backtestState`) as Svelte 5 reactive objects. All former `organism-refs` callers (`QuickActionsPanel`, `TopBar`) import state stores directly.

**Rationale**: The `organism-refs` context held `bind:this` references to `StrategyBuilderSection` and `BacktestEngineSection` organisms, which were already deleted when section organisms were converted to route pages. The refs were broken before this spec expanded. Dedicated state stores follow the Svelte 5 idiom for cross-component state sharing and are accessible from any component or route regardless of mount status — solving the "reset while page is not mounted" requirement cleanly.

**Alternatives considered**: Relocating `setContext('organism-refs', ...)` to `+layout.svelte` — rejected because the refs pointed to deleted components; a context holding `undefined` is not meaningful. Exported functions from route pages — rejected because route pages cannot reliably export functions accessible from layout-level components (layout renders outside route slot).

---

## R-007: SvelteKit Navigation via goto() vs appState.activeSection

**Decision**: Replace ALL `appState.activeSection` mutations with `goto('/path')` from `$app/navigation`. Remove the `activeSection` field from `appState` entirely.

**Rationale**: `goto()` is the idiomatic SvelteKit navigation primitive. It triggers the router, updates `page.url.pathname`, and works correctly with browser history (back/forward buttons), deep linking, and server-side rendering. `appState.activeSection` was a client-side workaround for the pre-routing architecture; with true SvelteKit routes, it is redundant and creates a dual-navigation-state bug risk.

**Alternatives considered**: Keeping `appState.activeSection` as a parallel state alongside `goto()` — rejected because two navigation sources would diverge on browser back/forward navigation.

---

## R-008: Root Route Redirect Strategy

**Decision**: Use `src/routes/+page.server.ts` with `throw redirect(307, '/research-workbench')` for the root `/` redirect.

**Rationale**: A server-side redirect fires before any client rendering, eliminating flash-of-blank-content. The `307 Temporary Redirect` status code is correct for a routing convention (not a permanent canonical URL change). `+page.svelte` remains as an empty component; `+page.server.ts` handles the redirect at the server/SSR boundary.

**Alternatives considered**: Client-side `goto('/research-workbench')` in `+page.svelte` `onMount` — rejected because it causes a visible flash and does not work on hard-refresh with SSR.

---

## R-009: NavSection Path Field vs Route Derivation

**Decision**: Add `path: string` to the `NavSection` interface. All 10 nav section definitions in `MainMenuGroup.svelte` and `ResultMenuGroup.svelte` are updated with explicit path values. Active state uses `page.url.pathname === section.path`.

**Rationale**: Three SectionId values do not match their route paths (`'dashboard'` → `/research-workbench`, `'trade-log'` → `/trade-lot`, `'settings-billing'` → `/setting-billing`). Rather than rename SectionIds (which could break type references), adding an explicit `path` field is safer and more explicit. The `path` field is also more readable and avoids the footgun of deriving paths from IDs.

**Alternatives considered**: Deriving path from `'/' + section.id` — rejected because 3 mismatches make this unreliable. Renaming SectionIds — rejected because `SectionId` may be used elsewhere and the rename has wider blast radius.

---

## R-010: Storybook goto() Mock Strategy

**Decision**: For `AIResearchBox.stories.svelte` and `FunctionGateways.stories.svelte`, mock `goto` from `$app/navigation` as a no-op function within the story file. Add a story note that navigation is suppressed in Storybook.

**Rationale**: Storybook runs outside SvelteKit's router context; calling `goto()` would throw an error. The existing `QuickActionsPanel` story establishes the pattern of no-op handling for context-dependent side effects. The `$app/navigation` module is mockable in Storybook by reassigning before story render.

**Alternatives considered**: Wrapping the organism in a mock SvelteKit router context — rejected as overly complex; the no-op pattern is simpler and consistent with existing stories.

---

## R-011: market-regime Directory Defect

**Decision**: Use `git mv "src/routes/ market-regime" src/routes/market-regime` to rename the directory and preserve git history.

**Rationale**: The directory `" market-regime"` (with leading space) was created with an invalid name, making the route inaccessible at `/market-regime`. `git mv` is required (not filesystem rename) to preserve git history. The relative import `'../molecules/RegimeCard.svelte'` is also invalid from a route file's location and must be changed to `'$lib/components/molecules/RegimeCard.svelte'`.

---

## Summary of Resolved Unknowns

| ID | Topic | Resolution |
|----|-------|------------|
| R-001 | Context propagation | ~~`getContext` works in child organisms~~ — **Superseded by R-006: organism-refs removed** |
| R-002 | `$state` reset behavior | Natural Svelte 5 per-instance behavior; no extra work needed |
| R-003 | Storybook format | `.stories.svelte` with `defineMeta`; no-arg stories for self-contained organisms |
| R-004 | CSS scoping | `.scrollbar-hide` moves to `AIChatPanel.svelte` `<style>` block |
| R-005 | File naming | PascalCase, matches entity names; `Organisms/` Storybook group prefix |
| R-006 | organism-refs removal | Removed entirely; replaced by `strategyState` and `backtestState` stores |
| R-007 | Navigation approach | `goto('/path')` replaces all `appState.activeSection` mutations |
| R-008 | Root redirect | `+page.server.ts` with `redirect(307, '/research-workbench')` |
| R-009 | NavSection path | `path: string` field added to interface; all 10 definitions updated |
| R-010 | Storybook goto mock | No-op function in story file; story note that navigation is suppressed |
| R-011 | market-regime defect | `git mv` to fix directory name; `$lib` alias to fix relative import |

No external dependencies, third-party services, or unresolved technical decisions remain.
