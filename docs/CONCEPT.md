# Backtesting — Concept Overview

---

## WHAT Is Backtesting?

Backtesting is the process of replaying a trading strategy against historical market data to evaluate how it would have performed in the past. The engine simulates every buy and sell decision the strategy would have made, records every fill with realistic costs, and produces a full performance report — all without risking a single dollar of real capital.

In short, backtesting answers: **"Would this strategy have made money, and at what risk?"**

---

## WHY Does Backtesting Matter?

Live markets are unforgiving. A strategy that sounds compelling in theory can fail immediately in practice for reasons that are entirely preventable — wrong position sizing, no stop-loss discipline, a rule that only worked during one specific market regime.

Backtesting matters because it:

- **Validates ideas before capital is at risk.** A strategy must earn the right to go live by surviving historical scrutiny first.
- **Quantifies risk, not just return.** A 50% annual return means nothing if it came with a 70% drawdown that would have caused any rational investor to abandon the strategy mid-run.
- **Exposes hidden dependencies.** Many strategies only work in bull markets, or only when volatility is low. Backtesting across different regimes surfaces these fragilities.
- **Forces precision.** You cannot backtest a vague idea. The act of writing machine-readable rules eliminates ambiguity and forces the strategist to think rigorously.
- **Enables systematic comparison.** Multiple strategy variants, parameter sets, or universes can be evaluated side-by-side on the same data — something impossible to do fairly in live trading.

---

## WHEN Should You Run a Backtest?

| Situation                              | Why Backtesting Is the Right Tool                                      |
| -------------------------------------- | ---------------------------------------------------------------------- |
| Before deploying any new strategy      | Baseline validation before any live capital commitment                 |
| After changing strategy parameters     | Confirms whether the change improves or degrades performance           |
| After a major market regime shift      | Re-validates whether existing strategies remain relevant               |
| When comparing two or more strategies  | Provides an objective, apples-to-apples scorecard                      |
| When evaluating risk rule changes      | Quantifies the impact of different stop-loss or position-size settings |
| For regulatory or institutional review | Provides a documented, reproducible performance record                 |

---

## WHERE Does Backtesting Apply?

Backtesting is not limited to a single stock or a single market. The scope — called the **backtest mode** — determines what universe the strategy runs against:

- **Single Stock** — Deepest analysis of one specific ticker, ideal for validating a thesis about a particular company or instrument.
- **Watchlist** — Runs the strategy across a curated set of tickers; useful for sector-focused or thematic strategies.
- **Screener Result** — Feeds a dynamically filtered universe (e.g. "all S&P 500 stocks with PE < 15 and Revenue Growth > 15%") directly into the engine; strategy and stock selection work as a combined system.
- **Index Universe** — Tests against a broad market benchmark universe (S&P 500, Nasdaq 100, Hang Seng); reveals how the strategy performs across the full market cycle.
- **Strategy Comparison** — Runs multiple strategy variants in parallel on the same universe so performance differences are attributable solely to the strategy, not the market.
- **Benchmark Comparison** — Overlays the strategy equity curve against a passive Buy & Hold benchmark to measure whether the strategy generates genuine alpha or simply mirrors the market.

---

## HOW Does the Backtesting Process Work?

The backtesting pipeline has eight stages. For detailed implementation guidance on defining each component, see [STRATEGY_DEFINITION.md](./STRATEGY_DEFINITION.md).

### 1. Define the Strategy

Translate a trading idea into strict, unambiguous, machine-readable rules covering signal conditions, order execution, position sizing, and exit logic. A rule that requires human judgment cannot be backtested — it must be expressible as code.

### 2. Configure the Simulation Parameters

Set the boundaries of the simulation: the historical date range, the starting capital, the market and timeframe, and the execution cost model (commission structure and slippage assumption). These inputs directly affect every output metric — a backtest with no slippage assumption is not realistic.

### 3. Choose Order Types and Execution Model

