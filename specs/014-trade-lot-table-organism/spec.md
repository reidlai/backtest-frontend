# Feature Specification: Trade Lot Table Organism

**Feature Branch**: `014-trade-lot-table-organism`

**Created**: 2026-06-01

**Status**: Draft

**Input**: Extract the trades table block from `src/routes/trade-lot/+page.svelte` into a reusable organism component with local state management and Zod schema validation.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Trade Records Table (Priority: P1)

A user navigating to the Trade Lot page sees a fully rendered table of trade records with all columns: Trade ID, Symbol, Long/Short direction, Entry/Exit dates, prices, quantity, commission, slippage, Net PnL, Return %, holding days, and exit reason. Each row is color-coded — Long trades display in blue, Short in orange; positive PnL in green, negative in red.

**Why this priority**: This is the core function of the page. Without a working table, no trade data is visible.

**Independent Test**: Navigate to `/trade-lot` with sample trades loaded. The table renders all columns and rows with correct color coding.

**Acceptance Scenarios**:

1. **Given** the trade store contains one or more trade records, **When** the Trade Lot page loads, **Then** the `TradeLotTable` organism renders a scrollable table with all 14 columns and one row per trade.
2. **Given** a trade has `direction = 'Long'`, **When** the row renders, **Then** the direction cell text is styled in blue.
3. **Given** a trade has `netPnl < 0`, **When** the row renders, **Then** the Net PnL cell text is styled in red.
4. **Given** a trade has `returnPct > 0`, **When** the row renders, **Then** the Return % cell text is styled in green.

---

### User Story 2 - Empty State Navigation (Priority: P2)

When no trade records exist, the user sees an empty-state message and a call-to-action button that navigates them to the Backtest Engine to create trades.

**Why this priority**: Prevents a blank or broken-looking page and guides users to take the next meaningful action.

**Independent Test**: Render the organism with an empty trades array. The empty-state card with navigation button appears.

**Acceptance Scenarios**:

1. **Given** no trade records exist, **When** the organism renders, **Then** the table is replaced by an empty-state card reading "No trade records yet."
2. **Given** the empty-state card is visible, **When** the user clicks "Go to Backtest Engine", **Then** the app navigates to `/backtest-engine`.

---

### User Story 3 - Invalid Data Graceful Exclusion (Priority: P3)

When the trades data passed to the organism contains one or more records that fail Zod schema validation, those invalid records are silently excluded from the rendered table rather than causing a crash. Valid records are still displayed.

**Why this priority**: Protects UI stability when upstream data sources return malformed records.

**Independent Test**: Pass a mix of valid and invalid trade objects to the organism. Only valid records appear in the table; a console warning is emitted for each invalid record.

**Acceptance Scenarios**:

1. **Given** trades input contains one valid and one invalid record, **When** the organism renders, **Then** only the valid record appears in the table.
2. **Given** an invalid trade record is excluded, **When** the browser console is inspected, **Then** a warning identifying the invalid record and its schema errors is logged.

---

### Edge Cases

- What happens when a trade has `netPnl === 0`? The cell should use the negative (red) style as a safe fallback since the condition checks `> 0`.
- What happens when `returnPct === 0`? Same fallback: red styling.
- What happens if the entire trades array is invalid? All records excluded, empty-state card shows.
- What happens if `trade.netPnl.toLocaleString()` is called on a non-number value that sneaks through? Zod validation must enforce `number` type to prevent runtime errors.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: A new Svelte organism component named `TradeLotTable` MUST be created under `src/lib/components/organisms/`.
- **FR-002**: The organism MUST accept an `trades` prop typed as `unknown[]` to allow runtime Zod validation at the component boundary.
- **FR-003**: The organism MUST validate each trade record against `TradeRecordSchema` from `$lib/schemas` using `safeParse`, excluding invalid records and logging a console warning per exclusion.
- **FR-004**: The organism MUST render a horizontally scrollable table with 14 columns matching the current inline implementation: Trade ID, Symbol, L/S, Entry Date, Entry Price, Exit Date, Exit Price, Qty, Comm., Slip., Net PnL, Return %, Days, Exit Reason.
- **FR-005**: The organism MUST apply conditional text color classes: `text-blue-400` for Long direction, `text-orange-400` for Short; `text-green-400` for positive Net PnL and Return %, `text-red-400` for zero or negative.
- **FR-006**: The organism MUST display an empty-state card when no valid trades exist, containing the text "No trade records yet." and a button navigating to `/backtest-engine`.
- **FR-007**: The parent page `src/routes/trade-lot/+page.svelte` MUST be refactored to import and use `TradeLotTable`, removing the inline table block.
- **FR-008**: The organism MUST manage its own derived validated state internally, not relying on the parent to pre-validate data.

### Key Entities

- **TradeRecord**: Represents a single closed trade. Key attributes: `tradeId` (string), `symbol` (string), `direction` ('Long' | 'Short'), `entryDate` (string), `entryPrice` (number), `exitDate` (string), `exitPrice` (number), `quantity` (number), `commission` (number), `slippage` (number), `netPnl` (number), `returnPct` (number), `holdingDays` (number), `exitReason` (string). Validated by `TradeRecordSchema`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The Trade Lot page renders identically before and after the refactor — no visual regression in the table layout, column order, or color coding.
- **SC-002**: Invalid trade records are excluded without a page crash; a console warning is emitted for each excluded record, verifiable in browser dev tools.
- **SC-003**: The parent page file is shorter after extraction — the inline table block (~60 lines) is replaced by a single organism import and usage tag.
- **SC-004**: The organism component is independently renderable with only a `trades` prop — no page-level context or store required.
- **SC-005**: Navigating to `/backtest-engine` from the empty-state button works correctly when no trades exist.

## Assumptions

- `TradeRecordSchema` already exists in `$lib/schemas` and covers all 14 fields used in the table; no schema additions are required.
- The `goto` function from `$app/navigation` is used within the organism for the empty-state navigation button, consistent with the existing pattern in `SentimentEventsTable`.
- The organism follows the same structural pattern as `SentimentEventsTable.svelte` — `unknown[]` prop input, `$derived` validated array, self-contained rendering.
- No sorting, filtering, or pagination is in scope for this feature; the table renders all valid records in the order provided.
- The `TradeRecordSchema` uses the literal union `'Long' | 'Short'` for the `direction` field, matching the conditional color logic.
