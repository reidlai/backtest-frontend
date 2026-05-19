# Strategy Definition

Defining a strategy for a backtest requires translating a conceptual trading or investment idea into a strict, programmatic blueprint. Computers cannot interpret nuance or intuition — they require absolute certainty. If a rule can be interpreted in two different ways, the backtest will fail or produce inaccurate results.

A complete, machine-readable strategy is built from seven layers:

1. Universe & Asset Selection
2. Signal Generation
3. Entry Execution Rules
4. Position Sizing & Risk Management
5. Exit Execution Rules
6. Execution Cost & Rebalance Model
7. Structured Strategy Object (Serialisable Schema)

---

## 1. Universe & Asset Selection

Before writing any signal rules, strictly define **what** you are allowed to trade and **at what resolution**.

### 1.1 Market

Declare the exchange jurisdiction the strategy operates in. This determines data sources, trading hours, currency, and regulatory constraints.

| Market | Coverage                                                     |
| ------ | ------------------------------------------------------------ |
| **US** | NYSE, NASDAQ, AMEX — all US-listed equities                  |
| **HK** | HKEX — Hong Kong-listed equities including H-shares and ETFs |

### 1.2 Scope / Backtest Mode

| Mode                     | Description                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| **Single Stock**         | One specific ticker; deepest per-asset analysis                        |
| **Watchlist**            | A fixed custom list of tickers                                         |
| **Screener Result**      | Dynamically filtered universe from a fundamental or technical screener |
| **Index Universe**       | Broad benchmark universe (see supported list below)                    |
| **Strategy Comparison**  | Multiple strategy variants run in parallel on the same universe        |
| **Benchmark Comparison** | Strategy equity curve overlaid against a passive Buy & Hold benchmark  |

### 1.3 Supported Universes

| Universe             | Market  | Description                                |
| -------------------- | ------- | ------------------------------------------ |
| **US All Stocks**    | US      | All exchange-listed US equities            |
| **S&P 500**          | US      | Large-cap US benchmark index               |
| **Nasdaq 100**       | US      | Top 100 non-financial Nasdaq-listed stocks |
| **Russell 1000**     | US      | Top 1,000 US stocks by market cap          |
| **Russell 2000**     | US      | Small-cap US benchmark index               |
| **HK All Stocks**    | HK      | All HKEX-listed equities                   |
| **Hang Seng Index**  | HK      | 80 large-cap HK benchmark constituents     |
| **Sector Universe**  | US / HK | All stocks within a single GICS sector     |
| **Custom Watchlist** | US / HK | User-defined fixed list of tickers         |

### 1.4 Liquidity Pre-Filter

Before applying any fundamental or technical screening, filter the raw universe down to **tradable** assets. This step prevents the engine from simulating trades in stocks that could not realistically be executed at the modelled size.

| Filter                      | Typical Threshold               | Purpose                                      |
| --------------------------- | ------------------------------- | -------------------------------------------- |
| **Minimum Price**           | Price > $1 (US) / HK$1 (HK)     | Exclude penny stocks and near-delisted names |
| **Minimum Average Volume**  | 20-day Avg Volume > 500K shares | Ensures sufficient daily liquidity           |
| **Minimum Market Cap**      | Market Cap > $100M              | Avoids micro-cap illiquidity                 |
| **Exchange Listing Status** | Active listing only             | Excludes suspended or delisted stocks        |

All four filters should be evaluated using **point-in-time data** — the values that were observable on the signal date, not today's values — to avoid survivorship bias.

### 1.5 Static vs. Dynamic Universe

- **Static:** A fixed list of assets defined once at the start of the backtest (e.g. `["AAPL", "MSFT", "NVDA"]`). Simple but does not adapt to changing market membership.
- **Dynamic:** Assets re-selected each rebalance period based on screening criteria. Requires point-in-time index membership and financial data to avoid look-ahead bias.

### 1.6 Data Resolution (Timeframe)

