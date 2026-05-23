# Feature Specification: Extract AI Review Sidebar Panels into Separate Organisms

**Feature Branch**: `004-extract-sidebar-panels`

**Created**: 2026-05-23

**Status**: Draft

**Input**: User description: "in src/lib/components/organisms/AIReviewSidebar.svelte, there are few panel inside it. Make these panels as seperate organisms and import it in AIReviewSidebar.svelte"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View AI Review Panel as Standalone Component (Priority: P1)

A developer navigating the codebase can locate, read, and modify the AI Review panel (confidence badge, strategy grade, and risk flags) as a dedicated, self-contained organism component without having to parse the full sidebar file.

**Why this priority**: The AI Review panel is the primary feature of the sidebar and is most likely to receive independent updates (e.g., new confidence levels, additional risk flag types). Isolating it first delivers the highest maintenance value.

**Independent Test**: Can be fully tested by rendering only the AI Review organism in isolation and verifying the grade, confidence badge, and risk flag list appear correctly.

**Acceptance Scenarios**:

1. **Given** the AIReviewSidebar is rendered, **When** a developer opens the AI Review organism file, **Then** it contains only the AI Review panel markup and its directly related logic.
2. **Given** the AI Review organism exists, **When** it is imported into AIReviewSidebar, **Then** the sidebar renders identically to the original.

---

### User Story 2 - View Resource & Cost Panel as Standalone Component (Priority: P2)

A developer can find and update the Resource & Cost panel (token usage, backtest usage, estimated runtime, plan impact) as its own organism without touching other sidebar panels.

**Why this priority**: Resource and cost tracking may evolve independently as billing features are added, making isolation important for focused changes.

**Independent Test**: Can be fully tested by rendering only the Resource & Cost organism and verifying token progress bars, backtest progress bars, and the stat grid display correctly.

**Acceptance Scenarios**:

1. **Given** the Resource & Cost organism exists, **When** rendered in isolation, **Then** it displays token usage, backtest usage, estimated runtime, and plan impact.
2. **Given** the organism is imported into AIReviewSidebar, **Then** the layout and data remain unchanged compared to the original sidebar.

---

### User Story 3 - Interact with AI Chat Panel as Standalone Component (Priority: P3)

A developer or tester can work with the AI Chat panel (message list, text input, send button) as a dedicated organism that manages its own local message state.

**Why this priority**: The chat panel has interactive state (message history, input value) that is independent of the other panels, making it a natural boundary for encapsulation.

**Independent Test**: Can be fully tested by rendering only the AI Chat organism, sending a message, and verifying the user and assistant messages appear in the conversation list.

**Acceptance Scenarios**:

1. **Given** the AI Chat organism is rendered, **When** a user types a message and clicks Send, **Then** the user message and a simulated assistant reply appear in the message list.
2. **Given** an empty chat state, **When** no messages exist, **Then** the placeholder prompt text is displayed.

---

### User Story 4 - Access Quick Actions Panel as Standalone Component (Priority: P4)

A developer can locate and modify the Quick Actions panel (New Strategy, New Backtest, Report, Export CSV) as its own organism without opening the full sidebar file.

**Why this priority**: Quick actions may be reused or extended in other layouts; extracting them allows future reuse and simplifies the sidebar container.

**Independent Test**: Can be fully tested by rendering only the Quick Actions organism and verifying all four action buttons appear and trigger the expected callbacks.

**Acceptance Scenarios**:

1. **Given** the Quick Actions organism is rendered, **When** each button is clicked, **Then** the corresponding action (reset strategy, reset backtest, navigate to report, export CSV) is triggered.
2. **Given** the organism is imported into AIReviewSidebar, **Then** all actions behave identically to the original implementation.

---

### Edge Cases

