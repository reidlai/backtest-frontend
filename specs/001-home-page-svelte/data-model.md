# Data Model: Enterprise AI Backtest Platform — Main Application Page

**Date**: 2026-05-18 | **Feature**: [spec.md](spec.md)

All entities are mock/sample data only — no live API, no database. TypeScript interfaces are defined in `specs/001-home-page-svelte/contracts/types.ts` and mirrored in `src/lib/types/index.ts` for runtime use. Mock data modules live in `src/lib/data/`.

---

## Entity: SectionId

Union type identifying the 10 main content sections used for `activeSection` global state.

```typescript
type SectionId =
	| 'dashboard'
	| 'strategy-builder'
	| 'fundamental-screener'
	| 'technical-screener'
	| 'backtest-engine'
	| 'performance-result'
	| 'market-regime'
	| 'sentiment-events'
	| 'trade-log'
	| 'settings-billing';
```

---

## Entity: MarketMetric

Point-in-time snapshot of a market index or risk indicator displayed in the Dashboard metric grid (FR-007, User Story 1).

| Field         | Type                                       | Notes                                            |
| ------------- | ------------------------------------------ | ------------------------------------------------ |
| id            | string                                     | Unique key (e.g., `'sp500'`, `'vix'`)            |
| label         | string                                     | Display name (e.g., `"S&P 500"`)                 |
| value         | string                                     | Pre-formatted display value (e.g., `"5,234.18"`) |
| delta         | string                                     | Pre-formatted change (e.g., `"+1.2%"`)           |
| deltaPositive | boolean                                    | true = green indicator, false = red              |
| category      | `'market' \| 'risk' \| 'rates' \| 'usage'` | Tile grouping                                    |

**Mock data module**: `src/lib/data/market.ts`  
**Used by**: `DashboardSection` organism, `MetricTile` molecule

---

## Entity: NavSection

Metadata for a navigation item in the left sidebar (FR-002, FR-003).

| Field | Type                 | Notes                               |
| ----- | -------------------- | ----------------------------------- |
| id    | SectionId            | Section identifier                  |
| label | string               | i18n message key for display label  |
| icon  | string               | Icon name (Lucide icon identifier)  |
| group | `'main' \| 'result'` | Navigation group: LEVEL 1 / LEVEL 2 |

**Used by**: `NavigationSidebar` organism, `NavItem` molecule

---

## Entity: Strategy

Structured investment strategy object produced by parsing natural language input (FR-008).

| Field             | Type   | Notes                                                           |
| ----------------- | ------ | --------------------------------------------------------------- |
| market            | string | Market universe (e.g., `"US Equities — S&P 500"`)               |
| fundamentalFilter | string | Summary of fundamental criteria                                 |
| technicalFilter   | string | Summary of technical indicator criteria                         |
| backtestPeriod    | string | Date range (e.g., `"2020-01-01 to 2024-12-31"`)                 |
| positionSize      | string | Sizing rule (e.g., `"5% per position, max 10 positions"`)       |
| riskRule          | string | Risk management rule (e.g., `"10% stop-loss, 25% take-profit"`) |

**Mock data module**: `src/lib/data/strategy.ts`  
**Used by**: `StrategyBuilderSection` organism  
**Export format**: This shape is what Export JSON downloads (FR-006)

---

## Entity: MetricTile

A single draggable performance metric display in the Performance Result section (FR-012, FR-013).

| Field | Type   | Notes                                        |
| ----- | ------ | -------------------------------------------- |
| id    | string | Unique tile key (e.g., `'total-return'`)     |
| label | string | Metric name (e.g., `"Total Return"`)         |
| value | string | Formatted display value (e.g., `"42.8%"`)    |
| unit  | string | Unit label (e.g., `"%"`, `"$"`, `"x"`, `""`) |
| order | number | Current display order (0-based integer)      |

**Mock data module**: `src/lib/data/performance.ts`  
**Used by**: `PerformanceResultSection` organism, `MetricTile` molecule  
**Draggable**: order mutated in-place via native HTML5 DnD (research Decision 3)  
**Editable**: double-click opens edit modal (FR-013, FR-019)

---

## Entity: BacktestResult

All performance data from a strategy backtest run. Used in Performance Result section (FR-012).

