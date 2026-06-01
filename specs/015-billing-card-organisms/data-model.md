# Data Model: Billing Card Organisms

**Branch**: `015-billing-card-organisms` | **Date**: 2026-06-01

## Source Schema (existing)

`ResourceUsageSchema` in `src/lib/schemas/resource-usage.schema.ts` already defines all
fields needed by the three organisms:

```
tokensUsed:       number   (non-negative)
tokensTotal:      number   (non-negative)
backtestsUsed:    number   (non-negative)
backtestsTotal:   number   (non-negative)
queuePosition:    number   (non-negative integer)
estimatedRuntime: string   (non-empty)
complexityScore:  number   (0–100)
planImpact:       enum     ('low' | 'medium' | 'high')
```

> **Note**: `planName` (displayed as "Pro Plan" in the Backtest Runs card) is not currently
> in `ResourceUsageSchema`. It is hardcoded inline in the page. The `BacktestRunsCardSchema`
> will introduce `planName: z.string().min(1).default('Pro Plan')`.

---

## TokenUsageCardSchema

**File**: `src/lib/schemas/token-usage-card.schema.ts`
**Export**: `TokenUsageCardSchema`

```
Fields (picked from ResourceUsageSchema + constraints):
  tokensUsed:   z.number().int().nonnegative()   default: 0
  tokensTotal:  z.number().int().positive()       default: 10000
```

**Validation rules**:
- `tokensUsed` must be ≤ `tokensTotal` (enforced via `.refine()`)
- Both must be non-negative integers

**Local state shape** (`z.infer<typeof TokenUsageCardSchema>`):
```ts
{ tokensUsed: number; tokensTotal: number }
```

---

## BacktestRunsCardSchema

**File**: `src/lib/schemas/backtest-runs-card.schema.ts`
**Export**: `BacktestRunsCardSchema`

```
Fields:
  backtestsUsed:   z.number().int().nonnegative()   default: 0
  backtestsTotal:  z.number().int().positive()       default: 10
  planName:        z.string().min(1)                  default: 'Pro Plan'
```

**Validation rules**:
- `backtestsUsed` must be ≤ `backtestsTotal`
- `planName` must be a non-empty string

**Local state shape**:
```ts
{ backtestsUsed: number; backtestsTotal: number; planName: string }
```

---

## SystemStatusCardSchema

**File**: `src/lib/schemas/system-status-card.schema.ts`
**Export**: `SystemStatusCardSchema`

```
Fields:
  queuePosition:    z.number().int().nonnegative()    default: 0
  complexityScore:  z.number().min(0).max(100)        default: 0
  estimatedRuntime: z.string().min(1)                  default: 'N/A'
```

**Validation rules**:
- `complexityScore` in range [0, 100]
- `estimatedRuntime` non-empty string

**Local state shape**:
```ts
{ queuePosition: number; complexityScore: number; estimatedRuntime: string }
```

---

## Schema index.ts additions

Add three new exports to `src/lib/schemas/index.ts`:
```ts
export * from './token-usage-card.schema';
export * from './backtest-runs-card.schema';
export * from './system-status-card.schema';
```

---

## Organism → Schema mapping

| Organism file | Schema | Props source (page) |
|---|---|---|
| `TokenUsageCard.svelte` | `TokenUsageCardSchema` | `sampleResourceUsage.tokensUsed`, `sampleResourceUsage.tokensTotal` |
| `BacktestRunsCard.svelte` | `BacktestRunsCardSchema` | `sampleResourceUsage.backtestsUsed`, `sampleResourceUsage.backtestsTotal`, `"Pro Plan"` |
| `SystemStatusCard.svelte` | `SystemStatusCardSchema` | `sampleResourceUsage.queuePosition`, `sampleResourceUsage.complexityScore`, `sampleResourceUsage.estimatedRuntime` |
