# Data Model: Performance Summary & Edit Modal Organisms

## Existing Schemas (reused)

### PerfSummaryItemSchema
**File**: `src/lib/schemas/perf-summary-item.schema.ts`

| Field   | Type     | Validation       |
|---------|----------|------------------|
| `label` | `string` | required, non-empty |
| `value` | `string` | required         |

Used by `PerformanceSummary` to validate each row of `samplePerfSummary`.

### MetricEditPayloadSchema
**File**: `src/lib/schemas/metric-edit-payload.schema.ts`

| Field      | Type     | Validation       |
|------------|----------|------------------|
| `tileId`   | `string` | required         |
| `newValue` | `string` | required         |

Represents the payload emitted by `EditMetricModal`'s `onApply` callback. Not modified.

---

## New Schemas

### PerformanceSummarySchema
**File**: `src/lib/schemas/performance-summary.schema.ts` ← NEW

Captures the local reactive state of the `PerformanceSummary` organism.

| Field   | Type                        | Validation             | Default |
|---------|-----------------------------|------------------------|---------|
| `stats` | `PerfSummaryItemSchema[]`   | array, items validated | `[]`    |

```ts
import { z } from 'zod';
import { PerfSummaryItemSchema } from './perf-summary-item.schema';

export const PerformanceSummarySchema = z.object({
  stats: z.array(PerfSummaryItemSchema).default([])
});

export type PerformanceSummary = z.infer<typeof PerformanceSummarySchema>;
```

**State transitions**:
- On mount: `stats` is populated from `samplePerfSummary` filtered through `PerfSummaryItemSchema.safeParse`
- No runtime mutations (read-only display component)

---

### EditMetricModalStateSchema
**File**: `src/lib/schemas/edit-metric-modal.schema.ts` ← NEW

Captures the internal form state of the `EditMetricModal` organism.

| Field        | Type     | Validation | Default |
|--------------|----------|------------|---------|
| `editValue`  | `string` | any string | `''`    |

```ts
import { z } from 'zod';

export const EditMetricModalStateSchema = z.object({
  editValue: z.string().default('')
});

export const EditMetricValueSchema = z.string()
  .refine(
    v => v.trim() !== '' && !isNaN(parseFloat(v.trim())),
    { message: 'Must be a valid number' }
  );

export type EditMetricModalState = z.infer<typeof EditMetricModalStateSchema>;
```

**State transitions**:

| Event | Transition |
|-------|-----------|
| `open` prop transitions `false → true` | `editValue` resets to `initialValue` prop |
| User types in input | `editValue` updates to new input string |
| User clicks Apply (valid) | `onApply(editValue)` emitted; parent sets `open=false` |
| User clicks Cancel | `onClose()` emitted; parent sets `open=false` |

---

## Props Interface

### PerformanceSummary
No props. Self-contained.

### EditMetricModal

| Prop           | Type                          | Direction | Notes |
|----------------|-------------------------------|-----------|-------|
| `open`         | `boolean`                     | In        | Parent controls visibility |
| `tileId`       | `string \| null`              | In        | ID of tile being edited |
| `initialValue` | `string`                      | In        | Value to reset input to on open |
| `onApply`      | `(newValue: string) => void`  | Out (callback) | Fired when Apply clicked with valid value |
| `onClose`      | `() => void`                  | Out (callback) | Fired when Cancel clicked or after Apply |

---

## Schema Index Update

`src/lib/schemas/index.ts` must export:
- `PerformanceSummarySchema`
- `EditMetricModalStateSchema`
- `EditMetricValueSchema`