| Timeframe        | Typical Use Case                                            |
| ---------------- | ----------------------------------------------------------- |
| **Daily (EOD)**  | Swing trading, fundamental + technical strategies           |
| **Hourly**       | Intraday trend-following, shorter holding periods           |
| **15-Minute**    | Active intraday strategies                                  |
| **1-Minute**     | High-frequency and scalping strategies                      |
| **Tick-by-Tick** | Order book strategies, ultra-short-term execution modelling |

### 1.7 Trade Direction Scope

Declare upfront which directions the strategy is permitted to trade:

- **Long Only** — Buy and hold until exit conditions trigger. Profits when price rises.
- **Short Only** — Borrow and sell; buy back to close. Profits when price falls.
- **Long + Short** — Both directions active simultaneously or in different market conditions.

Choosing Long + Short requires defining independent signal, sizing, and exit rules for each direction (see Sections 2–5).

### 1.8 Factor Ranking System

When the screened universe returns more candidates than the portfolio can hold simultaneously, a **Factor Ranking System** determines priority. Each candidate is scored across multiple factors; the highest-scoring stocks are selected first.

| Factor             | What It Measures                                                               | Example Weight |
| ------------------ | ------------------------------------------------------------------------------ | -------------- |
| **Value Score**    | Valuation attractiveness vs peers (PE, EV/EBITDA, FCF Yield)                   | 30%            |
| **Quality Score**  | Balance sheet and profitability strength (ROIC, Gross Margin, Debt/Equity)     | 30%            |
| **Growth Score**   | Revenue and earnings growth trajectory (Revenue CAGR 3Y, EPS Growth)           | 20%            |
| **Momentum Score** | Recent price performance relative to universe (12-1 month return, RSI ranking) | 20%            |

The weights are configurable. The composite score determines trade entry order when capital is constrained — the highest-ranked qualifying stock is entered first.

---

## 2. Signal Generation (The Setup)

The signal is the condition that tells the engine to **look for a trade**. It must be mathematically unambiguous.

### 2.1 Fundamental Filters

Fundamental filters screen the universe by company financial health before any technical signal is checked. They are evaluated on the most recently available point-in-time financial data.

#### Valuation

Assess whether the stock is priced attractively relative to its earnings, assets, or cash flows.

| Metric                  | Description                                  |
| ----------------------- | -------------------------------------------- |
| **PE Ratio**            | Price ÷ Trailing 12-month EPS                |
| **Forward PE**          | Price ÷ Next 12-month consensus EPS estimate |
| **Price-to-Book (PB)**  | Price ÷ Book Value per Share                 |
| **Price-to-Sales (PS)** | Market Cap ÷ Revenue                         |
| **EV/EBITDA**           | Enterprise Value ÷ EBITDA                    |
| **PEG Ratio**           | PE ÷ EPS Growth Rate                         |
| **FCF Yield**           | Free Cash Flow per Share ÷ Price             |
| **Dividend Yield**      | Annual Dividend per Share ÷ Price            |
| **Sector-Relative PE**  | Company PE vs median PE of its GICS sector   |

#### Profitability / Quality

Assess the business's ability to generate sustainable returns on capital.

| Metric                 | Description                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| **Gross Margin**       | (Revenue − COGS) ÷ Revenue                                            |
| **Operating Margin**   | Operating Income ÷ Revenue                                            |
| **Net Margin**         | Net Income ÷ Revenue                                                  |
| **ROE**                | Net Income ÷ Shareholders' Equity                                     |
| **ROA**                | Net Income ÷ Total Assets                                             |
| **ROIC**               | NOPAT ÷ Invested Capital                                              |
| **FCF Margin**         | Free Cash Flow ÷ Revenue                                              |
| **Earnings Stability** | Standard deviation of EPS over trailing 5 years (lower = more stable) |

#### Growth

Assess the company's revenue, earnings, and cash flow trajectory.