- When AIReviewSidebar composes all four extracted organisms, overall layout, spacing, and scroll behavior must remain identical to the pre-refactor state — verified by the manual browser comparison defined in SC-002.
- When AIChatPanel is unmounted and remounted, the message list and input value reset to empty — this is expected behavior, matching the natural Svelte 5 `$state` per-instance lifecycle. No persistence mechanism is required.
- When a panel organism's sample data contains empty arrays or zero values (e.g., `riskFlags: []`, `tokensUsed: 0`), it renders with those empty/zero values and produces no errors — no conditional hiding or placeholder text is added, matching current sidebar behavior.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST extract the AI Review panel into a dedicated, self-contained organism component that encapsulates its own markup and display logic.
- **FR-002**: System MUST extract the Resource & Cost panel into a dedicated, self-contained organism component that imports `sampleResourceUsage` directly and renders progress indicators and stats with no props from the sidebar.
- **FR-003**: System MUST extract the AI Chat panel into a dedicated organism component that owns its local message state and send-message behavior.
- **FR-004**: System MUST extract the Quick Actions panel into a dedicated, self-contained organism component that imports `appState`, `sampleTrades`, and `tradesToCsv` directly and calls `getContext('organism-refs')` internally — no action callbacks passed as props from the sidebar.
- **FR-005**: System MUST update AIReviewSidebar to import and compose the four extracted organisms, replacing all inline panel markup. The `<aside>` wrapper element and its CSS classes remain in AIReviewSidebar.
- **FR-008**: The `.scrollbar-hide` CSS styles currently in AIReviewSidebar's `<style>` block MUST be moved to `AIChatPanel.svelte`'s own `<style>` block, as Svelte component-scoped CSS will not apply across component boundaries.
- **FR-006**: System MUST ensure the visual appearance and interactive behavior of AIReviewSidebar remains identical after the refactor.
- **FR-007**: Each extracted organism MUST be independently renderable without depending on the AIReviewSidebar wrapper.

### Key Entities

- **AIReviewPanel**: Displays strategy grade, confidence badge, and a list of risk flags. Reads from shared AI review sample data.
- **ResourceCostPanel**: Displays token usage and backtest usage as progress bars, plus estimated runtime and plan impact stats. Reads from shared resource usage sample data.
- **AIChatPanel**: Manages a local list of chat messages; renders user and assistant bubbles; provides a text input and send button.
- **QuickActionsPanel**: Renders four action buttons; self-contained — calls `getContext('organism-refs')` internally, imports `appState`, `sampleTrades`, and `tradesToCsv` directly, and defines all action handlers (`handleNewStrategy`, `handleNewBacktest`, `handleExportCSV`) within the component.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All four sidebar panels are available as independently importable organism components — zero inline panel markup remains in AIReviewSidebar after refactor.
- **SC-002**: AIReviewSidebar renders pixel-identically to its pre-refactor state, verified by manual side-by-side visual comparison in the running browser — pass if layout, spacing, and styling are indistinguishable before and after the refactor.
- **SC-003**: Each panel organism can be rendered in isolation without requiring the AIReviewSidebar wrapper — all four pass standalone render checks.
- **SC-004**: The total line count of AIReviewSidebar is reduced by at least 70% compared to the pre-refactor version, reflecting successful delegation to child organisms.

## Clarifications

### Session 2026-05-23

- Q: Should extracted organisms be self-contained (importing data/state/context directly) or receive everything as props from AIReviewSidebar? → A: Self-contained — each organism imports sample data, `appState`, and context directly; AIReviewSidebar renders child organisms with no props.
- Q: What method will be used to verify pixel-identical visual equivalence for SC-002? → A: Manual side-by-side visual comparison in the running browser.
- Q: When AIChatPanel unmounts and remounts, should the message list reset to empty or persist? → A: Reset to empty — document as expected behavior matching natural Svelte 5 `$state` per-instance lifecycle; no persistence mechanism needed.
- Q: Where should the `.scrollbar-hide` CSS styles currently in AIReviewSidebar's `<style>` block be placed after extraction? → A: Move to `AIChatPanel.svelte`'s own `<style>` block — Svelte CSS is component-scoped and must live in the same file as the markup it targets.
- Q: When a panel organism renders with empty/zero sample data (e.g., empty `riskFlags` array, zero token usage), should it hide sections, show placeholders, or render with empty/zero values? → A: Render with empty/zero values — no special empty-state handling; organisms mirror current sidebar behavior exactly.

## Assumptions

- The refactor is a pure structural reorganization — no new features, changed behavior, or altered data flows are introduced.
- Sample data imports (sampleAIReview, sampleResourceUsage, sampleTrades) remain in their current locations and are consumed directly by the relevant panel organisms.
- The organism context (`organism-refs`) used by QuickActionsPanel remains available via the same Svelte context mechanism in the child organism (AIChatPanel does not use this context).
- Mobile layout or responsiveness changes are out of scope for this refactor.
- No new automated tests are required as part of this change; visual equivalence is the acceptance criterion.
