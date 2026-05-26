# Feature Specification: Snapshot State Recovery

**Feature Branch**: `006-snapshot-state-recovery`

**Created**: 2026-05-26

**Status**: Draft

## Clarifications

### Session 2026-05-26

- Q: How should AIResearchBox and AIChatPanel expose their internal state to the parent page for snapshot capture and restoration? → A: Svelte 5 `$bindable()` props — organisms expose state fields as bindable props; parent page binds to them and includes them in the `snapshot` export.
- Q: Should the feature snapshot global stores (strategyState, backtestState) or focus only on state that is actually lost on navigation (component-local and page-local variables)? → A: Local state only — global stores already survive client-side navigation; snapshot targets only component-local (AIResearchBox, AIChatPanel) and page-local variables (screener filter fields, selected patterns).
- Q: Strategy Builder and Backtest Engine pages have no page-local state (all state is in global stores that already persist). Should they be removed from snapshot scope? → A: Yes, remove from scope — their global stores already handle persistence; no snapshot implementation needed for those pages.
- Q: FR-005 references "any indicator dropdown selections" without naming specific fields — what are the exact Technical Screener indicator fields to snapshot? → A: Three fields: `selectedPatterns` (Set<string>), `trendIndicator` (string, Trend dropdown: EMA(50)/EMA(200)/Supertrend), and `momentumIndicator` (string, Momentum dropdown: RSI(14)/Stochastic/MACD). `trendIndicator` and `momentumIndicator` must be promoted from hardcoded values to reactive `$state` variables as part of this feature.
- Q: Should there be a maximum number of AIChatPanel messages captured in the snapshot to avoid sessionStorage overflow? → A: Yes — cap at 50 most recent messages; trim older messages from the snapshot array before storing; restoration applies the trimmed list.
- Q: Which specific routes embed AIResearchBox and AIChatPanel — how many +page.svelte files need a snapshot export? → A: `AIResearchBox` is used only in `/research-workbench/+page.svelte`. `AIChatPanel` is embedded in `AIReviewSidebar`, which is mounted in the root `+layout.svelte` (global sidebar). Therefore `AIChatPanel` state must be snapshotted from `+layout.svelte`, not from any individual page; `AIReviewSidebar` must also expose bindable props to bubble the state up to the layout.
- Q: `selectedPatterns` is a `Set<string>` which is not JSON-serializable — how should the snapshot handle this? → A: Convert at the snapshot boundary — `capture` converts `Set→Array`, `restore` converts `Array→Set`; internal component state stays `Set<string>`.
- Q: No Zod schema exists for Fundamental Screener filter fields — does this feature create one, or skip schema validation for that page? → A: Create a new `FundamentalScreenerSchema` in this feature's scope: `z.object({ peMax: z.string().default('30'), roicMin: z.string().default('15'), revGrowthMin: z.string().default('10') })` so FR-006 applies consistently across all target pages.
- Q: Should `validationError` be included in the AIResearchBox snapshot — restoring a `true` value would show an error on return without user action? → A: Exclude `validationError` from the snapshot; always restore it as `false`. Only `aiText` is snapshotted for AIResearchBox.
- Q: The root `+layout.svelte` never remounts during client-side navigation — does the AIChatPanel snapshot add value, and what is the correct loss scenario? → A: Keep the layout snapshot for hard-refresh recovery and as forward-looking infrastructure (future features will introduce additional layouts that do remount on navigation); update User Story 2 to describe the hard-refresh scenario as the primary loss trigger.
- Q: The Fundamental Screener has a hardcoded Universe dropdown (S&P 500/Nasdaq 100/Russell 2000) not listed in FR-004 — should it be promoted to `$state` and included in the snapshot like trendIndicator/momentumIndicator? → A: Yes — include `universe: string` (default `'S&P 500'`) in the snapshot; promote to `$state`, add to `FundamentalScreenerSchema`, and capture alongside the three filter fields.

**Input**: User description: "Implement SvelteKit snapshot for state in organisms: AIResearchBox, AIChatPanel, src/routes/strategy-builder/+page.svelte, src/routes/fundamental-screener/+page.svelte, src/routes/technical-screener/+page.svelte, src/routes/backtest-engine/+page.svelte so the state can be recovered if navigate to other page"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Recover AI Research Box Input After Navigation (Priority: P1)

A user types a research query in the AI Research Box, then navigates to another page. When they navigate back, the previously entered research text is still present in the textarea — they do not have to retype it.

**Why this priority**: The AI Research Box is the primary entry point for users beginning a research workflow. Losing typed text mid-workflow is the most disruptive data-loss scenario for users.

