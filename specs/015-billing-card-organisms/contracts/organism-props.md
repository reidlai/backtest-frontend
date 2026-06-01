# Organism Prop Contracts

**Branch**: `015-billing-card-organisms` | **Date**: 2026-06-01

These are the public prop interfaces each organism exposes to its parent page. All props are
validated through the organism's Zod schema on mount.

---

## TokenUsageCard

```
Props:
  tokensUsed:   number   — tokens consumed in current session
  tokensTotal:  number   — total token quota for the period
```

**Rendered output** (when valid):
- Card with title "Token Usage" and description "Current session consumption vs quota."
- Row: "Usage" label / `{tokensUsed} / {tokensTotal} tokens`
- Progress bar at `(tokensUsed / tokensTotal) * 100`%
- Footer: "Tokens are reset daily at 00:00 UTC."

**Fallback** (when schema parse fails): card body replaced with error message.

---

## BacktestRunsCard

```
Props:
  backtestsUsed:   number   — runs executed today
  backtestsTotal:  number   — daily run quota
  planName:        string   — user's current plan (e.g., "Pro Plan")
```

**Rendered output** (when valid):
- Card with title "Backtest Runs" and description "Daily execution limits."
- Row: "Runs Today" label / `{backtestsUsed} / {backtestsTotal}`
- Progress bar at `(backtestsUsed / backtestsTotal) * 100`%
- Footer: "You are currently on the **{planName}**."

**Fallback** (when schema parse fails): card body replaced with error message.

---

## SystemStatusCard

```
Props:
  queuePosition:    number   — current position in execution queue
  complexityScore:  number   — strategy complexity (0–100)
  estimatedRuntime: string   — human-readable estimated execution time
```

**Rendered output** (when valid):
- Card with title "System Status"
- Row: "Queue Position" / `{queuePosition} (Active)`
- Row: "Complexity Score" / `{complexityScore}/100`
- Row: "Estimated Runtime" / `{estimatedRuntime}`

**Fallback** (when schema parse fails): card body replaced with error message.