| Metric                 | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| **Revenue Growth YoY** | Year-over-year revenue change                                               |
| **Revenue CAGR 3Y**    | Compound annual revenue growth over 3 years                                 |
| **EPS Growth**         | Year-over-year EPS change                                                   |
| **EBITDA Growth**      | Year-over-year EBITDA change                                                |
| **FCF Growth**         | Year-over-year free cash flow change                                        |
| **Analyst Revision**   | Net direction of analyst EPS estimate revisions (Upgrades minus Downgrades) |

#### Balance Sheet / Debt

Assess financial leverage and solvency risk.

| Metric                | Description                          |
| --------------------- | ------------------------------------ |
| **Debt/Equity**       | Total Debt ÷ Shareholders' Equity    |
| **Net Debt/EBITDA**   | (Total Debt − Cash) ÷ EBITDA         |
| **Current Ratio**     | Current Assets ÷ Current Liabilities |
| **Interest Coverage** | EBIT ÷ Interest Expense              |
| **Cash/Debt**         | Cash & Equivalents ÷ Total Debt      |

#### Writing Precise Fundamental Conditions

```
Fundamental Filter (Long Entry):
  PE < Sector_Median_PE
  AND Revenue_Growth_YoY > 0.15
  AND ROIC > 0.10
  AND Debt_Equity < 1.0
  AND Analyst_Revision > 0        # more upgrades than downgrades
```

### 2.2 Technical Indicators

Technical signals are computed from price and volume data at the chosen timeframe. Organise indicators by their functional category.

#### Trend Indicators

Identify the prevailing direction of price movement.

| Indicator                            | Common Signal                                                   |
| ------------------------------------ | --------------------------------------------------------------- |
| **SMA (Simple Moving Average)**      | Price > SMA(200) — uptrend confirmation                         |
| **EMA (Exponential Moving Average)** | EMA(20) crosses above EMA(50) — trend acceleration              |
| **MACD**                             | MACD Line crosses above Signal Line — bullish momentum shift    |
| **ADX (Average Directional Index)**  | ADX > 25 — strong trend present regardless of direction         |
| **Ichimoku Cloud**                   | Price above Cloud (Kumo) — bullish trend; below Cloud — bearish |

#### Momentum Indicators

Measure the speed and strength of price movement.

| Indicator                         | Common Signal                                                         |
| --------------------------------- | --------------------------------------------------------------------- |
| **RSI (Relative Strength Index)** | RSI < 30 — oversold (long entry); RSI > 70 — overbought (short entry) |
| **Stochastic Oscillator**         | %K crosses above %D below 20 — oversold reversal                      |
| **ROC (Rate of Change)**          | ROC > 5% — positive momentum; ROC < −5% — negative momentum           |
| **CCI (Commodity Channel Index)** | CCI < −100 — oversold; CCI > +100 — overbought                        |

#### Volatility Indicators

Measure price variability and identify breakout or compression conditions.

| Indicator                      | Common Signal                                                              |
| ------------------------------ | -------------------------------------------------------------------------- |
| **ATR (Average True Range)**   | ATR rising — volatility expanding; used for stop sizing                    |
| **Bollinger Bands**            | Price touches lower band — potential mean-reversion long entry             |
| **Historical Volatility (HV)** | HV percentile > 80% — high vol regime; < 20% — compression before breakout |
| **Keltner Channel**            | Price breakout above upper channel — strong trend continuation signal      |

#### Volume Indicators

Confirm price moves with participation data.

| Indicator                                | Common Signal                                                               |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| **Volume Spike**                         | Volume > 2× 20-day average — institutional activity, confirms breakout      |
| **OBV (On-Balance Volume)**              | OBV rising while price rises — accumulation; divergence signals weakness    |
| **VWAP**                                 | Price above VWAP — intraday bullish bias; below VWAP — bearish              |
| **A/D Line (Accumulation/Distribution)** | A/D rising — buying pressure; A/D falling despite price rise — distribution |

### 2.3 Pattern Recognition

