# FSM Architecture

When translating a strategy definition into code, the cleanest approach is to treat it as a **deterministic finite state machine (FSM)**. A properly designed FSM ensures that the system can only ever be in one state at a time — eliminating race conditions, phantom orders, double-buying, and orphaned positions without a stop-loss. Because invalid state transitions are structurally impossible, catastrophic production bugs become a compile-time or design-time problem rather than a runtime surprise.

From an architectural standpoint, a production-grade strategy implementation is separated into three core decoupled layers: the **Data Engine**, the **Strategy FSM**, and the **Execution Engine**. All three layers are configured by a **Structured Strategy Object** — the single serialisable source of truth for a backtest run (see [STRATEGY_DEFINITION.md §7](./STRATEGY_DEFINITION.md)).

---

## 1. Architectural Blueprint

The strategy itself is a pure logical layer that takes data snapshots as inputs and emits actionable order intents as outputs. Keeping this layer stateless with respect to market data (all state lives in the FSM, not in the data stream) makes it fully unit-testable in isolation.

```
+-------------------------+
|  Structured Strategy    |   (STRATEGY_DEFINITION.md §7)
|  Object (JSON config)   |
+-------------------------+
             |  configure
             v
+------------------+      Bar / Tick      +--------------------+
|   Data Engine    | -------------------> |   Strategy FSM     |
| (Historical/Live)|                      | (Tracks State /    |
+------------------+                      |  Indicators)       |
                                          +--------------------+
                                                    |
                                                    | Order Intent
                                                    v
+------------------+    Execution Report  +--------------------+
|  Broker/Sandbox  | <------------------- |  Execution Engine  |
|  (Backtester)    |                      | (Sizing/Slippage)  |
+------------------+                      +--------------------+
```

1. **The Data Engine** — Feeds market data into the strategy. In a backtest, this reads from an immutable database or CSV stream in strict chronological order. In live production, this wraps a WebSocket or REST polling connection.
2. **The Strategy FSM** — Holds the internal state of indicators and current positions. It receives data bars, evaluates signal rules, and emits transitions to the next state.
3. **The Execution Engine** — Takes an abstract order intent from the strategy (e.g. *"I want to risk 2% on Asset X"*), calculates the exact share quantity based on current portfolio equity, applies simulated slippage and commission, and dispatches it to the broker or backtest sandbox.

The **Structured Strategy Object** (STRATEGY_DEFINITION.md §7) is loaded once at engine startup and serves as the immutable configuration contract for the entire run. Every parameter — universe definition, signal conditions, position sizing method, exit thresholds, commission model — is read from this object. Any parameter change must produce a new version so that results remain reproducible and auditable.

### Position within the Backtesting Pipeline

The FSM architecture implements Stages 3 and 4 of the eight-stage backtesting pipeline defined in [CONCEPT.md](./CONCEPT.md). The table below shows where every stage is handled.

| Stage | Description (CONCEPT.md) | Handled By |
|---|---|---|
| **1. Define the Strategy** | Translate trading idea into machine-readable rules | Structured Strategy Object — STRATEGY_DEFINITION.md §1–6 |
| **2. Configure Parameters** | Date range, starting capital, market, timeframe, cost model | Structured Strategy Object fields (`backtest_period`, `initial_capital`, `data_resolution`, commission + slippage models) |
| **3. Choose Order Types** | Market, Limit, Stop, Bracket, OCO, Short Sell | FSM §6 — Order Type Effects on State Transitions |
| **4. Run the Engine** | Bar-by-bar simulation; fills with costs; portfolio value recorded | FSM §2–9 — Portfolio Execution Loop + Per-Asset State Machine |
| **5. Evaluate Performance Metrics** | Return, risk, risk-adjusted, trade quality metrics | Engine output: metrics computed from the completed trade log and equity curve |
| **6. Inspect the Trade Log** | Every round-trip recorded with exit reason | Engine output: each `PendingExit → Idle / Scanning` transition writes one trade record stamped with exit_reason |
| **7. Benchmark and Regime Analysis** | Equity curve vs benchmark; per-regime performance breakdown | Engine output: regime tags (FSM §2.5) + equity curve versus passive benchmark |
| **8. Iterate and Validate** | In-sample / out-of-sample; walk-forward validation | External process: re-run engine with modified strategy objects across different date ranges |

