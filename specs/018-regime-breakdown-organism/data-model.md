# Data Model: Regime Breakdown Organism

**Feature**: `018-regime-breakdown-organism` | **Date**: 2026-06-01

## Entity: RegimeBreakdown

**Source**: `src/lib/schemas/regime-breakdown.schema.ts` (existing, unchanged)

| Field | Type | Validation | Notes |
| ----- | ---- | ---------- | ----- |
| `regime` | `string` | required, non-empty | Display name for the market regime (e.g., "Bull Trend") |
| `returnPct` | `number` | required | Return percentage; positive = green, negative = red |
| `maxDrawdown` | `number` | required | Max drawdown percentage; always displayed in red |
| `winRate` | `number` | required | Win rate percentage |
| `tradeCount` | `number` | required | Number of trades; present in schema but NOT rendered in the table |

**Validation**: `RegimeBreakdownSchema.safeParse(row)` — invalid rows are excluded silently before rendering.

**Unique key**: `row.regime` — used as Svelte `{#each}` key.

---

## Component State: RegimeBreakdownTable

| State variable | Type | Initial value | Reactive? |
| -------------- | ---- | ------------- | --------- |
| `rows` | `RegimeBreakdown[]` | Mock data filtered through `safeParse` | `$state` |

**Derived state**: None required. `rows.length === 0` is evaluated inline in the template.

**Component markup scope**: The organism renders the **full section** — outer `<div class="space-y-4">`, `<h2 class="text-xl font-semibold">Regime Breakdown</h2>`, inner card `<div class="overflow-hidden rounded-xl border bg-card shadow-sm">`, and `<Table.Root>`. The parent page is reduced to a single `<RegimeBreakdownTable />` self-closing tag with no surrounding wrappers.

---

## BDD Feature File Contract

**File**: `features/regime-breakdown-organism.feature`

Scenarios mirror spec acceptance criteria:

1. Renders table with correct columns (Regime, Return, Max DD, Win Rate)
2. Displays positive return in green, negative in red
3. Shows "No data available" when data is empty
4. Excludes invalid rows without crashing

---

## No External Contracts

This feature introduces no API endpoints, event schemas, or inter-service contracts. The organism is a purely client-side, self-contained UI component.