Structural price patterns identify high-probability setups based on historical price geometry.

| Pattern                      | Direction          | Description                                                                 |
| ---------------------------- | ------------------ | --------------------------------------------------------------------------- |
| **Double Bottom**            | Bullish reversal   | Price tests a support level twice then breaks higher — confirms demand      |
| **Double Top**               | Bearish reversal   | Price tests a resistance level twice then breaks lower — confirms supply    |
| **Breakout**                 | Trend continuation | Price closes above a defined resistance level on elevated volume            |
| **Pullback**                 | Trend continuation | Price retraces to a support level within an uptrend before resuming higher  |
| **Gap Up / Gap Down**        | Momentum           | Opening price gaps above (bullish) or below (bearish) prior close           |
| **Higher High / Higher Low** | Bullish structure  | Each successive swing high and low is above the prior — uptrend structure   |
| **Lower High / Lower Low**   | Bearish structure  | Each successive swing high and low is below the prior — downtrend structure |

### 2.4 Writing Precise Signal Conditions

| Quality       | Example                                                |
| ------------- | ------------------------------------------------------ |
| ❌ Ambiguous  | "When momentum looks strong"                           |
| ✅ Definitive | `RSI(14) < 30 AND Close > SMA(200)`                    |
| ❌ Ambiguous  | "When the stock is oversold near support"              |
| ✅ Definitive | `RSI(14) < 35 AND Close > Lower_Bollinger_Band(20, 2)` |

### 2.5 Combined Fundamental + Technical Signal

The most robust signals combine both layers. Fundamental filters narrow the universe; technical conditions time the entry.

```
Long Entry:
  # Fundamental gate (evaluated weekly/monthly)
  PE < Sector_Median_PE
  AND Revenue_Growth_YoY > 0.15
  AND ROIC > 0.10
  AND Analyst_Revision >= 0

  # Technical trigger (evaluated daily)
  AND RSI(14) < 35
  AND Close > SMA(200)
  AND Volume > 1.5 × Volume_SMA(20)
```

### 2.6 Long vs. Short Signals

Define entry conditions independently for each direction:

```
Long Entry:  RSI(14) < 30 AND Price > EMA(200) AND ADX(14) > 20
Short Entry: RSI(14) > 70 AND Price < EMA(200) AND ADX(14) > 20
```

---

## 3. Entry Execution Rules

Once a signal fires, define **how** and **when** the order is placed. This is where execution realism matters most.

### 3.1 Order Types

| Order Type                  | How It Works                                                       | When to Use                                               |
| --------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| **Market Order**            | Fills immediately at the next available price after the bar closes | Default for most signal-based strategies                  |
| **Limit Order**             | Fills only if price reaches the specified limit level              | Reduces slippage; may miss trades if limit is not reached |
| **Stop Order**              | Triggers a market order once price crosses a stop level            | Momentum breakout entries                                 |
| **Stop Limit**              | Triggers a limit order once price crosses a stop level             | Breakout entries where partial fill control matters       |
| **Trailing Stop**           | Stop level advances with price; entry variant used for pyramiding  | Adding to winning positions                               |
| **Bracket Order**           | Entry + Stop Loss + Take Profit submitted as a single linked group | Fully automated risk-controlled entry                     |
| **OCO (One-Cancels-Other)** | Two orders linked; when one fills the other is cancelled           | Managing alternate exit scenarios                         |
| **Short Sell**              | Borrow shares and sell to open; buy back to close                  | Required for any short-side strategy                      |

### 3.2 Execution Timing

If your signal triggers on the close of Bar `t`, you have two realistic options:

- **Execute at Close of Bar `t`** — Only valid if the signal can be computed before the close (e.g. a pre-close RSI reading).
- **Execute at Open of Bar `t+1`** — The safer default; signal is confirmed on close of `t`, order placed at open of the next bar.

Using the close price of the same bar that triggered the signal without an explicit pre-close check is a form of look-ahead bias.

