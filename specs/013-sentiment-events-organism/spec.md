# Feature Specification: Sentiment Events Table Organism

**Feature Branch**: `013-sentiment-events-organism`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "in src/routes/sentiment-events/+page.svelte, can you make the following block as organism with local SvelteKit state with zod schema support?"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Sentiment Events Table (Priority: P1)

A developer visiting the Sentiment Events page sees a table listing all sentiment events. The table is rendered by a self-contained organism component that manages its own data state and validates incoming data against a schema.

**Why this priority**: This is the core deliverable — extracting the table block into an organism so it can be developed, tested, and reused independently.

**Independent Test**: Navigate to the Sentiment Events page and confirm the table renders all expected columns (Type, Symbol, Date, Headline, Sentiment, Score) with correctly styled badges and score bars.

**Acceptance Scenarios**:

1. **Given** the Sentiment Events page loads, **When** the organism receives a valid list of sentiment events, **Then** it renders each event as a table row with all six columns populated.
2. **Given** an event has no symbol, **When** the table row renders, **Then** the Symbol cell displays "Global".
3. **Given** an event has a positive score, **When** the score bar renders, **Then** the bar extends right from center in green.
4. **Given** an event has a negative score, **When** the score bar renders, **Then** the bar extends left from center in red.
5. **Given** an event's sentiment is "positive", **When** the Sentiment badge renders, **Then** it uses green colour styling.
6. **Given** an event's sentiment is "negative", **When** the Sentiment badge renders, **Then** it uses red colour styling.
7. **Given** an event's sentiment is "neutral", **When** the Sentiment badge renders, **Then** it uses muted colour styling.

---

### User Story 2 - Schema-Validated Event Data (Priority: P2)

A developer passes a list of sentiment event objects to the organism. The organism validates each item against a Zod schema before rendering, ensuring type safety and catching malformed data at the component boundary.

**Why this priority**: Schema validation is the second explicit requirement; it protects the table from unexpected runtime errors caused by malformed upstream data.

**Independent Test**: Pass a list containing one valid and one malformed event to the organism and confirm only the valid event renders (or an appropriate error indicator appears for the invalid one).

**Acceptance Scenarios**:

1. **Given** all events conform to the schema, **When** the organism initialises, **Then** all events are displayed without errors.
2. **Given** an event is missing a required field (e.g., `id`), **When** the organism initialises, **Then** the invalid event is excluded from the rendered list and a console warning is logged.

---

### User Story 3 - Local SvelteKit State Management (Priority: P3)

The organism owns its internal list of events as reactive local state, derived from the validated input prop. Parent components pass raw data; the organism transforms and stores it internally.

**Why this priority**: Encapsulating state inside the organism aligns with Atomic Design principles and enables future features (filtering, sorting) without touching the parent page.

**Independent Test**: Confirm that the parent page (`+page.svelte`) no longer directly iterates over `sampleSentimentEvents`; the organism manages that iteration internally.

**Acceptance Scenarios**:

1. **Given** the parent page imports the organism, **When** it passes the sample data as a prop, **Then** the parent template contains no table markup — only the organism tag.
2. **Given** the organism is mounted with valid data, **When** inspecting the component state, **Then** the internal events list reflects only schema-valid items.

---

### Edge Cases

- What happens when the events prop is an empty array? The organism renders the table header plus a single row spanning all six columns displaying "No events found".
- What happens when `event.score` is exactly `0`? The score bar should render with zero width and the label shows `0.00`.
- What happens when `event.symbol` is `null` or `undefined`? The cell displays "Global".

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: A new SvelteKit organism component MUST be created at `src/lib/components/organisms/SentimentEventsTable.svelte`.
- **FR-002**: The organism MUST accept a list of sentiment events as a prop.
- **FR-003**: The existing Zod schema `SentimentEventSchema` (fields: `id`, `type`, `symbol`, `date`, `headline`, `sentiment`, `score`) exported from `$lib/schemas/sentiment-event.schema.ts` MUST be imported and used by the organism. No new schema file is required.
- **FR-004**: The organism MUST validate the incoming prop against the Zod schema and filter out any items that fail validation. Validation MUST re-run reactively whenever the prop changes (not only on mount).
- **FR-005**: The organism MUST derive the validated event list as a reactive computation from the prop using `$derived`, ensuring the rendered list stays in sync with any prop updates.
- **FR-006**: The organism MUST render all six table columns: Type, Symbol, Date, Headline, Sentiment, Score — with the same visual styling as the original inline block.
- **FR-007**: The Score column MUST display a bidirectional progress bar centred at zero, with green for positive and red for negative scores.
- **FR-008**: The Sentiment column MUST display a colour-coded badge: green for "positive", red for "negative", muted for "neutral".
- **FR-009**: The parent page (`+page.svelte`) MUST be updated to import and use the new organism in place of the original inline table block.
- **FR-010**: The parent page MUST pass `sampleSentimentEvents` (or equivalent data source) as the prop to the organism.
- **FR-011**: When the validated events list is empty, the organism MUST render the table header plus a single body row spanning all six columns with the text "No events found".

### Key Entities

- **SentimentEvent**: Represents a single sentiment data point. Attributes: `id` (unique identifier), `type` (event category), `symbol` (ticker or null for global), `date` (display date string), `headline` (descriptive text), `sentiment` (enum: positive | negative | neutral), `score` (numeric −1 to +1).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The Sentiment Events page renders identically before and after the refactor — no visual regression.
- **SC-002**: The parent page template contains no inline table markup after the refactor; all table logic lives inside the organism.
- **SC-003**: The organism accepts and validates a list of 100 events in under 50 ms on a standard development machine.
- **SC-004**: Any event object that fails Zod validation is excluded from the rendered list; at least one test case confirms this behaviour.

## Clarifications

### Session 2026-06-01

- Q: Should the organism re-validate when the events prop changes after mount? → A: Yes — re-validate reactively on every prop change using `$derived`.
- Q: Should the Zod schema live inside the component or in a separate file? → A: Separate file at `$lib/schemas/sentiment.ts`.
- Q: Should an empty events list show a silent empty table or an explicit message? → A: Empty-state row spanning all columns with "No events found".

## Assumptions

- The existing `sampleSentimentEvents` mock data in `$lib/shared-mockdata/sentiment` is the only data source for this page; no real API call is introduced in this feature.
- The organism follows the Atomic Design organism pattern already established in the project (see existing organisms under `src/lib/components/organisms/`).
- Zod is already available as a project dependency; no new package installation is required.
- SvelteKit 5 rune-based reactive state (`$state`, `$derived`) is the preferred state mechanism in this codebase.
- Mobile responsiveness of the table is out of scope for this feature.
