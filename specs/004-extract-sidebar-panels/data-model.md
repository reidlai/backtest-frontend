# Data Model: Extract AI Review Sidebar Panels

**Feature**: `004-extract-sidebar-panels` | **Date**: 2026-05-23

This is a pure structural refactor. **No new types are introduced.** All relevant types already exist in `src/lib/types/index.ts`. This document records the existing types consumed by each new organism and the local state each organism owns.

---

## Consumed Types (existing — `src/lib/types/index.ts`)

### `AIReview` — consumed by `AIReviewPanel`
```typescript
interface AIReview {
  grade: string;                // e.g., "B+"
  confidence: ConfidenceLevel;  // 'high' | 'medium' | 'low'
  riskFlags: RiskFlag[];
}

interface RiskFlag {
  id: string;
  label: string;
  severity: FlagSeverity;       // 'high' | 'medium' | 'low'
  description: string;
}
```
**Source**: `sampleAIReview` imported directly from `$lib/data/strategy.ts`

---

### `ResourceUsage` — consumed by `ResourceCostPanel`
```typescript
interface ResourceUsage {
  tokensUsed: number;
  tokensTotal: number;
  backtestsUsed: number;
  backtestsTotal: number;
  queuePosition: number;
  estimatedRuntime: string;     // e.g., "~42s"
  complexityScore: number;
  planImpact: PlanImpact;       // 'low' | 'medium' | 'high'
}
```
**Source**: `sampleResourceUsage` imported directly from `$lib/data/strategy.ts`

---

### `ChatMessage` — owned as local `$state` by `AIChatPanel`
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
```
**State**: `messages: ChatMessage[]` initialized as `$state<ChatMessage[]>([])` — resets on unmount.

---

### `TradeRecord[]` — consumed by `QuickActionsPanel` (CSV export)
```typescript
interface TradeRecord { ... }  // full definition in src/lib/types/index.ts
```
**Source**: `sampleTrades` imported from `$lib/data/trades.ts`; `tradesToCsv` utility also imported from same module.

---

## Local State per Organism

| Organism | State Variable | Type | Initial Value | Reset on Remount |
|----------|---------------|------|---------------|-----------------|
| `AIChatPanel` | `messages` | `ChatMessage[]` | `[]` | Yes (Svelte 5 `$state`) |
| `AIChatPanel` | `chatInput` | `string` | `''` | Yes (Svelte 5 `$state`) |
| `AIReviewPanel` | — | — | — | N/A (stateless) |
| `ResourceCostPanel` | — | — | — | N/A (stateless) |
| `QuickActionsPanel` | — | — | — | N/A (stateless; side effects via context) |

---

## External Dependencies per Organism

| Organism | Imports | Context |
|----------|---------|---------|
| `AIReviewPanel` | `sampleAIReview` from `$lib/data/strategy`, `RiskFlagItem` molecule, `Badge` from `$lib/components/ui/badge` | None |
| `ResourceCostPanel` | `sampleResourceUsage` from `$lib/data/strategy`, `Progress` from `$lib/components/ui/progress` | None |
| `AIChatPanel` | `Button`, `Textarea` from `$lib/components/ui/`, `ChatMessage` type | None |
| `QuickActionsPanel` | `appState` from `$lib/state/app.svelte`, `sampleTrades` + `tradesToCsv` from `$lib/data/trades`, `Button` from `$lib/components/ui/`, `toast` from `svelte-sonner`, `getContext` from `svelte` | `organism-refs` (set in `+page.svelte`; `undefined` in Storybook — handled via optional chaining) |

---

## No Schema Changes

- No new Zod schemas required (no new data contracts or API surfaces)
- No new TypeScript types required (all consumed types already exist)
- No new stores required (local `$state` is sufficient)
- No database or persistence changes (all data is in-memory mock)
