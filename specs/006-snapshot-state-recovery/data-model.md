# Data Model: Snapshot State Recovery

**Branch**: `006-snapshot-state-recovery` | **Date**: 2026-05-26

## Snapshot Schemas

### 1. AIResearchBox Snapshot Schema (inline, not barrel-exported)

Used only in `/research-workbench/+page.svelte`. A subset of the existing `AIResearchBoxSchema`; excludes `validationError`.

```typescript
// Defined inline in research-workbench/+page.svelte
const AIResearchBoxSnapshotSchema = z.object({
  aiText: z.string().default('')
});
type AIResearchBoxSnapshot = z.infer<typeof AIResearchBoxSnapshotSchema>;
```

**Validation rules**:
- `aiText`: any string including empty string; empty string is the default
- `validationError` is NOT part of this schema and is never stored

---

### 2. AIChatPanel / Layout Snapshot (reuses existing `AIChatPanelSchema`)

Used in `+layout.svelte`. References the existing exported `AIChatPanelSchema` from `src/lib/schemas/ai-chat-panel.schema.ts`.

```typescript
// Existing schema — no changes required
export const AIChatPanelSchema = z.object({
  chatInput: z.string().default(''),
  messages: z.array(ChatMessageSchema).default([])
});
```

**Validation rules**:
- `chatInput`: any string; defaults to empty string
- `messages`: array of `ChatMessage` objects; defaults to empty array
- Snapshot capture trims to the **50 most recent** messages before writing to sessionStorage

**ChatMessage shape** (from `chat-message.schema.ts`, unchanged):
```typescript
export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string()
});
```

---

### 3. FundamentalScreenerSchema (new — `src/lib/schemas/fundamental-screener.schema.ts`)

```typescript
import { z } from 'zod';

export const FundamentalScreenerSchema = z.object({
  universe:     z.string().default('S&P 500'),
  peMax:        z.string().default('30'),
  roicMin:      z.string().default('15'),
  revGrowthMin: z.string().default('10')
});

export type FundamentalScreenerState = z.infer<typeof FundamentalScreenerSchema>;
```