---

## 2. Portfolio Execution Loop

The per-asset FSM (Sections 3–4) manages the lifecycle of a single trade. Above it sits a **Portfolio Execution Loop** that governs the universe-level decisions: which assets are eligible, which are prioritised, and whether the portfolio has capacity to take a new position. This outer loop runs once per rebalance period (or once per bar for event-driven strategies).

```
  Structured Strategy Object
             |
             v
  1. Liquidity Pre-Filter  ─────────────────────── remove illiquid assets
     (STRATEGY_DEFINITION.md §1.4)                 (price, volume, mkt cap,
                                                    listing status)
             |
             v
  2. Signal Evaluation  ────────────────────────── fundamental + technical
     (STRATEGY_DEFINITION.md §2)                   scan across filtered universe

             |
             v
  3. Factor Ranking  ───────────────────────────── score & sort qualified
     (STRATEGY_DEFINITION.md §1.8)                 candidates
                                                    (Value 30% / Quality 30% /
                                                     Growth 20% / Momentum 20%)
             |
             v
  4. Portfolio Constraint Check  ───────────────── enforce max concurrent
     (STRATEGY_DEFINITION.md §4.3)                 positions, max sector
                                                    concentration, max capital
                                                    deployed
             |
             v
  5. Dispatch Per-Asset FSMs  ──────────────────── admit top-ranked candidates
                                                    into PendingEntry
```

### 2.1 Liquidity Pre-Filter

