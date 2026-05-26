# Tasks: Snapshot State Recovery

**Input**: Design documents from `/specs/006-snapshot-state-recovery/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅

**Tests**: No dedicated test tasks — existing Vitest schema tests cover Zod validation; Polish phase includes manual browser verification per SC-001/SC-002.

**BDD-First (Constitution Rule 6)**: BDD feature file already created in Phase 0 (planning). Phase 1 tasks verify its completeness and create step definitions before any implementation begins.

---

## Phase 1: Setup (BDD Verification & Step Definitions)

**Purpose**: Confirm BDD artifacts are complete and tagged correctly; write step definition stubs before any implementation task begins (Constitution Rule 6 — non-negotiable).

- [ ] T001 [BDD] Verify `features/snapshot-state-recovery.feature` contains all required tags (`@snapshot`, `@frontend`, `@smoke`, `@p1`, `@p2`) and that every scenario maps 1-to-1 to a spec acceptance scenario
- [ ] T002 [BDD] Create step definition stubs for all snapshot-state-recovery scenarios in `features/step-definitions/snapshot-state-recovery.steps.ts` — use Playwright locators matching the live component markup; mark unimplemented steps as `pending`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the two new Zod schemas and update the barrel export. These MUST exist before any page or layout implementation imports them.

**⚠️ CRITICAL**: Phases 3–5 cannot begin until T003–T005 are complete.

- [ ] T003 [ZOD] Create `src/lib/schemas/fundamental-screener.schema.ts` with `FundamentalScreenerSchema`: `z.object({ universe: z.string().default('S&P 500'), peMax: z.string().default('30'), roicMin: z.string().default('15'), revGrowthMin: z.string().default('10') })` — export `FundamentalScreenerSchema` and `FundamentalScreenerState` type
- [ ] T004 [ZOD] [P] Create `src/lib/schemas/technical-screener.schema.ts` with `TechnicalScreenerSchema`: `z.object({ selectedPatterns: z.array(z.string()).default([]), trendIndicator: z.string().default('EMA(200)'), momentumIndicator: z.string().default('RSI(14)') })` — export `TechnicalScreenerSchema` and `TechnicalScreenerState` type
- [ ] T005 Add `export * from './fundamental-screener.schema'` and `export * from './technical-screener.schema'` to `src/lib/schemas/index.ts`

**Checkpoint**: `pnpm check` passes; both new schemas importable from `$lib/schemas`

---

## Phase 3: User Story 1 — Recover AI Research Box Input (Priority: P1) 🎯 MVP

**Goal**: `aiText` typed in AIResearchBox is captured in the page snapshot and restored when the user navigates back to Research Workbench.

**Independent Test**: Type "test query" in AIResearchBox → navigate to Fundamental Screener via sidebar → navigate back to Research Workbench → verify textarea shows "test query". Validate that `validationError` is NOT displayed on return.

- [ ] T006 [STORYBOOK] [US1] Update `src/stories/AIResearchBox.stories.svelte`: add a `WithText` story that passes `aiText="Pre-filled research query"` as a prop (demonstrates bindable prop API; Constitution Rule 12 — Storybook MUST precede organism refactor)
- [ ] T007 [US1] Refactor `src/lib/components/organisms/AIResearchBox.svelte`: replace `let state = $state<z.infer<typeof AIResearchBoxSchema>>(AIResearchBoxSchema.parse({}))` with `let { aiText = $bindable('') } = $props()` and `let validationError = $state(false)`; update `handleConvertToStrategy` to reference `aiText` directly (not `state.aiText`); update template: `bind:value={aiText}` and `validationError` references unchanged; remove unused `AIResearchBoxSchema` import if no longer needed inside the component
- [ ] T008 [US1] Update `src/routes/research-workbench/+page.svelte`: add `import { type Snapshot } from '@sveltejs/kit'` and `import { z } from 'zod'`; declare `let aiText = $state('')`; add `bind:aiText` to `<AIResearchBox>`; define inline `const AIResearchBoxSnapshotSchema = z.object({ aiText: z.string().default('') })`; add `export const snapshot: Snapshot = { capture: () => ({ aiText }), restore: (v) => { const r = AIResearchBoxSnapshotSchema.safeParse(v); if (r.success) aiText = r.data.aiText; } }`

**Checkpoint**: Navigate away from Research Workbench and back — textarea text is preserved. No validation error shown on return. `pnpm check` passes.

---

## Phase 4: User Story 2 — Recover AI Chat History After Hard Refresh (Priority: P1)

**Goal**: AIChatPanel's `messages` array and `chatInput` are captured in the root layout snapshot and restored on hard refresh (F5); the layout snapshot also serves as forward-looking infrastructure for future child layouts.

**Independent Test**: Send 2 messages in AIChatPanel sidebar → press F5 → verify both messages appear with correct order and timestamps; verify any typed-but-unsent input is restored.

- [ ] T009 [STORYBOOK] [US2] Update `src/stories/AIChatPanel.stories.svelte`: add a `WithHistory` story that passes `messages` (array with 2 sample ChatMessage objects) and `chatInput="Unsent message"` as bindable props (Constitution Rule 12 — Storybook MUST precede organism refactor)
- [ ] T010 [US2] Refactor `src/lib/components/organisms/AIChatPanel.svelte`: replace `let state = $state<z.infer<typeof AIChatPanelSchema>>(AIChatPanelSchema.parse({}))` with `let { messages = $bindable([]), chatInput = $bindable('') } = $props()`; update all template references from `state.messages` → `messages` and `state.chatInput` → `chatInput`; update `handleSendMessage` to use `messages = [...messages, userMsg, assistantMsg]` and `chatInput = ''` directly; keep ChatMessage type import
- [ ] T011 [US2] Refactor `src/lib/components/organisms/AIReviewSidebar.svelte`: add `import type { z } from 'zod'` and necessary type imports; declare `let { messages = $bindable([]), chatInput = $bindable('') } = $props()`; add `bind:messages bind:chatInput` to the `<AIChatPanel>` element
- [ ] T012 [US2] Update `src/routes/+layout.svelte`: add imports for `AIChatPanelSchema` from `$lib/schemas` and `type Snapshot` from `@sveltejs/kit`; declare `let messages = $state([])` and `let chatInput = $state('')`; add `bind:messages bind:chatInput` to `<AIReviewSidebar>`; add `export const snapshot: Snapshot = { capture: () => ({ messages: messages.slice(-50), chatInput }), restore: (v) => { const r = AIChatPanelSchema.safeParse(v); if (r.success) { messages = r.data.messages; chatInput = r.data.chatInput; } } }`

**Checkpoint**: Hard refresh after sending messages → messages restored in correct order. Hard refresh with unsent input → input restored. `pnpm check` passes.

---

## Phase 5: User Story 3 — Recover Screener Filter Settings (Priority: P2)

**Goal**: All Fundamental Screener filter fields (universe, peMax, roicMin, revGrowthMin) and Technical Screener selections (selectedPatterns Set, trendIndicator, momentumIndicator) are captured in page snapshots and restored on navigation back.

**Independent Test**: Set Universe="Nasdaq 100", PE=20, ROIC=25, RevGrowth=15 in Fundamental Screener; select "Bull Flag" + "MACD Cross" patterns, Trend="Supertrend", Momentum="Stochastic" in Technical Screener → navigate to Research Workbench → navigate back to each screener → verify all values restored exactly.

- [ ] T013 [US3] Update `src/routes/fundamental-screener/+page.svelte`: import `FundamentalScreenerSchema` from `$lib/schemas` and `type Snapshot` from `@sveltejs/kit`; declare `let universe = $state('S&P 500')`; bind Universe `Select.Root` with `value={universe}` and `onValueChange={(v) => { universe = v }}`; add `export const snapshot: Snapshot = { capture: () => ({ universe, peMax, roicMin, revGrowthMin }), restore: (v) => { const r = FundamentalScreenerSchema.safeParse(v); if (r.success) { universe = r.data.universe; peMax = r.data.peMax; roicMin = r.data.roicMin; revGrowthMin = r.data.revGrowthMin; } } }`
- [ ] T014 [US3] [P] Update `src/routes/technical-screener/+page.svelte`: import `TechnicalScreenerSchema` from `$lib/schemas` and `type Snapshot` from `@sveltejs/kit`; declare `let trendIndicator = $state('EMA(200)')` and `let momentumIndicator = $state('RSI(14)')`; bind Trend `Select.Root` with `value={trendIndicator}` and `onValueChange={(v) => { trendIndicator = v }}`; bind Momentum `Select.Root` with `value={momentumIndicator}` and `onValueChange={(v) => { momentumIndicator = v }}`; add `export const snapshot: Snapshot = { capture: () => ({ selectedPatterns: [...selectedPatterns], trendIndicator, momentumIndicator }), restore: (v) => { const r = TechnicalScreenerSchema.safeParse(v); if (r.success) { selectedPatterns = new Set(r.data.selectedPatterns); trendIndicator = r.data.trendIndicator; momentumIndicator = r.data.momentumIndicator; } } }`

**Checkpoint**: Navigate away from both screeners and back — all four fundamental filter fields restored; all three technical fields (patterns Set, trendIndicator, momentumIndicator) restored. `pnpm check` passes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify all modified components render correctly, no TypeScript errors, no regressions, and manual browser validation of all three user stories.

- [ ] T015 [P] Run `pnpm storybook build` (or start Storybook and navigate to Organisms/AIResearchBox and Organisms/AIChatPanel) — verify `WithText` and `WithHistory` stories render without console errors and the bindable props display as expected
- [ ] T016 [P] Run `pnpm check` across the full project — confirm zero TypeScript type errors in all modified files (`AIResearchBox.svelte`, `AIChatPanel.svelte`, `AIReviewSidebar.svelte`, `+layout.svelte`, `research-workbench/+page.svelte`, `fundamental-screener/+page.svelte`, `technical-screener/+page.svelte`)
- [ ] T017 [P] Run `pnpm test` (Vitest) — confirm existing schema tests in `src/lib/schemas/__tests__/` all pass without modification, particularly `ai-research-box.schema.test.ts`, `ai-chat-panel.schema.test.ts`, and any new schema tests for `FundamentalScreenerSchema`/`TechnicalScreenerSchema`
- [ ] T018 Manual browser validation — US1 (SC-001): type text in AIResearchBox → sidebar-navigate to Fundamental Screener → navigate back → confirm text preserved; also confirm no validation error shown on return
- [ ] T019 Manual browser validation — US2 (SC-001): send 3+ messages in AIChatPanel → F5 hard refresh → confirm messages restored in order with timestamps; also type unsent message → F5 → confirm input restored
- [ ] T020 Manual browser validation — US3 (SC-001): set non-default filter values in both screeners → navigate to Research Workbench → navigate back to each screener → confirm all values restored; also verify cleared field restores as empty (not default)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (BDD)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS Phases 3, 4, 5
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 2 completion (independent of Phase 3)
- **Phase 5 (US3)**: Depends on Phase 2 completion (independent of Phases 3 and 4)
- **Phase 6 (Polish)**: Depends on all implementation phases complete

### User Story Dependencies

- **US1 (P1)**: Independent — no dependency on US2 or US3
- **US2 (P1)**: Independent — no dependency on US1 or US3; requires AIReviewSidebar refactor before +layout.svelte update
- **US3 (P2)**: Independent — no dependency on US1 or US2; T013 and T014 are parallel (different files)

### Within Each User Story

- [STORYBOOK] task MUST precede the corresponding organism refactor (Constitution Rule 12)
- Within US2: T010 (AIChatPanel) → T011 (AIReviewSidebar) → T012 (+layout.svelte) — sequential; each layer depends on the one below it
- Within US3: T013 and T014 are fully parallel (different route files, no shared state)

### Parallel Opportunities

| Parallel Group | Tasks | Condition |
|---|---|---|
| Schema creation | T003, T004 | Both in Phase 2, different files |
| Storybook updates | T006, T009 | Different story files, no shared dependency |
| Screener snapshots | T013, T014 | Different route files, same foundational schemas |
| Polish checks | T015, T016, T017 | All read-only validation, no shared mutation |

---

## Parallel Example: User Story 3

```bash
# Both screener page updates can run simultaneously:
Task T013: "Update fundamental-screener/+page.svelte — promote universe to $state, add snapshot"
Task T014: "Update technical-screener/+page.svelte — promote trendIndicator/momentumIndicator to $state, add snapshot with Set↔Array"
```

---

## Implementation Strategy

### MVP First (User Story 1 — Phases 1–3)

1. Complete Phase 1: BDD verification + step definition stubs
2. Complete Phase 2: Both Zod schemas + barrel update
3. Complete Phase 3: AIResearchBox Storybook → organism refactor → page snapshot
4. **STOP and VALIDATE**: Navigate away and back to Research Workbench — aiText preserved
5. Run `pnpm check` + `pnpm test` — confirm green

### Incremental Delivery

1. **MVP**: Phases 1–3 → Research Workbench snapshot working
2. **Add US2**: Phase 4 → Chat hard-refresh recovery working
3. **Add US3**: Phase 5 → Both screener snapshots working
4. **Polish**: Phase 6 → Full manual validation + Storybook verification

### Parallel Team Strategy (if 2 developers)

After Phase 2 completes:
- Dev A: Phase 3 (US1 — AIResearchBox + Research Workbench)
- Dev B: Phase 4 (US2 — AIChatPanel + AIReviewSidebar + layout)

After both P1 stories complete, either developer picks up Phase 5 (US3).

---

## Notes

- `[P]` = task can run in parallel with other `[P]` tasks in the same phase (different files, no shared state)
- `[US1/US2/US3]` = traceability label — maps task to spec user story
- `[BDD]` tasks (T001, T002) MUST complete before any implementation task (Constitution Rule 6)
- `[STORYBOOK]` tasks (T006, T009) MUST complete before their corresponding organism refactor tasks (Constitution Rule 12)
- `[ZOD]` tasks (T003, T004) are foundational — all page/layout snapshot tasks depend on them
- The `Snapshot` type must be imported from `@sveltejs/kit` in all route files that define `export const snapshot`
- SvelteKit's `Select.Root` `onValueChange` callback (not a native `bind:value`) is required for reactive state binding in the shadcn/ui Select component used in this project
- The 50-message cap in T012 uses `messages.slice(-50)` in `capture` — this trims from the front, keeping the most recent 50