**Validation rules**:
- All fields are `string` (matching the page's `$state` types — input values are text)
- Defaults match the page's current hardcoded initial values
- `universe` valid values at runtime: `'S&P 500'` | `'Nasdaq 100'` | `'Russell 2000'` (not enforced by Zod — unknown values fall back to `z.string()` default on parse failure)

---

### 4. TechnicalScreenerSchema (new — `src/lib/schemas/technical-screener.schema.ts`)

```typescript
import { z } from 'zod';

export const TechnicalScreenerSchema = z.object({
  selectedPatterns: z.array(z.string()).default([]),
  trendIndicator:   z.string().default('EMA(200)'),
  momentumIndicator: z.string().default('RSI(14)')
});

export type TechnicalScreenerState = z.infer<typeof TechnicalScreenerSchema>;
```

**Validation rules**:
- `selectedPatterns`: array of strings (the Set→Array serialized form); empty array is the default
- `trendIndicator`: valid values at runtime: `'EMA(50)'` | `'EMA(200)'` | `'Supertrend'`; defaults to `'EMA(200)'`
- `momentumIndicator`: valid values at runtime: `'RSI(14)'` | `'Stochastic'` | `'MACD'`; defaults to `'RSI(14)'`
- On restore: `selectedPatterns` array is converted back to `Set<string>` before assigning to component state

---

## Component State Changes

### AIResearchBox.svelte

| Field | Before | After | Notes |
|---|---|---|---|
| `state.aiText` | Internal `$state` field on state object | `aiText = $bindable('')` prop | Lifted to parent; parent owns and snapshots it |
| `state.validationError` | Internal `$state` field on state object | `validationError = $state(false)` | Stays local; not exposed, not snapshotted |

**Breaking change to component API**: Callers that rendered `<AIResearchBox />` with no props continue to work (defaults apply). The `research-workbench/+page.svelte` must add `bind:aiText`.

---

### AIChatPanel.svelte

| Field | Before | After | Notes |
|---|---|---|---|
| `state.messages` | Internal `$state` field | `messages = $bindable([])` prop | Lifted through AIReviewSidebar to +layout.svelte |
| `state.chatInput` | Internal `$state` field | `chatInput = $bindable('')` prop | Lifted through AIReviewSidebar to +layout.svelte |

**Breaking change**: Callers that render `<AIChatPanel />` with no props continue to work (defaults apply). `AIReviewSidebar` must add `bind:messages bind:chatInput`.

---

### AIReviewSidebar.svelte

| Field | Before | After | Notes |
|---|---|---|---|
| (none) | No props | `messages = $bindable([])`, `chatInput = $bindable('')` | Pass-through props from +layout.svelte to AIChatPanel |

---

### fundamental-screener/+page.svelte

| Field | Before | After | Notes |
|---|---|---|---|
| Universe Select | Hardcoded `value="S&P 500"` | `let universe = $state('S&P 500')` | Promoted to reactive state |
| `peMax` | `let peMax = $state('30')` | Unchanged | Already reactive |
| `roicMin` | `let roicMin = $state('15')` | Unchanged | Already reactive |
| `revGrowthMin` | `let revGrowthMin = $state('10')` | Unchanged | Already reactive |

---

### technical-screener/+page.svelte

| Field | Before | After | Notes |
|---|---|---|---|
| Trend Select | Hardcoded `value="EMA(200)"` | `let trendIndicator = $state('EMA(200)')` | Promoted to reactive state |
| Momentum Select | Hardcoded `value="RSI(14)"` | `let momentumIndicator = $state('RSI(14)')` | Promoted to reactive state |
| `selectedPatterns` | `let selectedPatterns = $state(new Set<string>())` | Unchanged | Already reactive; serialized as Array in snapshot |

---

## Snapshot Capture/Restore Contracts

### +layout.svelte snapshot

```typescript
export const snapshot: Snapshot = {
  capture: () => ({
    messages: messages.slice(-50),  // cap at 50 most recent
    chatInput
  }),
  restore: (value: unknown) => {
    const result = AIChatPanelSchema.safeParse(value);
    if (result.success) {
      messages = result.data.messages;
      chatInput = result.data.chatInput;
    }
    // else: silently keep defaults ([] and '')
  }
};
```

### research-workbench/+page.svelte snapshot

```typescript
const AIResearchBoxSnapshotSchema = z.object({ aiText: z.string().default('') });

export const snapshot: Snapshot = {
  capture: () => ({ aiText }),
  restore: (value: unknown) => {
    const result = AIResearchBoxSnapshotSchema.safeParse(value);
    if (result.success) aiText = result.data.aiText;
  }
};
```

### fundamental-screener/+page.svelte snapshot

```typescript
export const snapshot: Snapshot = {
  capture: () => ({ universe, peMax, roicMin, revGrowthMin }),
  restore: (value: unknown) => {
    const result = FundamentalScreenerSchema.safeParse(value);
    if (result.success) {
      universe = result.data.universe;
      peMax = result.data.peMax;
      roicMin = result.data.roicMin;
      revGrowthMin = result.data.revGrowthMin;
    }
  }
};
```

### technical-screener/+page.svelte snapshot

```typescript
export const snapshot: Snapshot = {
  capture: () => ({
    selectedPatterns: [...selectedPatterns],  // Set → Array
    trendIndicator,
    momentumIndicator
  }),
  restore: (value: unknown) => {
    const result = TechnicalScreenerSchema.safeParse(value);
    if (result.success) {
      selectedPatterns = new Set(result.data.selectedPatterns);  // Array → Set
      trendIndicator = result.data.trendIndicator;
      momentumIndicator = result.data.momentumIndicator;
    }
  }
};
```

---

## Schema Barrel Export Update

`src/lib/schemas/index.ts` must add:
```typescript
export * from './fundamental-screener.schema';
export * from './technical-screener.schema';
```
