# Research: Extract AI Review Sidebar Panels

**Feature**: `004-extract-sidebar-panels` | **Date**: 2026-05-23

All research items were resolved by inspecting the existing codebase. No external unknowns required third-party research.

---

## R-001: Svelte Context Propagation to Child Organisms

**Decision**: `QuickActionsPanel` can safely call `getContext('organism-refs')` directly — no plumbing changes needed in `AIReviewSidebar`.

**Rationale**: `setContext('organism-refs', ...)` is called in `src/routes/+page.svelte` (confirmed at line ~20). Svelte context flows down the component tree via Svelte's built-in mechanism. Any descendant of `+page.svelte` — including `AIReviewSidebar` and its children (`QuickActionsPanel`) — can call `getContext('organism-refs')` during component initialization. The context object uses Svelte 5 getter syntax to expose reactive `strategyBuilderRef` and `backtestRef` state references.

**Alternatives considered**: Passing `organismRefs` as a prop from `AIReviewSidebar` to `QuickActionsPanel` — rejected per clarification Q1 (self-contained organisms; no props from sidebar).

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

## Summary of Resolved Unknowns

| ID | Topic | Resolution |
|----|-------|------------|
| R-001 | Context propagation | `getContext` works in child organisms; context set in `+page.svelte` |
| R-002 | `$state` reset behavior | Natural Svelte 5 per-instance behavior; no extra work needed |
| R-003 | Storybook format | `.stories.svelte` with `defineMeta`; no-arg stories for self-contained organisms |
| R-004 | CSS scoping | `.scrollbar-hide` moves to `AIChatPanel.svelte` `<style>` block |
| R-005 | File naming | PascalCase, matches entity names; `Organisms/` Storybook group prefix |

No external dependencies, third-party services, or unresolved technical decisions remain.