| Field           | Type                                 | Notes                                  |
| --------------- | ------------------------------------ | -------------------------------------- |
| totalReturn     | number                               | Total return percentage                |
| netProfit       | number                               | Net profit in dollars                  |
| maxDrawdown     | number                               | Maximum drawdown percentage (negative) |
| sharpeRatio     | number                               | Sharpe ratio                           |
| winRate         | number                               | Win rate percentage                    |
| profitFactor    | number                               | Gross profit / gross loss              |
| volatility      | number                               | Annualized volatility percentage       |
| exposureTime    | number                               | Percentage of time in market           |
| equityCurve     | `{ date: string; value: number }[]`  | Time series for Equity Curve chart tab |
| drawdownSeries  | `{ date: string; value: number }[]`  | Time series for Drawdown chart tab     |
| monthlyReturns  | `{ month: string; value: number }[]` | Monthly returns for Heatmap tab        |
| benchmarkSeries | `{ date: string; value: number }[]`  | Benchmark series for Overlay tab       |

**Mock data module**: `src/lib/data/performance.ts`  
**Used by**: `PerformanceResultSection` organism

---

## Entity: RegimeBreakdown

Performance breakdown by market regime, displayed in the Performance Result table (FR-012).

| Field       | Type   | Notes                               |
| ----------- | ------ | ----------------------------------- |
| regime      | string | Regime name (e.g., `"Bull Trend"`)  |
| returnPct   | number | Return percentage in this regime    |
| maxDrawdown | number | Max drawdown in this regime         |
| winRate     | number | Win rate percentage in this regime  |
| tradeCount  | number | Number of trades during this regime |

**Mock data module**: `src/lib/data/performance.ts`  
**Used by**: `PerformanceResultSection` organism

---

## Entity: TradeRecord

An individual trade in the Trade Log section (FR-016).

| Field       | Type                | Notes                                                         |
| ----------- | ------------------- | ------------------------------------------------------------- |
| tradeId     | string              | Trade identifier (e.g., `"T-001"`)                            |
| symbol      | string              | Ticker symbol (e.g., `"AAPL"`)                                |
| direction   | `'Long' \| 'Short'` | Trade direction                                               |
| entryDate   | string              | ISO date string (e.g., `"2024-01-15"`)                        |
| entryPrice  | number              | Entry price                                                   |
| exitDate    | string              | ISO date string                                               |
| exitPrice   | number              | Exit price                                                    |
| quantity    | number              | Share/contract quantity                                       |
| commission  | number              | Commission paid in dollars                                    |
| slippage    | number              | Slippage cost in dollars                                      |
| netPnl      | number              | Net profit/loss in dollars                                    |
| returnPct   | number              | Return percentage                                             |
| holdingDays | number              | Days position was held                                        |
| exitReason  | string              | Exit reason (e.g., `"Stop Loss"`, `"Target Hit"`, `"Signal"`) |

**Mock data module**: `src/lib/data/trades.ts`  
**Used by**: `TradeLogSection` organism  
**CSV export**: Export CSV in Quick Actions downloads all trade records as CSV (FR-018)

---

## Entity: MarketRegime

A market environment classification shown in the Market Regime section (FR-014).

| Field            | Type                                  | Notes                                                                   |
| ---------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| id               | string                                | Regime identifier                                                       |
| name             | string                                | Display name (e.g., `"Bull Trend"`)                                     |
| status           | `'active' \| 'inactive' \| 'warning'` | Visual status indicator                                                 |
| logicDescription | string                                | Supporting logic and indicator summary                                  |
| indicators       | string[]                              | List of active indicator names                                          |
| aiSummary        | string                                | AI-generated narrative (on the MarketRegimeSection level, not per-card) |

**Mock data module**: `src/lib/data/market.ts`  
**Used by**: `MarketRegimeSection` organism, `RegimeCard` molecule

---

## Entity: AIReview

Strategy assessment shown pre-populated in the right sidebar AI Review panel (FR-018).

| Field      | Type                          | Notes                       |
| ---------- | ----------------------------- | --------------------------- |
| grade      | string                        | Letter grade (e.g., `"B+"`) |
| confidence | `'high' \| 'medium' \| 'low'` | Confidence level            |
| riskFlags  | RiskFlag[]                    | Itemized risk findings      |

---

## Entity: RiskFlag

An individual risk finding within the AI Review (FR-018).

| Field       | Type                          | Notes                                       |
| ----------- | ----------------------------- | ------------------------------------------- |
| id          | string                        | Flag identifier                             |
| label       | string                        | Risk flag name (e.g., `"Overfitting Risk"`) |
| severity    | `'high' \| 'medium' \| 'low'` | Severity level                              |
| description | string                        | One-line explanation                        |

**Mock data module**: `src/lib/data/strategy.ts`  
**Used by**: `AIReviewSidebar` organism, `RiskFlagItem` molecule

---

## Entity: ResourceUsage

Session-level resource metrics shown in the Resource & Cost panel (FR-018).