### 3.3 Commission Model

| Model          | Definition                    | Example          |
| -------------- | ----------------------------- | ---------------- |
| **Percentage** | Fee as % of trade value       | 0.1% per side    |
| **Fixed Flat** | Fixed dollar amount per order | $1.00 per trade  |
| **Per Share**  | Fixed amount per share traded | $0.005 per share |

### 3.4 Slippage Model

| Model          | Definition                             | Best For                                  |
| -------------- | -------------------------------------- | ----------------------------------------- |
| **Percentage** | Fixed % away from bar price            | Liquid large-cap equities                 |
| **Fixed**      | Fixed dollar amount per share          | Stable, predictable spread instruments    |
| **ATR-Based**  | Slippage scales with recent volatility | Realistic for volatile or illiquid assets |

---

## 4. Position Sizing & Risk Management

Position sizing determines **how much capital** is allocated to each trade. A strategy with a 70% win rate can still produce a catastrophic loss with careless sizing.

### 4.1 Sizing Methods

| Method                     | Definition                                                | Example                                                                                 |
| -------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Fixed Capital**          | Same dollar amount every trade                            | $5,000 per trade regardless of portfolio size                                           |
| **Fixed % of Equity**      | Fraction of current total portfolio value                 | 10% of current equity per trade                                                         |
| **Volatility-Based (ATR)** | Position size inversely proportional to recent volatility | `Shares = (Portfolio × Risk%) / (N × ATR(14))` where N is the ATR multiple for the stop |

### 4.2 Long vs. Short Sizing

Position sizing rules should be defined separately for long and short trades. Short positions carry theoretically unlimited loss potential and typically warrant tighter sizing than equivalent long positions.

### 4.3 Portfolio-Level Constraints

- **Maximum Concurrent Positions** — Cap the number of open trades at any time (e.g. no more than 10 simultaneous positions).
- **Maximum Sector / Asset Concentration** — Limit exposure to any single sector or correlated group.
- **Maximum Capital Deployed** — Set a ceiling on total invested capital as a percentage of the portfolio (e.g. never more than 80% deployed).

---

## 5. Exit Execution Rules

A strategy without defined exits is not a strategy — it is open-ended speculation. Define exits for all scenarios.

### 5.1 Stop-Loss (Risk Mitigation)

- **Hard Stop (Fixed %):**

  ```
  Exit Long  if Close < Entry_Price × (1 - 0.08)   # 8% loss
  Exit Short if Close > Entry_Price × (1 + 0.08)   # 8% adverse move
  ```

- **ATR-Based Stop (Volatility-Proportional):**
  ```
  Exit Long  if Close < Entry_Price - (2 × ATR(14))
  Exit Short if Close > Entry_Price + (2 × ATR(14))
  ```

### 5.2 Trailing Stop (Lock In Gains)

- **Long Trailing Stop:**

  ```
  Stop_Level = max(Close over holding period) × (1 - 0.05)   # 5% below peak
  ```

- **Short Trailing Stop:**
  ```
  Stop_Level = min(Close over holding period) × (1 + 0.05)   # 5% above trough
  ```

### 5.3 Profit Target (Capital Capture)

- **Fixed % Target:**

  ```
  Exit Long  if Close > Entry_Price × (1 + 0.18)   # 18% gain
  Exit Short if Close < Entry_Price × (1 - 0.18)
  ```

- **Signal-Based Target:**

  ```
  Exit Long  if RSI(14) > 70
  Exit Short if RSI(14) < 30
  ```

- **ATR-Based Target (Reward-to-Risk Ratio):**
  ```
  Exit Long  if Close > Entry_Price + (4 × ATR(14))   # 2:1 R:R with a 2×ATR stop
  ```

### 5.4 Time-Based Exit (Stagnation Safety Valve)

Close any position that has not hit its stop or profit target within a defined holding period. This prevents capital being tied up indefinitely in stalled trades.