**Independent Test**: Can be tested by typing text in AIResearchBox, navigating away using the sidebar, and returning to confirm the text is preserved.

**Acceptance Scenarios**:

1. **Given** a user has typed text in the AIResearchBox textarea, **When** the user navigates to any other page in the app, **Then** the textarea content is stored in the page snapshot.
2. **Given** a snapshot exists for the page containing AIResearchBox, **When** the user navigates back to that page, **Then** the textarea shows the previously typed text.
3. **Given** a user has NOT typed anything in the AIResearchBox, **When** the user navigates away and back, **Then** the textarea remains empty (no stale data from a prior session).

---

### User Story 2 - Recover AI Chat History After Hard Refresh (Priority: P1)

A user exchanges several messages with the AI Chat assistant in the global AIChatPanel sidebar. They perform a hard refresh (F5 / browser reload) on the current page. The full chat message history is restored — no messages are lost.

**Note**: Because AIChatPanel lives in the root `+layout.svelte` (which is never remounted during client-side navigation), chat state already persists in memory across page navigation without a snapshot. The `snapshot` export on `+layout.svelte` exists to recover chat history from a hard refresh, and as forward-looking infrastructure for future features that introduce child layouts which do remount on navigation.

**Why this priority**: Chat history represents a conversational context the user is actively building. A hard refresh (accidental or deliberate) would otherwise erase the full conversation, forcing the user to restart from scratch.

**Independent Test**: Can be tested by sending messages in AIChatPanel, performing a hard refresh, and verifying message history is intact.

**Acceptance Scenarios**:

1. **Given** a user has sent one or more messages in AIChatPanel, **When** the user performs a hard refresh, **Then** all messages (user and assistant) are restored from the `+layout.svelte` snapshot.
2. **Given** a snapshot with chat history exists, **When** the page reloads, **Then** all prior messages are displayed in the correct order with their timestamps.
3. **Given** AIChatPanel has a partially typed but unsent message, **When** the user performs a hard refresh, **Then** the in-progress message in the input is also restored.

---

### User Story 3 - Recover Screener Filter Settings After Navigation (Priority: P2)

A user configures filter values (e.g., PE Ratio ≤ 25, ROIC ≥ 20%) in the Fundamental Screener or selects pattern filters and indicators in the Technical Screener. They navigate to run a backtest, then return. All filter/indicator selections are restored.

**Why this priority**: Reconstructing filter combinations from memory adds friction and errors to multi-step research workflows.

**Independent Test**: Can be tested by setting non-default filter values, navigating away, and returning to verify all filter inputs are unchanged.

**Acceptance Scenarios**:

1. **Given** a user has set custom filter values in Fundamental Screener (Universe, PE, ROIC, Revenue Growth), **When** the user navigates away and back, **Then** all four filter fields show the values the user set.
2. **Given** a user has selected pattern buttons and indicator choices in Technical Screener, **When** the user navigates away and back, **Then** the exact same set of patterns and indicators is selected.
3. **Given** a screener page is freshly loaded (no prior snapshot), **When** the page renders, **Then** default filter values are shown (snapshot does not introduce stale defaults).

---

### Edge Cases