| Field            | Type                          | Notes                                  |
| ---------------- | ----------------------------- | -------------------------------------- |
| tokensUsed       | number                        | Tokens consumed this session           |
| tokensTotal      | number                        | Total session token quota              |
| backtestsUsed    | number                        | Backtests run today                    |
| backtestsTotal   | number                        | Daily backtest quota                   |
| queuePosition    | number                        | Queue position (0 = currently running) |
| estimatedRuntime | string                        | Formatted estimate (e.g., `"~45s"`)    |
| complexityScore  | number                        | 0–100 strategy complexity score        |
| planImpact       | `'low' \| 'medium' \| 'high'` | Estimated billing impact               |

**Mock data module**: `src/lib/data/strategy.ts`  
**Used by**: `AIReviewSidebar` organism

---

## Entity: SentimentEvent

An event row in the Sentiment & Events table (FR-015).

| Field     | Type                                                                | Notes                                         |
| --------- | ------------------------------------------------------------------- | --------------------------------------------- |
| id        | string                                                              | Event identifier                              |
| type      | `'news' \| 'earnings' \| 'fed' \| 'macro' \| 'insider' \| 'social'` | Event category                                |
| symbol    | string                                                              | Related ticker (empty string if macro/global) |
| date      | string                                                              | ISO date string                               |
| headline  | string                                                              | Event summary text                            |
| sentiment | `'positive' \| 'negative' \| 'neutral'`                             | Sentiment classification                      |
| score     | number                                                              | Sentiment score, range -1.0 to 1.0            |

**Mock data module**: `src/lib/data/sentiment.ts`  
**Used by**: `SentimentEventsSection` organism

---

## Entity: ScreenerResult

A row in the Fundamental Screener results table (FR-009).

| Field         | Type   | Notes                                  |
| ------------- | ------ | -------------------------------------- |
| symbol        | string | Ticker symbol                          |
| name          | string | Company name                           |
| peRatio       | number | Price/Earnings ratio                   |
| evEbitda      | number | EV/EBITDA ratio                        |
| fcfYield      | number | Free cash flow yield percentage        |
| roic          | number | Return on invested capital percentage  |
| revenueGrowth | number | Revenue CAGR percentage                |
| epsGrowth     | number | EPS growth percentage                  |
| score         | number | Composite factor ranking score (0–100) |

**Mock data module**: `src/lib/data/market.ts`  
**Used by**: `FundamentalScreenerSection` organism, `ScreenerResultRow` molecule

---

## State Transitions

### Active Section

```
initial → 'dashboard' (default on load, FR-004)
activeSection → navigate(id) → id (any of 10 SectionIds)
any → 'strategy-builder' via: TopBar "Send to AI", Dashboard "Convert to Strategy", Quick Actions "New Strategy"
any → 'backtest-engine' via: Screener per-row "Backtest", Strategy Builder "Send to Backtest", Quick Actions "New Backtest"
```

### Language

```
initial → 'en' (default)
'en' → switchLocale('zh-TW') → 'zh-TW' [persists for session, no URL change]
'zh-TW' → switchLocale('en') → 'en'
```

### Metric Tile Order

```
initial → defaultOrder (8 tiles, order 0–7)
defaultOrder → dragDrop(fromIndex, toIndex) → newOrder
[persists in PerformanceResultSection $state for session; resets on page reload]
```

### Strategy Builder Input

```
initial → '' (empty)
any text entry → strategyText (persists for session)
"New Strategy" shortcut → '' (explicit reset via organism.reset(), FR-005 exception)
"Convert to Strategy" from Dashboard (non-empty text) → strategyText pre-filled
```

### Backtest Engine Params

```
initial → defaults (initial capital, date range, etc.)
any change → updated params (persists for session)
Screener "Backtest" row click → mode='Single Stock', symbol=selectedSymbol (nav + pre-fill)
"New Backtest" shortcut → defaults (explicit reset via organism.reset(), FR-005 exception)
```

---

## Mock Data Inventory

| Module                        | Contents                                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/data/market.ts`      | 8+ `MarketMetric` tiles, 7+ `MarketRegime` cards, `ScreenerResult[]` (10+ rows)                                             |
| `src/lib/data/performance.ts` | `BacktestResult` with chart series, 8 `MetricTile` definitions, `RegimeBreakdown[]` (4+ rows), full perf summary table data |
| `src/lib/data/trades.ts`      | `TradeRecord[]` (15–20 sample trades)                                                                                       |
| `src/lib/data/sentiment.ts`   | `SentimentEvent[]` (10+ rows covering all event types)                                                                      |
| `src/lib/data/strategy.ts`    | Sample `Strategy`, `AIReview` (B+ grade, medium confidence, 3 `RiskFlag` items), `ResourceUsage`                            |