```
Exit if Holding_Days >= 10 AND position is still open
```

### 5.5 Exit Reason Taxonomy

Every closed trade must carry one of the following exit reasons in the trade log:

| Exit Reason       | Trigger                                                               |
| ----------------- | --------------------------------------------------------------------- |
| **Take Profit**   | Price reached the fixed or signal-based profit target                 |
| **Stop Loss**     | Price crossed the hard stop level                                     |
| **Trailing Stop** | Price reversed from the high-water mark beyond the trailing threshold |
| **Time-Based**    | Maximum holding period elapsed with no other trigger                  |
| **Signal**        | A separate exit signal condition fired (e.g. RSI reversal)            |

---

## 6. Execution Cost & Rebalance Model

### 6.1 Rebalance Frequency

For portfolio strategies (Watchlist, Index Universe), define how often position weights are recalculated:

| Frequency        | Description                                           | Typical Use                              |
| ---------------- | ----------------------------------------------------- | ---------------------------------------- |
| **Daily**        | Weights recalculated every bar                        | Momentum factor, high-turnover models    |
| **Weekly**       | Recalculated every 5 trading days                     | Medium-term trend strategies             |
| **Monthly**      | Recalculated on the first bar of each month           | Factor investing, fundamental strategies |
| **Event-Driven** | Triggered by a signal change, not a calendar schedule | Signal-based rebalancing                 |

Each rebalance incurs commission and slippage on every adjusted position.

### 6.2 Full Cost Application Checklist

Every simulated fill — entry, exit, or rebalance — must apply:

- [ ] Commission (Percentage / Fixed / Per Share)
- [ ] Slippage (Percentage / Fixed / ATR-Based)
- [ ] Short borrowing cost (for short positions held overnight — annualised fee applied daily)

---

## 7. Structured Strategy Object (Serialisable Schema)

A complete strategy must be expressible as a structured data object that can be stored in a database, sent to an API, or reproduced exactly by another system. Every field must have a value — no ambiguity, no free-text prose.

```json
{
	"strategy_name": "US Value-Momentum RSI Strategy",
	"version": "1.0",

	"universe": {
		"market": "US",
		"scope": "Screener Result",
		"base_universe": "S&P 500",
		"liquidity_filter": {
			"min_price": 10,
			"min_avg_volume_20d": 500000,
			"min_market_cap": 100000000
		},
		"universe_type": "Dynamic",
		"backtest_period": "2014-01-01 to 2026-05-14"
	},

	"ranking": {
		"value_score_weight": 0.3,
		"quality_score_weight": 0.3,
		"growth_score_weight": 0.2,
		"momentum_score_weight": 0.2,
		"max_positions": 10
	},

	"fundamental_filter": {
		"valuation": {
			"pe_vs_sector": "< sector_median",
			"ev_ebitda": "< 15"
		},
		"quality": {
			"roic": "> 0.10",
			"gross_margin": "> 0.40"
		},
		"growth": {
			"revenue_growth_yoy": "> 0.15",
			"analyst_revision": ">= 0"
		},
		"debt": {
			"debt_equity": "< 1.0",
			"interest_coverage": "> 3"
		}
	},

	"technical_filter": {
		"trend": "Close > SMA(200)",
		"momentum": "RSI(14) < 35",
		"volume": "Volume > 1.5 * Volume_SMA(20)"
	},

	"entry": {
		"direction": "Long Only",
		"order_type": "Market",
		"execution_timing": "Open of Bar t+1",
		"commission_model": "Percentage",
		"commission_rate": 0.001,
		"slippage_model": "ATR-Based",
		"slippage_atr_multiple": 0.5
	},

	"position_sizing": {
		"method": "Fixed % of Equity",
		"size_pct": 0.1,
		"max_concurrent_positions": 10,
		"max_sector_concentration_pct": 0.3,
		"max_capital_deployed_pct": 0.8
	},

	"exit": {
		"stop_loss": {
			"type": "Hard",
			"pct": 0.08
		},
		"take_profit": {
			"type": "Fixed %",
			"pct": 0.18
		},
		"trailing_stop": {
			"enabled": true,
			"pct_from_peak": 0.05
		},
		"time_based": {
			"enabled": true,
			"max_holding_days": 20
		}
	},

	"rebalance": {
		"frequency": "Monthly",
		"short_borrow_cost_annual": null
	},

	"data_resolution": "Daily",
	"initial_capital": 100000
}
```