- What happens when a snapshot is present but the component's schema has changed (e.g., new field added)? The snapshot should fall back gracefully to schema defaults for missing fields.
- How does the system handle a snapshot that contains invalid data (e.g., a string in a numeric field)? Invalid snapshot fields are silently ignored and defaults are used.
- What happens if a user clears a field intentionally and navigates away and back? The empty/cleared value is preserved, not reset to a default.
- What happens when AIChatPanel's message history exceeds 50 messages? Only the 50 most recent messages are included in the snapshot; messages beyond this cap are not stored and will not be restored on navigation back.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Three `+page.svelte` files and the root `+layout.svelte` MUST implement SvelteKit's `snapshot` export: (1) `/research-workbench/+page.svelte` for `AIResearchBox` state, (2) `/fundamental-screener/+page.svelte` for filter fields, (3) `/technical-screener/+page.svelte` for pattern and indicator selections, and (4) `+layout.svelte` for `AIChatPanel` state (via `AIReviewSidebar`).
- **FR-002**: AIResearchBox MUST expose `aiText` as a Svelte 5 `$bindable()` prop so the parent page can bind to it and include it in the page's `snapshot` export. `validationError` MUST NOT be included in the snapshot and MUST always be restored as `false` to avoid displaying a stale error on navigation return.
- **FR-003**: `AIChatPanel` MUST expose its local state (`messages`, `chatInput`) as Svelte 5 `$bindable()` props. `AIReviewSidebar` MUST also expose these fields as `$bindable()` props so they can be bound in the root `+layout.svelte` and included in its `snapshot` export. The snapshot MUST capture at most the 50 most recent messages (trimming older messages before storage) to avoid sessionStorage overflow.
- **FR-004**: The Fundamental Screener page MUST capture four field values in its snapshot: `peMax: string` (default `'30'`), `roicMin: string` (default `'15'`), `revGrowthMin: string` (default `'10'`), and `universe: string` (default `'S&P 500'`; values: S&P 500/Nasdaq 100/Russell 2000). The `universe` selector MUST be promoted from a hardcoded value to a reactive `$state` variable. A new `FundamentalScreenerSchema` (`z.object({ peMax: z.string().default('30'), roicMin: z.string().default('15'), revGrowthMin: z.string().default('10'), universe: z.string().default('S&P 500') })`) MUST be created in `src/lib/schemas/` as part of this feature to enable FR-006 validation on restore.
- **FR-005**: The Technical Screener page MUST capture three fields in its snapshot: `selectedPatterns` (Set<string> in component; serialized as `string[]` in the snapshot object), `trendIndicator` (string; Trend dropdown — EMA(50)/EMA(200)/Supertrend), and `momentumIndicator` (string; Momentum dropdown — RSI(14)/Stochastic/MACD). The page MUST first promote `trendIndicator` and `momentumIndicator` from hardcoded values to reactive `$state` variables. The `snapshot.capture` function MUST convert `selectedPatterns` Set→Array; `snapshot.restore` MUST convert the restored Array→Set before assigning to component state. A new `TechnicalScreenerSchema` (`z.object({ selectedPatterns: z.array(z.string()).default([]), trendIndicator: z.string().default('EMA(200)'), momentumIndicator: z.string().default('RSI(14)') })`) MUST be created in `src/lib/schemas/` to enable FR-006 validation on restore.
- **FR-006**: Snapshot restoration MUST validate captured values against the relevant Zod schemas before applying; invalid values MUST fall back to schema defaults.
- **FR-007**: Snapshots MUST NOT persist beyond the browser session (SvelteKit's default snapshot behavior uses `sessionStorage`).

### Out of Scope

- **Strategy Builder** (`/strategy-builder`): All state lives in `strategyState`, a global module-level store that already survives client-side navigation. No snapshot implementation is required.
- **Backtest Engine** (`/backtest-engine`): All state lives in `backtestState`, a global module-level store that already survives client-side navigation. No snapshot implementation is required.

### Key Entities

- **Page Snapshot**: The serialized state object captured by SvelteKit's `snapshot` API for a given route; survives same-session navigation.
- **Component Local State**: The reactive `$state` object local to an organism component (AIResearchBox, AIChatPanel) or a page's own script block; lost on navigation without a snapshot.
- **Global Store**: Module-level reactive state (e.g., `strategyState`, `backtestState`) that persists across client-side navigation without a snapshot.
- **Snapshot Schema**: The Zod schema used to validate and parse restored snapshot data before applying it to component state.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can navigate away from and back to any of the four target pages without losing any component-local or page-local state they had configured.
- **SC-002**: Snapshot capture and restoration adds no perceptible delay to page navigation (under 50ms overhead measured on mid-range hardware).
- **SC-003**: 100% of component-local and page-local configurable fields across the four target pages are included in snapshot capture (verified by integration tests covering each field).
- **SC-004**: Snapshot restoration never displays stale or invalid data; 0 regression incidents related to snapshot data corruption after launch.

## Assumptions

- SvelteKit's built-in `snapshot` API (using `sessionStorage`) is the correct mechanism; no custom serialization library is required.
- AIResearchBox and AIChatPanel will be refactored to expose their local state via Svelte 5 `$bindable()` props so the parent page's `snapshot` export can capture and restore the values.
- The existing Zod schemas for AIResearchBox (`AIResearchBoxSchema`) and AIChatPanel (`AIChatPanelSchema`) are sufficient for snapshot validation. A new `FundamentalScreenerSchema` must be created as part of this feature (no equivalent schema exists in the codebase). A new `TechnicalScreenerSchema` covering `selectedPatterns`, `trendIndicator`, and `momentumIndicator` must also be created.
- Snapshots are session-scoped only (`sessionStorage` persists within a browser tab across hard refreshes but not across new tabs or browser restarts). There is no requirement to persist state across browser tabs or browser restarts.
- Global module-level stores (`strategyState`, `backtestState`) already survive client-side navigation in SvelteKit and are explicitly excluded from this feature's scope.
- Mobile browser support for `sessionStorage`-backed snapshots is assumed equivalent to desktop; no special mobile handling is required for this feature.
