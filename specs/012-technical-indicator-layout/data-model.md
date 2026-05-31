# Data Model: Technical Indicator Page Two-Column Layout

**Branch**: `012-technical-indicator-layout` | **Date**: 2026-05-31

> This feature is purely frontend (no database). "Data model" here describes the Zod-validated state shapes used at organism and page level.

---

## Entities

### OHLCVPoint

**Schema**: `src/lib/schemas/ohlcv-point.schema.ts`
**Source**: `src/lib/data/mock-ohlcv.ts` (static, 90 records)

| Field | Type | Validation | Notes |
|---|---|---|---|
| `date` | `Date` | required | Trading day date |
| `open` | `number` | positive | Opening price |
| `high` | `number` | positive | Session high |
| `low` | `number` | positive | Session low |
| `close` | `number` | positive | Closing price (used as chart `y`) |
| `volume` | `number` | non-negative | Trading volume |

**Lifecycle**: Generated once at module load. Immutable — no mutations in this feature.

---

### IndicatorSelectionPanelState

**Schema**: `src/lib/schemas/indicator-selection-panel.schema.ts`

| Field | Type | Default | Notes |
|---|---|---|---|
| `availableIndicators` | `string[]` | `AVAILABLE_INDICATORS` const | Fixed list: EMA(50), EMA(200), RSI(14), MACD, Stochastic, Supertrend, Bollinger Bands |
| `selectedIndicators` | `string[]` | `[]` | Multi-select; subset of `availableIndicators` |

**State transitions**:
- Empty → one selected (first toggle)
- One selected → many selected (additional toggles)
- Many → fewer (deselect)
- Any → empty (deselect all)

**Constraints**: Max 7 simultaneous selections (colour palette limit). No enforcement at schema level — UI palette covers exactly 7.

---

### ChartPatternSelectionPanelState

**Schema**: `src/lib/schemas/chart-pattern-selection-panel.schema.ts`

| Field | Type | Default | Notes |
|---|---|---|---|
| `availablePatterns` | `string[]` | `AVAILABLE_PATTERNS` const | Fixed list: Head & Shoulders, Double Top, Bull Flag, Cup & Handle, Triangle, Wedge |
| `selectedPattern` | `string \| null` | `null` | Single-select; `null` = none selected |

**State transitions**:
- `null` → pattern selected (first tap)
- Pattern A → Pattern B (tap different pattern)
- Pattern → `null` (tap active pattern again — toggle off)

---

### PatternPreviewPanelState

**Schema**: `src/lib/schemas/pattern-preview-panel.schema.ts`

| Field | Type | Default | Notes |
|---|---|---|---|
| `selectedIndicators` | `string[]` | `[]` | Passed from page; drives Spline overlays |
| `selectedPattern` | `string \| null` | `null` | Passed from page; drives annotation lines |
| `chartData` | `OHLCVPoint[]` | `[]` | Passed from page; the 90-candle mock dataset |

**Derived state** (computed in organism, not stored):
- `isEmpty` — `selectedIndicators.length === 0 && !selectedPattern` → renders empty state message
- `annotationIndices` — `[25%, 50%, 75%]` of dataset length when `selectedPattern` is set
- `indicatorSeries` — per-indicator derived `{ date, value }[]` from `chartData.close`

---

## Snapshot Schema (page-level persistence)

Captured by SvelteKit `snapshot` export in `+page.svelte`. Restored using `IndicatorSelectionPanelSchema` and `ChartPatternSelectionPanelSchema` via `safeParse`.

```ts
// Captured shape
{
  selectedIndicators: string[];   // validated by IndicatorSelectionPanelSchema
  selectedPattern: string | null; // validated by ChartPatternSelectionPanelSchema
}
```

Restore is defensive — on schema mismatch (stale snapshot), state falls back to defaults.

---

## Relationships

```
+page.svelte
  ├── selectedIndicators: string[]  ──bind──► IndicatorSelectionPanel
  │                                 ──prop──► PatternPreviewPanel
  └── selectedPattern: string|null  ──bind──► ChartPatternSelectionPanel
                                    ──prop──► PatternPreviewPanel

PatternPreviewPanel
  ├── chartData (OHLCVPoint[])  ──prop── from page (mockOHLCV)
  ├── selectedIndicators        ──prop── → deriveIndicatorSeries() → Spline[]
  └── selectedPattern           ──prop── → getPatternAnnotationIndices() → annotation Spline[]
```
