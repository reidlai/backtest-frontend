# Feature Specification: Market Regime Page Organisms

**Feature Branch**: `010-market-regime-organisms`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "under Market Regime page, there should be two organisms, the first should be the current div showing Market Environment Summary while the second should be the grid shows Regime Cards"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Market Environment Summary Organism (Priority: P1)

A visitor to the Market Regime page views a clearly structured Market Environment Summary section as a self-contained organism component, making the AI-generated market summary visually distinct and reusable.

**Why this priority**: The Market Environment Summary is the primary context-setting element on the page. Extracting it into a dedicated organism improves maintainability and makes it independently testable and reusable across the application.

**Independent Test**: Can be fully tested by rendering the organism in isolation (e.g., in Storybook) and verifying it displays the AI summary text, the AI badge, and the heading correctly.

**Acceptance Scenarios**:

1. **Given** the Market Regime page loads, **When** the page renders, **Then** the Market Environment Summary organism appears as the first content section below the page heading.
2. **Given** an AI summary text is provided, **When** the Market Environment Summary organism renders, **Then** it displays the AI badge icon, the "Market Environment Summary" heading, and the summary text in the styled container.
3. **Given** the Market Environment Summary organism exists, **When** it is used in isolation outside the page, **Then** it renders correctly without dependencies on surrounding page structure.

---

### User Story 2 - Regime Cards Grid Organism (Priority: P2)

A visitor to the Market Regime page views a Regime Cards grid as a self-contained organism component, displaying all market regime cards in a responsive grid layout.

**Why this priority**: Extracting the regime cards grid into an organism creates a reusable, independently testable component that can be composed elsewhere in the application.

**Independent Test**: Can be fully tested by rendering the organism in isolation with a list of regime data and verifying the grid layout and individual cards render correctly.

**Acceptance Scenarios**:

1. **Given** the Market Regime page loads, **When** the page renders, **Then** the Regime Cards Grid organism appears as the second content section, below the Market Environment Summary organism.
2. **Given** a collection of market regime data is provided, **When** the Regime Cards Grid organism renders, **Then** it displays all regime cards in a responsive grid (2 columns on medium screens, 3 on large, 4 on extra-large).
3. **Given** the Regime Cards Grid organism exists, **When** it is used in isolation with sample data, **Then** it renders correctly without dependencies on surrounding page structure.

---

### Edge Cases

- What happens when the regime cards list is empty? The grid organism should render a simple empty state message (e.g., "No regime data available") rather than a blank area.
- What happens when the AI summary text is empty or undefined? The Market Environment Summary organism should handle missing text gracefully without layout breakage.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Market Regime page MUST compose exactly two organism components: `MarketEnvironmentSummary` and `RegimeCardsGrid`.
- **FR-002**: The `MarketEnvironmentSummary` organism MUST encapsulate the AI badge icon, the section heading, and the summary paragraph within a single reusable component.
- **FR-003**: The `RegimeCardsGrid` organism MUST encapsulate the responsive grid layout and the rendering of individual `RegimeCard` molecules.
- **FR-004**: Both organism components MUST be independently renderable (e.g., in Storybook) without requiring the full page context.
- **FR-005**: The Market Regime page MUST maintain its current visual appearance after the refactor — no user-visible style changes.
- **FR-006**: The `MarketEnvironmentSummary` organism MUST accept the summary text as a prop, validated via a Zod schema.
- **FR-007**: The `RegimeCardsGrid` organism MUST accept the list of market regime data as a prop, validated via a Zod schema.
- **FR-008**: Zod schemas for both organisms MUST be defined in `$lib/schemas`, consistent with the existing organism schema pattern.
- **FR-009**: The `RegimeCardsGrid` organism MUST display a simple empty state message when the regime cards list is empty.

### Key Entities

- **MarketEnvironmentSummary**: An organism component representing the AI-generated market context panel. Accepts a summary text string. Props defined via a Zod schema in `$lib/schemas`.
- **RegimeCardsGrid**: An organism component representing the grid of market regime cards. Accepts an array of market regime objects. Props defined via a Zod schema in `$lib/schemas`.

## Clarifications

### Session 2026-05-31

- Q: Should `MarketEnvironmentSummary` and `RegimeCardsGrid` define their props via Zod schemas? → A: Yes — define Zod schemas for both organism props, consistent with existing organisms.
- Q: When no regime cards are available, should `RegimeCardsGrid` show an empty state message or render nothing? → A: Show a simple empty state message (e.g., "No regime data available").

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The Market Regime page renders identically before and after the refactor — zero visual regressions.
- **SC-002**: Both `MarketEnvironmentSummary` and `RegimeCardsGrid` can be rendered and tested in isolation without the full page.
- **SC-003**: The Market Regime page component is reduced to a thin composition layer, delegating all content rendering to the two organism components.
- **SC-004**: No new prop drilling or state management complexity is introduced — each organism receives only the data it needs.

## Assumptions

- The existing inline markup in `+page.svelte` for both the summary div and the grid div becomes the implementation basis for the two new organism components.
- Organism components will be placed under `src/lib/components/organisms/` following existing project conventions.
- The visual styles (CSS classes) currently on the inline divs are preserved verbatim in the new organism components.
- Mobile responsiveness behavior is preserved as-is from the current grid classes.
- Storybook story files for both organisms are in scope and required by Constitution Rule 12 (Storybook documentation MUST precede backend implementation).