This schema is the single source of truth for a strategy run. Any change — however small — must produce a new `version` so that backtest results remain reproducible and auditable.

---

## Putting It Together: Blueprint Examples

### Example A — Long-Only Fundamental + Technical Strategy

| Component                | Specification                                                           |
| ------------------------ | ----------------------------------------------------------------------- |
| **Market**               | US                                                                      |
| **Universe**             | S&P 500 — Dynamic, filtered by liquidity (Price > $10, Vol > 500K)      |
| **Ranking**              | Value 30% / Quality 30% / Growth 20% / Momentum 20%                     |
| **Fundamental Filter**   | PE < Sector Median; Revenue Growth > 15%; ROIC > 10%; Debt/Equity < 1.0 |
| **Technical Signal**     | RSI(14) < 35 AND Close > SMA(200) AND Volume > 1.5× avg                 |
| **Pattern Confirmation** | Pullback to SMA(50) support within uptrend (HH/HL structure)            |
| **Data Resolution**      | Daily bars                                                              |
| **Direction**            | Long Only                                                               |
| **Order Type**           | Market Order at Open of next bar                                        |
| **Position Sizing**      | 10% of current portfolio equity; max 10 positions                       |
| **Exit — Stop Loss**     | Hard stop at Entry_Price × 0.92 (8%)                                    |
| **Exit — Take Profit**   | Entry_Price × 1.18 (18%)                                                |
| **Exit — Trailing Stop** | 5% below rolling peak                                                   |
| **Exit — Time-Based**    | Close if open > 20 trading days                                         |
| **Commission**           | 0.1% per side                                                           |
| **Slippage**             | ATR-Based (0.5 × ATR(14))                                               |
| **Rebalance**            | Monthly                                                                 |

### Example B — Long + Short Mean-Reversion Strategy

| Component                      | Specification                                                    |
| ------------------------------ | ---------------------------------------------------------------- |
| **Market**                     | US                                                               |
| **Universe**                   | Nasdaq 100 — Static list                                         |
| **Liquidity Filter**           | Price > $10, Avg Volume > 1M                                     |
| **Technical Signal (Long)**    | RSI(14) < 30 AND Close > SMA(200) AND Bollinger lower band touch |
| **Technical Signal (Short)**   | RSI(14) > 70 AND Close < SMA(200) AND Bollinger upper band touch |
| **Data Resolution**            | Daily bars                                                       |
| **Direction**                  | Long + Short                                                     |
| **Order Type**                 | Market Order; Short Sell for short entries                       |
| **Position Sizing (Long)**     | 10% of equity                                                    |
| **Position Sizing (Short)**    | 5% of equity                                                     |
| **Exit — Stop Loss (Long)**    | Entry_Price × 0.92                                               |
| **Exit — Stop Loss (Short)**   | Entry_Price × 1.08                                               |
| **Exit — Take Profit (Long)**  | RSI(14) > 70                                                     |
| **Exit — Take Profit (Short)** | RSI(14) < 30                                                     |
| **Exit — Trailing Stop**       | 5% from peak (long) / 5% from trough (short)                     |
| **Exit — Time-Based**          | Close if open > 15 trading days                                  |
| **Commission**                 | 0.1% per side                                                    |
| **Slippage**                   | 0.05% fixed                                                      |
| **Short Borrow Cost**          | 1.5% annualised, applied daily                                   |
| **Rebalance**                  | N/A (signal-driven)                                              |
