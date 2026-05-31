# Tasks: Technical Indicator Page Two-Column Layout

**Input**: Design documents from `specs/012-technical-indicator-layout/`

**Available docs**: spec.md

**Tech stack** (inferred from codebase): SvelteKit · Svelte 5 · TypeScript · Tailwind CSS · shadcn-svelte · layerchart · Zod schemas · Storybook · Cucumber/Gherkin

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: BDD feature file (Rule 6 — MUST precede all implementation), route shell, and shared mock data.

- [x] T001 [BDD] Create BDD feature file at `features/technical-indicator-layout.feature` tagged `@smoke` — include Given/When/Then scenarios for all three user stories: two-column layout renders, multi-select indicators overlay chart, chart pattern annotates chart (Constitution Rule 6 — MUST precede all implementation tasks)
- [x] T002 Create SvelteKit route directory and empty page shell at `src/routes/technical-indicator/+page.svelte` (imports placeholder only — no layout scaffold; scaffold belongs in T015)
- [x] T003 [P] Create mock OHLCV data module at `src/lib/data/mock-ohlcv.ts` exporting a static array of 90 candles (date, open, high, low, close, volume)
- [x] T004 [P] Create Zod schema for mock OHLCV data point at `src/lib/schemas/ohlcv-point.schema.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Storybook stories for all three organisms FIRST (Constitution Rule 12), then Zod schemas derived from verified component states.

**⚠️ CRITICAL**: Storybook tasks (T005–T007) MUST complete before Zod schema tasks (T008–T011). No user story work can begin until this entire phase is complete.

- [x] T005 [P] [STORYBOOK] Create Storybook story at `src/stories/IndicatorSelectionPanel.stories.svelte` — cover: (1) default/empty state (no indicators selected), (2) single indicator selected, (3) multiple indicators selected (Constitution Rule 12 — MUST precede schema creation)
- [x] T006 [P] [STORYBOOK] Create Storybook story at `src/stories/ChartPatternSelectionPanel.stories.svelte` — cover: (1) default/empty state, (2) one pattern selected, (3) active pattern deselected returns to empty state (Constitution Rule 12 — MUST precede schema creation)
- [x] T007 [P] [STORYBOOK] Create Storybook story at `src/stories/PatternPreviewPanel.stories.svelte` — cover: (1) empty state (no selection), (2) indicator overlays only, (3) chart pattern annotation only, (4) combined indicator overlays + pattern annotation (Constitution Rule 12 — MUST precede schema creation)
- [x] T008 Create Zod schema for Indicator Selection organism props at `src/lib/schemas/indicator-selection-panel.schema.ts` — include `availableIndicators: string[]` and `selectedIndicators: string[]`
- [x] T009 [P] Create Zod schema for Chart Pattern Selection organism props at `src/lib/schemas/chart-pattern-selection-panel.schema.ts` — include `availablePatterns: string[]` and `selectedPattern: string | null`
- [x] T010 [P] Create Zod schema for Pattern Preview organism props at `src/lib/schemas/pattern-preview-panel.schema.ts` — include `selectedIndicators: string[]`, `selectedPattern: string | null`, and `chartData: OHLCVPoint[]`
- [x] T011 Export all new schemas from `src/lib/schemas/index.ts`

**Checkpoint**: Storybook stories verified and schemas ready — organism implementation can begin.

---

## Phase 3: User Story 1 — Two-Column Layout (Priority: P1) 🎯 MVP

**Goal**: The Technical Indicator page renders a two-column layout with stub placeholders for all three organisms.

**Independent Test**: Navigate to `/technical-indicator`. Two columns are visible — left column shows two labelled placeholder cards (Indicator Selection, Chart Pattern Selection), right column shows one full-height placeholder card (Pattern Preview). No selection logic required at this stage.

### Implementation for User Story 1

- [x] T012 [US1] Create `IndicatorSelectionPanel` stub organism at `src/lib/components/organisms/IndicatorSelectionPanel.svelte` — renders a labelled card with "Indicator Selection" heading and a placeholder list (no interactivity yet)
- [x] T013 [P] [US1] Create `ChartPatternSelectionPanel` stub organism at `src/lib/components/organisms/ChartPatternSelectionPanel.svelte` — renders a labelled card with "Chart Pattern Selection" heading and placeholder toggle buttons (no interactivity yet)
- [x] T014 [P] [US1] Create `PatternPreviewPanel` stub organism at `src/lib/components/organisms/PatternPreviewPanel.svelte` — renders a labelled card with "Pattern Preview" heading and an empty chart placeholder div
- [x] T015 [US1] Implement two-column layout in `src/routes/technical-indicator/+page.svelte` — left `lg:col-span-1` containing `IndicatorSelectionPanel` and `ChartPatternSelectionPanel` stacked, right `lg:col-span-2` containing `PatternPreviewPanel`; use `grid gap-6 lg:grid-cols-3` pattern consistent with `technical-screener`

**Checkpoint**: Two-column layout renders correctly at all viewport widths. Stories 2 & 3 can now begin.

---

## Phase 4: User Story 2 — Multi-Select Indicator Updates Preview (Priority: P2)

**Goal**: User can select/deselect multiple technical indicators; all selected indicators are overlaid on the mock chart in Pattern Preview.

**Independent Test**: Open `/technical-indicator`. Select RSI and MACD in the Indicator Selection panel. The Pattern Preview chart renders with both indicators overlaid as Spline layers. Deselecting one removes its overlay within 300ms.

### Implementation for User Story 2

- [x] T016 [US2] Upgrade `IndicatorSelectionPanel` at `src/lib/components/organisms/IndicatorSelectionPanel.svelte` — implement multi-select toggle buttons for a predefined list of indicators (EMA(50), EMA(200), RSI(14), MACD, Stochastic, Supertrend, Bollinger Bands); emit selected state via Svelte 5 `$props` / callback
- [x] T017 [US2] Upgrade `PatternPreviewPanel` at `src/lib/components/organisms/PatternPreviewPanel.svelte` — integrate layerchart `Chart`, `Axis`, `Spline`, `Tooltip` components rendering mock OHLCV data; accept `selectedIndicators: string[]` prop and render one `Spline` overlay per selected indicator using a predefined palette of distinct stroke colours (max 7 simultaneous indicators supported)
- [x] T018 [US2] Wire multi-select state in `src/routes/technical-indicator/+page.svelte` — declare `let selectedIndicators = $state<string[]>([])`, bind to `IndicatorSelectionPanel` and pass down to `PatternPreviewPanel`
- [x] T019 [US2] Add snapshot persistence for `selectedIndicators` in `src/routes/technical-indicator/+page.svelte` using SvelteKit `snapshot` export, validated against `IndicatorSelectionPanelSchema`

**Checkpoint**: Multi-select indicator → chart overlay flow works independently. US3 can now begin.

---

## Phase 5: User Story 3 — Chart Pattern Selection Updates Preview (Priority: P3)

**Goal**: User can select a chart pattern; the pattern is rendered as `Rule` annotation overlays (vertical/horizontal reference lines marking pattern boundaries) on the same mock chart alongside any active indicators.

**Independent Test**: Open `/technical-indicator`. Select "Head & Shoulders" from the Chart Pattern Selection panel. The Pattern Preview chart displays `Rule` annotation lines marking the pattern boundaries, without removing any active indicator overlays.

### Implementation for User Story 3

- [x] T020 [US3] Upgrade `ChartPatternSelectionPanel` at `src/lib/components/organisms/ChartPatternSelectionPanel.svelte` — implement single-select toggle buttons for a predefined pattern list (Head & Shoulders, Double Top, Bull Flag, Cup & Handle, Triangle, Wedge); deselecting the active pattern clears the selection; emit selected pattern via prop/callback
- [x] T021 [US3] Add chart pattern annotation rendering to `PatternPreviewPanel` at `src/lib/components/organisms/PatternPreviewPanel.svelte` — accept `selectedPattern: string | null` prop; when a pattern is set, render layerchart `Rule` components (vertical/horizontal reference lines) at deterministic positions derived from the mock OHLCV data to mark canonical pattern boundary points
- [x] T022 [US3] Wire pattern selection state in `src/routes/technical-indicator/+page.svelte` — declare `let selectedPattern = $state<string | null>(null)`, bind to `ChartPatternSelectionPanel` and pass down to `PatternPreviewPanel`
- [x] T023 [US3] Add `selectedPattern` to snapshot persistence in `src/routes/technical-indicator/+page.svelte`, validated against `ChartPatternSelectionPanelSchema`

**Checkpoint**: All three user stories functional. Layout, multi-indicator overlay, and chart pattern annotation all work together.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Responsive behaviour, empty/loading states, navigation registration, and UX consistency.

- [x] T024 [P] Verify responsive breakpoints in `src/routes/technical-indicator/+page.svelte` — columns MUST stack vertically below `lg` breakpoint (consistent with `technical-screener` route); confirm no horizontal overflow at 320px and 2560px
- [x] T025 [P] Add empty state to `PatternPreviewPanel` at `src/lib/components/organisms/PatternPreviewPanel.svelte` — when no indicator and no pattern are selected, render centred placeholder message "Select an indicator or pattern to preview"
- [x] T026 [P] Add `aria-label` attributes and accessible heading hierarchy (`h1` page title, `h2` per panel) to all three organisms and `+page.svelte` for screen reader compatibility
- [x] T027 [P] Register `/technical-indicator` route in the app navigation at `src/lib/components/organisms/MainMenuGroup.svelte` so the page is reachable from the sidebar
- [x] T028 Add i18n message keys for all user-visible strings in the three organisms to `messages/en.json` (matching the pattern used in `technical-screener`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately; T001 [BDD] MUST be first
- **Phase 2 (Foundational)**: Depends on Phase 1 — Storybook tasks (T005–T007) MUST complete before schema tasks (T008–T011)
- **Phase 3 (US1 Layout)**: Depends on Phase 2 — MVP deliverable
- **Phase 4 (US2 Indicators)**: Depends on Phase 3 (T015 done) — can run in parallel with Phase 5
- **Phase 5 (US3 Patterns)**: Depends on Phase 3 (T015 done) — can run in parallel with Phase 4
- **Phase 6 (Polish)**: Depends on Phases 3–5

### User Story Dependencies

- **US1 (P1)**: Unblocked after Phase 2 — no story dependencies
- **US2 (P2)**: Depends on US1 (T015 must be done)
- **US3 (P3)**: Depends on US1 (T015 must be done); independent of US2

### Within Each Phase

- T001 [BDD] MUST be written before any organism implementation (Constitution Rule 6)
- Storybook tasks (T005–T007) MUST complete before Zod schema tasks (T008–T011) (Constitution Rule 12)
- Stub organisms (T012–T014) before layout wiring (T015)

### Parallel Opportunities

- T003 ∥ T004 (Phase 1)
- T005 ∥ T006 ∥ T007 (Phase 2 — Storybook)
- T009 ∥ T010 (Phase 2 — schemas, after T008 unlocked)
- T012 ∥ T013 ∥ T014 (Phase 3 — stubs)
- Phase 4 (US2) ∥ Phase 5 (US3) once T015 done
- T024 ∥ T025 ∥ T026 ∥ T027 (Phase 6)

---

## Notes

- [P] tasks operate on different files with no incomplete dependencies — safe to parallelise
- [Story] labels map tasks to spec.md user stories for traceability
- [BDD] task (T001, Constitution Rule 6) MUST precede all implementation — non-negotiable
- [STORYBOOK] tasks (T005–T007, Constitution Rule 12) MUST precede Zod schema tasks — non-negotiable
- Chart pattern annotation uses layerchart `Spline` with dashed stroke for vertical boundary lines
- Snapshot persistence pattern follows `src/routes/technical-screener/+page.svelte` as the reference implementation
- Mock OHLCV data (T003) is intentionally static — do not introduce a real data fetch in this feature
- All three organisms follow the Atomic Design organism convention under `src/lib/components/organisms/`
- Max simultaneous indicator overlays supported by the colour palette: 7
