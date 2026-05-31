# Data Model: Market Regime Page Organisms

**Branch**: `010-market-regime-organisms` | **Date**: 2026-05-31

## Schemas

### MarketEnvironmentSummarySchema

**File**: `src/lib/schemas/market-environment-summary.schema.ts`

```ts
import { z } from 'zod';

export const MarketEnvironmentSummarySchema = z.object({
  summary: z.string().default('')
});
```

**Fields**:

| Field   | Type   | Default | Description                              |
| ------- | ------ | ------- | ---------------------------------------- |
| summary | string | `""`    | AI-generated market environment summary text |

**Validation rules**: `summary` is a plain string; no length constraint enforced at schema level.

---

### RegimeCardsGridSchema

**File**: `src/lib/schemas/regime-cards-grid.schema.ts`

```ts
import { z } from 'zod';
import { MarketRegimeSchema } from './market-regime.schema';

export const RegimeCardsGridSchema = z.object({
  regimes: z.array(MarketRegimeSchema).default([])
});
```

**Fields**:

| Field   | Type                  | Default | Description                        |
| ------- | --------------------- | ------- | ---------------------------------- |
| regimes | `MarketRegime[]`      | `[]`    | Array of market regime data objects |

**Validation rules**: Empty array is valid (triggers empty state UI in the organism).

---

## Reused Schemas

### MarketRegimeSchema (existing)

**File**: `src/lib/schemas/market-regime.schema.ts` (unchanged)

| Field           | Type                              | Description                        |
| --------------- | --------------------------------- | ---------------------------------- |
| id              | string                            | Unique identifier                  |
| name            | string                            | Display name of the regime         |
| status          | `"active" \| "inactive" \| "warning"` | Current status                 |
| logicDescription| string                            | Human-readable regime description  |
| indicators      | string[]                          | List of indicator names            |

---

## Index Export Updates

**File**: `src/lib/schemas/index.ts` — add two new export lines:

```ts
export * from './market-environment-summary.schema';
export * from './regime-cards-grid.schema';
```
