# Implementation Plan: Enterprise AI Backtest Platform — Main Application Page

**Branch**: `001-home-page-svelte` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/001-home-page-svelte/spec.md`

## Summary

Implement `src/routes/+page.svelte` as the single-page application shell for the Enterprise AI Backtest Platform. The page renders a three-column layout (left navigation sidebar, main content area with 10 togglable sections, right AI review sidebar) using SvelteKit 2 + Svelte 5 runes, shadcn-svelte atoms, LayerChart charts, Paraglide JS for EN/zh-TW i18n, and module-level Svelte 5 reactive state. All data is mock/sample; no live APIs, no auth, no persistence.

## Technical Context

**Language/Version**: TypeScript 6.0 / Svelte 5.55 / SvelteKit 2.57 (runes mode enabled project-wide via `svelte.config.js`)  
**Primary Dependencies**: TailwindCSS 4 (installed), shadcn-svelte v2 (to install), LayerChart + D3 (to install), Paraglide JS 2.x (installed), Storybook 10 (installed), Vitest 4 + Playwright (installed)  
**Storage**: Browser session memory only — Svelte 5 `$state` in mounted organisms; no server storage, no localStorage  
**Testing**: Vitest 4 browser mode (component tests), Playwright (e2e), Storybook (visual/interaction stories)  
**Target Platform**: Web browser, Chromium/Firefox/Safari, minimum 1280px viewport  
**Project Type**: SvelteKit SPA — single route (`/`), all 10 sections toggled client-side  
**Performance Goals**: Section transitions < 300ms (SC-002); all metric tiles visible without overflow at ≥1280px (SC-003, SC-007)  
**Constraints**: 1280px minimum viewport only; dark mode only (no toggle); no auth; no live data; Atomic Design component organization required (FR-022); shadcn-svelte atoms required; LayerChart required for all charts  
**Scale/Scope**: 1 SvelteKit page, 10 content sections, 13 organisms, 6 molecules, ~15 shadcn-svelte atom components, 2 locales

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

The project constitution (`.specify/memory/constitution.md`) contains only the blank template — no project-specific principles have been ratified. **No active constitution gates apply.** Proceeding without constraint violations.

_Post-Phase 1 re-check_: N/A — no active gates to re-evaluate.

## Project Structure

### Documentation (this feature)

```text
specs/001-home-page-svelte/
├── plan.md              # This file
├── research.md          # Phase 0: tech decisions
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: setup guide
├── contracts/
│   └── types.ts         # Phase 1: TypeScript interface contracts
└── tasks.md             # Phase 2: /speckit-tasks output
```

### Source Code

```text
src/
├── app.html                                # Add class="dark" to <html>
├── lib/
│   ├── components/
│   │   ├── ui/                             # Atoms: shadcn-svelte (CLI-generated, do not hand-edit)
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   ├── dialog/
│   │   │   ├── input/
│   │   │   ├── label/
│   │   │   ├── select/
│   │   │   ├── separator/
│   │   │   ├── sonner/
│   │   │   ├── table/
│   │   │   ├── tabs/
│   │   │   ├── textarea/
│   │   │   ├── tooltip/
│   │   │   ├── badge/
│   │   │   └── progress/
│   │   ├── molecules/                      # Presentational composites — no internal state
│   │   │   ├── MetricTile.svelte           # Single metric display (label + value + delta)
│   │   │   ├── RegimeCard.svelte           # Regime classification card
│   │   │   ├── NavItem.svelte              # Sidebar navigation item
│   │   │   ├── FunctionGatewayCard.svelte  # Dashboard feature card
│   │   │   ├── RiskFlagItem.svelte         # AI review risk flag row
│   │   │   └── ScreenerResultRow.svelte    # Fundamental screener result row
│   │   └── organisms/                      # Stateful — own their section's $state
│   │       ├── NavigationSidebar.svelte    # Left sidebar + live controls
│   │       ├── TopBar.svelte               # Top bar: search, lang switcher, actions
│   │       ├── DashboardSection.svelte     # FR-007
│   │       ├── StrategyBuilderSection.svelte  # FR-008
│   │       ├── FundamentalScreenerSection.svelte  # FR-009
│   │       ├── TechnicalScreenerSection.svelte    # FR-010
│   │       ├── BacktestEngineSection.svelte       # FR-011
│   │       ├── PerformanceResultSection.svelte    # FR-012, FR-013
│   │       ├── MarketRegimeSection.svelte         # FR-014
│   │       ├── SentimentEventsSection.svelte      # FR-015
│   │       ├── TradeLogSection.svelte             # FR-016
│   │       ├── SettingsBillingSection.svelte      # FR-017
│   │       └── AIReviewSidebar.svelte             # FR-018 (right sidebar)
│   ├── data/                               # Mock/sample data modules
│   │   ├── market.ts                       # Market metrics + regime data
│   │   ├── performance.ts                  # Backtest result + metric tiles
│   │   ├── trades.ts                       # Trade log sample records
│   │   ├── sentiment.ts                    # Sentiment & events rows
│   │   └── strategy.ts                     # Sample AI review + resource usage
│   ├── state/
│   │   └── app.svelte.ts                   # Module-level $state: activeSection, currentLocale
│   ├── paraglide/                          # Generated by @inlang/paraglide-js Vite plugin
│   └── utils.ts                            # shadcn-svelte cn() helper (generated by CLI)
├── routes/
│   ├── +layout.svelte                      # Template: 3-column shell + <Toaster>
│   ├── layout.css
│   └── +page.svelte                        # Page: mounts all organisms, controls visibility
messages/
├── en.json                                 # English strings (all user-visible text)
└── zh-TW.json                              # Traditional Chinese strings
project.inlang/
└── settings.json                           # Add "zh-TW" to locales array
```

**Structure Decision**: Standard SvelteKit project. Atomic Design layers map to explicit `lib/components/` subdirectories: `ui/` = Atoms, `molecules/` = presentational, `organisms/` = stateful sections. Global state uses Svelte 5 module-level reactive state in a `.svelte.ts` file. Mock data lives in `lib/data/`. Paraglide messages remain at project root `messages/`.

## Complexity Tracking

No active constitution violations — section not applicable.