Before any signal logic runs, the raw universe is narrowed to **tradable** assets using point-in-time values (never today's values — that would introduce survivorship bias). The four mandatory gates are minimum price, minimum 20-day average volume, minimum market capitalisation, and active listing status (see STRATEGY_DEFINITION.md §1.4). Any asset failing any gate is excluded for the current period.

### 2.2 Signal Evaluation and Factor Ranking

Fundamental filters (STRATEGY_DEFINITION.md §2.1) are evaluated on the most recently available point-in-time financial data and act as a coarse gate. Technical indicators (§2.2) and pattern conditions (§2.3) are then evaluated on the price/volume series to time the entry. Assets that pass both layers are **qualified candidates**.

When the qualified candidate count exceeds the portfolio's `max_concurrent_positions` limit, the **Factor Ranking System** (§1.8) determines priority. Each candidate receives a composite score across Value (30%), Quality (30%), Growth (20%), and Momentum (20%). The highest-scoring candidates are admitted first; the rest remain in `Idle / Scanning` and are reconsidered at the next loop iteration.

### 2.3 Portfolio Constraint Check

Before dispatching a per-asset FSM into `PendingEntry`, the portfolio loop checks three hard constraints (STRATEGY_DEFINITION.md §4.3):

- **Maximum Concurrent Positions** — If the current open position count equals the cap, no new entry is dispatched regardless of signal strength.
- **Maximum Sector Concentration** — If the sector of the candidate already accounts for the maximum allowed exposure, the candidate is skipped.
- **Maximum Capital Deployed** — If current deployed capital as a percentage of total equity exceeds the ceiling, no new entry is dispatched until an existing position closes.

### 2.4 Rebalance Cycle

For portfolio strategies (Watchlist, Index Universe, Screener Result), positions are re-evaluated on a defined schedule — Daily, Weekly, Monthly, or Event-Driven (STRATEGY_DEFINITION.md §6.1). On each rebalance trigger:

1. Re-run the Liquidity Pre-Filter and Signal Evaluation across the universe.
2. Re-score all candidates with Factor Ranking.
3. For assets currently in `PositionOpen` that are no longer in the qualified and ranked set: dispatch a `RebalanceExit` event, close the position, and stamp the trade log with exit reason **Signal** (the strategy no longer selects this asset).
4. For newly qualified assets within the portfolio capacity: admit them into `PendingEntry`.

Each rebalance incurs commission and slippage on every adjusted position.

### 2.5 Regime Tagging

The CONCEPT.md pipeline (Stage 7) requires performance to be broken down by the market regime active during each trade — Bull, Bear, High Volatility, Low Volatility, Risk-On, Risk-Off, Inflation Shock, Rate Cut Cycle. To make this possible, the engine runs a **regime classifier** as a lightweight parallel process alongside the main strategy FSM.

The regime classifier reads the same bar feed and outputs one regime label per bar. That label is used in three ways:

1. **At `PendingEntry → PositionOpen`** — the active regime label is written to the position record as `entry_regime`. This captures the market condition under which the trade was opened.
2. **While `PositionOpen`** — on each bar, the current regime label is appended to a per-trade regime log. This tracks whether the regime changed during the holding period.
3. **At `PendingExit → Idle / Scanning`** — the dominant regime across the holding period is stamped on the closed trade record alongside the exit reason. The trade log then supports per-regime performance aggregation in Stage 7 analysis.

Regime classification is a separate configurable module. A common implementation uses a combination of rolling trend indicators (e.g. price vs SMA(200) for Bull/Bear), volatility percentile (e.g. VIX or 20-day HV percentile for High/Low Volatility), and macro signals (e.g. yield curve slope for Rate Cut Cycle). The classifier does not affect state transitions — it is read-only metadata attached to trades.

---

## 3. Defining the States

To manage a trade lifecycle flawlessly, the FSM must track both the **Strategy State** (the analytical thesis) and the **Execution State** (the actual broker orders) together in a single, explicit enum. Combining these prevents the two layers from falling out of sync.

Every asset tracked by the strategy navigates this strict lifecycle. Each state instance carries a `direction` field (`Long` or `Short`) so that a single state enum can serve both long and short positions without a separate machine:

- **`Idle / Scanning`** — The strategy is active, consuming market data bar by bar, and updating rolling indicators. It owns no positions and has no open orders. This is the only state from which an entry signal can trigger.
- **`PendingEntry(direction)`** — An entry signal was generated and an order was dispatched. The machine is waiting for an execution receipt. No new entry signals are evaluated while in this state.
- **`PositionOpen(direction)`** — The entry order was successfully filled. The machine switches exclusively to monitoring for exit conditions: Stop Loss, Trailing Stop, Take Profit, Time-Based, or Signal. Entry logic is bypassed entirely.
- **`PendingExit(direction, exit_reason)`** — An exit condition triggered a closing order. The machine is waiting for confirmation that the position is flat before returning to `Idle / Scanning`.

---

## 4. State Transition Matrix

The transition matrix is the rulebook governing how states change. Events drive transitions. If an event occurs that is not explicitly permitted in the current state, it must be safely rejected or logged as an anomaly.

### 4.1 Entry Transitions

| Current State | Event (Input) | Next State | Action / Side-Effect |
|---|---|---|---|
| **`Idle / Scanning`** | `MarketBarReceived` (Signal == False) | `Idle / Scanning` | Update rolling indicators and buffers. |
| **`Idle / Scanning`** | `MarketBarReceived` (Signal == True, Long) | **`PendingEntry(Long)`** | Calculate long position size; dispatch entry order. |
| **`Idle / Scanning`** | `MarketBarReceived` (Signal == True, Short) | **`PendingEntry(Short)`** | Calculate short position size; dispatch Short Sell order. |
| **`PendingEntry`** | `OrderExecutionReport` (Filled) | **`PositionOpen(direction)`** | Record entry price; set stop-loss / take-profit / trailing-stop thresholds. |
| **`PendingEntry`** | `OrderExecutionReport` (PartialFill) | `PendingEntry` | Update accumulated fill size; wait for order completion or timeout. |
| **`PendingEntry`** | `OrderExecutionReport` (Rejected / Cancelled) | **`Idle / Scanning`** | Log error; clear order tracking ID. |
| **`PendingEntry`** | `Timeout` | **`Idle / Scanning`** | Cancel outstanding order; log timeout; clear state. |

### 4.2 Exit Transitions

Each exit condition maps to a distinct event so that the exit reason is stamped precisely on the trade log (STRATEGY_DEFINITION.md §5.5).

| Current State | Event (Input) | Next State | Action / Side-Effect |
|---|---|---|---|
| **`PositionOpen`** | `MarketBarReceived` (no exit condition met) | `PositionOpen` | Update trailing stop high-water mark; continue monitoring all exit conditions. |
| **`PositionOpen`** | `MarketBarReceived` (Stop Loss hit) | **`PendingExit(exit_reason=StopLoss)`** | Dispatch close order; log exit_reason = **Stop Loss**. |
| **`PositionOpen`** | `MarketBarReceived` (Trailing Stop hit) | **`PendingExit(exit_reason=TrailingStop)`** | Dispatch close order; log exit_reason = **Trailing Stop**. |
| **`PositionOpen`** | `MarketBarReceived` (Take Profit hit) | **`PendingExit(exit_reason=TakeProfit)`** | Dispatch close order; log exit_reason = **Take Profit**. |
| **`PositionOpen`** | `MarketBarReceived` (max holding days reached) | **`PendingExit(exit_reason=TimeBased)`** | Dispatch close order; log exit_reason = **Time-Based**. |
| **`PositionOpen`** | `MarketBarReceived` (exit signal fired) | **`PendingExit(exit_reason=Signal)`** | Dispatch close order; log exit_reason = **Signal**. |
| **`PositionOpen`** | `RebalanceEvent` (asset no longer ranked) | **`PendingExit(exit_reason=Signal)`** | Dispatch close order; log exit_reason = **Signal** (strategy deselected asset). |
| **`PendingExit`** | `OrderExecutionReport` (Filled) | **`Idle / Scanning`** | Realise PnL; stamp exit reason in trade log; clear position memory. |
| **`PendingExit`** | `Timeout` | `PendingExit` | Escalate to aggressive market-order override; restart timeout. |

---

## 5. Direction-Aware State Logic

The state machine structure is identical for long and short positions. The direction field carried by `PendingEntry`, `PositionOpen`, and `PendingExit` changes which price comparisons trigger each exit event.

### 5.1 Long Positions

| Exit Condition | Trigger Rule |
|---|---|
| **Stop Loss** | `Close < Entry_Price × (1 − stop_pct)` or `Close < Entry_Price − N × ATR(14)` |
| **Trailing Stop** | `Close < max(Close since entry) × (1 − trail_pct)` |
| **Take Profit** | `Close > Entry_Price × (1 + target_pct)` or RSI-based signal condition |
| **Time-Based** | `Holding_Days >= max_holding_days` |
| **Signal** | Configurable exit indicator condition (e.g. `RSI(14) > 70`) |

Entry order: `Market Buy` or `Limit Buy`. Exit order: `Market Sell` or `Limit Sell`.

### 5.2 Short Positions

| Exit Condition | Trigger Rule |
|---|---|
| **Stop Loss** | `Close > Entry_Price × (1 + stop_pct)` or `Close > Entry_Price + N × ATR(14)` |
| **Trailing Stop** | `Close > min(Close since entry) × (1 + trail_pct)` |
| **Take Profit** | `Close < Entry_Price × (1 − target_pct)` or RSI-based signal condition |
| **Time-Based** | `Holding_Days >= max_holding_days` |
| **Signal** | Configurable exit indicator condition (e.g. `RSI(14) < 30`) |

Entry order: `Short Sell` (borrow shares; sell to open). Exit order: `Buy to Cover` (buy shares; return to lender). Short positions held overnight incur a borrowing cost applied daily at the annualised rate specified in the strategy object (STRATEGY_DEFINITION.md §6.2).

### 5.3 Long + Short Mode

When the strategy operates in `Long + Short` mode (STRATEGY_DEFINITION.md §1.7), both entry signals are evaluated in each `Idle / Scanning` pass:

- If `Long Entry Signal == True` and portfolio has long capacity → dispatch `PendingEntry(Long)`.
- If `Short Entry Signal == True` and portfolio has short capacity → dispatch `PendingEntry(Short)`.
- The two signal checks are independent; the same asset can simultaneously be in `PositionOpen(Long)` on one FSM instance and `PositionOpen(Short)` on another only if the strategy explicitly permits it — most mean-reversion strategies prohibit this.

Short positions carry theoretically unlimited loss potential and are typically sized at a smaller fraction of equity than equivalent long positions (STRATEGY_DEFINITION.md §4.2).

---

## 6. Order Type Effects on State Transitions

The order type selected in STRATEGY_DEFINITION.md §3.1 changes how `PendingEntry` resolves and how `PendingExit` is structured. The state names do not change — only the fill mechanics and the events that drive transitions.

### 6.1 Entry Order Types

| Order Type | Effect on `PendingEntry` Lifecycle |
|---|---|
| **Market Order** | Fills on the open of the next bar — 1-bar latency guaranteed. `PendingEntry` resolves in one tick. |
| **Limit Order** | Fills only if the bar's low (long entry) or high (short entry) touches the limit price. `PendingEntry` may persist across multiple bars. If not filled within a timeout window, a `Timeout` event fires and the machine returns to `Idle / Scanning`. |
| **Stop Order** | Activates when price crosses a threshold; immediately dispatches a market fill. `PendingEntry` resolves in the bar where the threshold is breached. |
| **Stop Limit Order** | Activates when the stop threshold is crossed; then fills only at the specified limit. Combines the persistence risk of a Limit with the threshold trigger of a Stop — timeout handling is required. |
| **Trailing Stop (Entry)** | The activation threshold advances in the strategy's favour as price moves. `PendingEntry` is not dispatched until the trailing stop level is breached. |

### 6.2 Exit Order Types

| Order Type | Effect on `PositionOpen` / `PendingExit` |
|---|---|
| **Market Order** | Default exit. `PendingExit` resolves in one bar at the next open price. |
| **Bracket Order** | At the `PendingEntry → PositionOpen` transition, the broker pre-registers a linked Stop Loss order and a Take Profit order as a single group. While `PositionOpen`, both legs are live simultaneously. Whichever fills first triggers the `PendingExit` fill event; the other leg is auto-cancelled by the broker. |
| **OCO (One-Cancels-Other)** | Two exit orders are submitted when `PositionOpen` is entered. When one fills, the machine receives a fill event for that leg and the broker cancels the other. The `PendingExit` exit_reason is stamped from whichever leg filled. |
| **Short Sell / Buy to Cover** | For short positions, the closing order is a Buy to Cover. The state machine mechanics are identical to a long exit — only the broker-side order direction differs. |

---

## 7. Structural Design Patterns

Choose an implementation pattern that enforces state transition rules natively rather than relying on runtime checks and flags.

### The Typestate Pattern (Compile-Time Safety)

For maximum reliability with zero runtime overhead — ideal for Rust — use the **Typestate Pattern**. Each state is a distinct type. Transitions are methods that consume the old state type and return the new one. The compiler enforces that invalid transitions cannot be expressed at all.

```rust
// Structural sketch of compile-time state transitions
struct IdleScanning;
struct PendingEntry { order_id: u64, direction: Direction }
struct PositionOpen { entry_price: f64, size: f64, direction: Direction }

impl IdleScanning {
    // Only callable from IdleScanning — returns PendingEntry, consuming self
    fn trigger_entry(self, order_id: u64, direction: Direction) -> PendingEntry {
        PendingEntry { order_id, direction }
    }
}
```

Because the compiler enforces that an `IdleScanning` object no longer exists once `trigger_entry` is called, double-submitting an entry order or checking exit rules when no position is open become compile-time errors rather than runtime bugs.

### The Event-Driven Actor Pattern (High Concurrency)

For engines that manage hundreds of assets simultaneously — ideal for Go or async Rust — represent each asset's machine as an isolated actor that receives a unified `Event` enum through a channel. Every loop iteration processes exactly one event sequentially per asset, guaranteeing thread safety without locks.

```
              +-----------------------------------+
              |        Incoming Event Loop        |
              +-----------------------------------+
                                |
          +-----------------------+-----------------------+
          |                                               |
          v                                               v
+-----------------------+                   +-----------------------+
|  MarketBarReceived    |                   | OrderExecutionReport  |
| - Update indicators   |                   | - Confirm fills       |
| - Evaluate entry/exit |                   | - Handle rejections   |
+-----------------------+                   +-----------------------+
```

---

## 8. High-Performance Design Considerations

### Zero-Copy Event Loops

Avoid heap allocation inside the core execution loop. When processing millions of historical bars, copying data structures on every bar will devastate throughput. Pass market data bars by reference (`&Bar` in Rust) down to indicator evaluators. Pre-allocate all rolling-window buffers before the loop begins.

### Abstracting Time and Order Dispatch

To reuse the exact same strategy code for both backtesting and live trading, abstract the time source and broker interface behind a trait or interface.

```rust
// Dual-use broker abstraction
pub trait Broker {
    fn submit_order(&mut self, order: OrderIntent) -> Result<ExecutionReport, BrokerError>;
    fn get_current_time(&self) -> DateTime<Utc>;
}
```

- **Backtest implementation** — `get_current_time()` reads the timestamp from the historical data row; `submit_order()` fills instantly against the next bar's open price.
- **Live implementation** — `get_current_time()` calls the system clock; `submit_order()` sends an asynchronous HTTP or WebSocket request to a live broker API.

### Vectorized vs. Event-Driven Backtesting

| Approach | Speed | Accuracy | Production-Ready |
|---|---|---|---|
| **Vectorized** (Pandas / NumPy) | Very fast | Low — cannot model trailing stops, partial fills, or multi-asset interactions correctly | No — code is not reusable for live execution |
| **Event-Driven** (FSM bar-by-bar) | Slower | High — mimics real-time event streams; eliminates look-ahead bias by design | Yes — identical code path runs in both backtest and live |

For any strategy that uses trailing stops, complex exit logic, or portfolio-level position constraints, event-driven is the only architecturally sound choice.

---

## 9. Handling Critical Edge Cases

A naive state machine breaks when the real world gets messy. These three scenarios are inevitable and must be handled explicitly.

### Partial Fills

If an entry order for 1,000 shares is only partially filled (400 shares immediately, 600 pending), the machine must not advance to `PositionOpen` prematurely.

**Fix:** `PendingEntry` accepts a `PartialFill` event that updates the accumulated fill size but keeps the machine in `PendingEntry`. The transition to `PositionOpen` only fires on a final "Order Complete" status, or a `Timeout` event cancels the remainder and the machine returns to `Idle / Scanning` with a partial position recorded.

### Order Timeouts (The Black Hole)

During a high-volatility crash, an exit order is dispatched and the machine moves to `PendingExit`. The broker lags or becomes unreachable for 30 seconds while the market moves adversely.

**Fix:** Every transition into a `Pending` state initialises a timestamp tracker. If the machine remains in `PendingEntry` or `PendingExit` beyond a configured timeout window, an internal `Timeout` event fires. For `PendingEntry`, the outstanding order is cancelled and the machine resets to `Idle / Scanning`. For `PendingExit`, the engine escalates to an aggressive market-order override and restarts the timeout.

### Re-entrancy and Ghost Signals

If a technical indicator continues generating an entry signal on every bar while the entry order is still in-flight, a poorly written system may fire multiple duplicate orders.

**Fix:** The machine transitions to `PendingEntry` on the very first signal. Any subsequent `MarketBarReceived` events bypass all entry-logic calculations while the state is not `Idle / Scanning`. The guard is structural — it requires no explicit flag, only the current state value.

---

## 10. Architectural Safeguards Against Common Pitfalls

CONCEPT.md identifies five pitfalls that cause backtests to overstate live performance. Four of them are directly addressed by the FSM architecture; the fifth is a validation-workflow concern that the engine alone cannot prevent.

| Pitfall (CONCEPT.md) | Architectural Safeguard |
|---|---|
| **Look-Ahead Bias** | The Data Engine delivers exactly one bar at a time to the Strategy FSM in strict chronological order. No bar `t+N` data is accessible while processing bar `t`. Event-driven execution makes look-ahead bias structurally impossible — there is no array index to read ahead from. |
| **Ignoring Market Friction** | The Execution Engine applies commission and slippage to every fill — entry, exit, and rebalance — before updating portfolio equity. No fill is recorded at a theoretical clean price. The cost model is read from the Structured Strategy Object and applied uniformly throughout the run. |
| **Survivorship Bias** | The Liquidity Pre-Filter (§2.1) evaluates point-in-time data — the values observable on the signal date, not today's. Delisted, suspended, or index-removed assets remain present in the historical universe and can be selected and held through their delisting event. The filter must never source data retroactively. |
| **Regime Dependency** | Regime tagging (§2.5) labels every trade with the active market regime at entry and during the holding period. Stage 7 analysis decomposes aggregate performance into per-regime returns, surfacing strategies that owe their entire return to a single favourable regime and would fail the moment conditions change. |
| **Overfitting** | Not addressable by the engine architecture itself. Overfitting is prevented by the validation workflow (CONCEPT.md Stage 8): in-sample vs out-of-sample splits, parameter sensitivity analysis, and walk-forward validation. The engine supports this by accepting versioned strategy objects that can be re-run across different date ranges without modifying any core logic. |