Decide how simulated orders are filled. Market orders fill immediately at the bar price; limit orders only fill if the market reaches a target price; stop and trailing-stop orders protect against adverse moves; bracket orders combine entry, stop-loss, and take-profit in a single instruction. The choice of order type changes both the realism of the simulation and the strategy's measured performance.

### 4. Run the Engine

The engine iterates through the historical data bar by bar, in strict chronological order. At each bar, it checks entry conditions, manages open positions against exit rules, applies commission and slippage on every fill, and records the resulting portfolio value. No future data is ever visible during this pass.

### 5. Evaluate Performance Metrics

The engine produces a comprehensive report across four dimensions:

- **Return metrics** — Total Return, CAGR, Net Profit, Gross Profit/Loss, Alpha vs benchmark
- **Risk metrics** — Maximum Drawdown, Drawdown Duration, Recovery Time, Annualised Volatility, Beta
- **Risk-adjusted metrics** — Sharpe Ratio, Sortino Ratio, Calmar Ratio
- **Trade quality metrics** — Win Rate, Profit Factor, Payoff Ratio, Average Win/Loss, Total Trades, Exposure Time, Turnover

For strategies that trade both long and short, all metrics should also be broken down by direction so that the long-side and short-side performance can be evaluated independently.

### 6. Inspect the Trade Log

Every completed round-trip (entry to exit) is recorded as a single row. The log captures the symbol, direction (long/short), entry and exit dates and prices, quantity, commission, slippage, net P&L, percentage return, holding duration, and — critically — the **exit reason** (Take Profit, Stop Loss, Trailing Stop, Time-Based, or Signal). Exit reasons reveal whether a strategy's profits come from disciplined profit-taking or from stops being hit less often than expected.

### 7. Benchmark and Regime Analysis

Plot the equity curve against a passive benchmark to confirm genuine alpha. Then break down performance by the **market regime** that was active during each trade — Bull, Bear, High Volatility, Low Volatility, Risk-On, Risk-Off, Inflation Shock, Rate Cut Cycle. A strategy that shows strong overall returns but collapses in Bear or High Volatility regimes is regime-dependent, not robust.

### 8. Iterate and Validate

A single backtest run is not a conclusion. Test across multiple date ranges (in-sample vs out-of-sample). Vary parameters to check sensitivity. Run walk-forward validation to confirm the strategy adapts rather than fits. Only after surviving this process should a strategy be considered for live deployment.

---

## The Limitations and Pitfalls of Backtesting

A strong backtest result does not guarantee future profits. The gap between simulation and live markets is caused by well-understood, avoidable traps.

### 1. Overfitting (Curve Fitting)

Tuning a strategy's parameters until it perfectly explains the past is not skill — it is memorisation. An overfitted strategy has no predictive power for data it has never seen. The more parameters a strategy has, and the shorter the test period, the higher the overfitting risk.

### 2. Look-Ahead Bias

A strategy inadvertently uses information that would not have been available at the time of the simulated trade. Common examples include using end-of-day closing prices to generate signals that would have needed intraday execution, or using annual earnings data on a date before the filing was publicly released.

### 3. Ignoring Market Friction

Perfect simulation execution does not exist in real markets. Every trade incurs commissions and fees. Every large order moves the market against you (slippage). Thinly traded assets may not be fillable at the simulated price at all. A backtest without realistic cost assumptions will always overstate returns.

### 4. Survivorship Bias

Testing a strategy on today's S&P 500 components means testing only on the companies that survived the entire period. Every company that was delisted, went bankrupt, or was removed from the index is absent from the data — and those are exactly the companies a bad strategy would have bought. This silently inflates simulated returns.

### 5. Regime Dependency

A strategy may owe its entire historical return to a single favourable market regime. Without per-regime performance analysis, this dependency is invisible in the aggregate numbers. The strategy appears robust but will underperform or fail the moment the regime changes.
