# Quickstart: Technical Indicator Page Two-Column Layout

**Branch**: `012-technical-indicator-layout` | **Date**: 2026-05-31

## Run the app locally

```bash
pnpm install
pnpm run dev
```

Navigate to **http://localhost:5173/technical-indicator**

## Verify the feature manually

### US1 — Two-column layout

1. Open `/technical-indicator` in the browser
2. At viewport ≥ 1024px: confirm two side-by-side columns
   - Left: "Indicator Selection" panel + "Chart Pattern Selection" panel stacked
   - Right: "Pattern Preview" panel
3. Resize to < 1024px: confirm columns stack vertically
4. Confirm no horizontal scrollbar at any viewport width

### US2 — Multi-select indicators

1. Click **RSI(14)** in the Indicator Selection panel → button turns primary colour
2. Click **MACD** → second button turns primary; both active
3. Confirm Pattern Preview chart shows two coloured Spline overlays (green + orange)
4. Click **RSI(14)** again → button returns to outline; only MACD overlay remains
5. Deselect all → Pattern Preview shows empty state message "Select an indicator or pattern to preview"

### US3 — Chart pattern annotation

1. Click **Head & Shoulders** in the Chart Pattern Selection panel → button turns primary
2. Confirm Pattern Preview shows three dashed vertical annotation lines at 25%, 50%, 75% of the chart
3. Click **Double Top** → annotation updates; previous pattern annotation disappears
4. Click **Head & Shoulders** again (deselect) → annotation disappears
5. With RSI(14) active AND Head & Shoulders selected: confirm both indicator overlay AND annotation lines are visible simultaneously

### Snapshot persistence

1. Select RSI(14) + Bull Flag
2. Navigate away to `/technical-screener`
3. Navigate back to `/technical-indicator`
4. Confirm RSI(14) and Bull Flag are still selected (snapshot restored)

## Run the build

```bash
pnpm run build
```

Expected: `✔ done` with no errors.

## Run BDD scenarios

```bash
pnpm exec cucumber-js features/technical-indicator-layout.feature --tags @smoke
```

## View Storybook

```bash
pnpm run storybook
```

Open **Organisms → IndicatorSelectionPanel**, **ChartPatternSelectionPanel**, **PatternPreviewPanel** to verify all component states.

## Key files

| File | Purpose |
|---|---|
| `src/routes/technical-indicator/+page.svelte` | Page — state wiring and layout |
| `src/lib/components/organisms/IndicatorSelectionPanel.svelte` | Multi-select indicator buttons |
| `src/lib/components/organisms/ChartPatternSelectionPanel.svelte` | Single-select pattern buttons |
| `src/lib/components/organisms/PatternPreviewPanel.svelte` | layerchart rendering + overlays |
| `src/lib/data/mock-ohlcv.ts` | 90-candle static OHLCV dataset |
| `src/lib/schemas/indicator-selection-panel.schema.ts` | Zod schema + `AVAILABLE_INDICATORS` |
| `src/lib/schemas/chart-pattern-selection-panel.schema.ts` | Zod schema + `AVAILABLE_PATTERNS` |
| `features/technical-indicator-layout.feature` | BDD @smoke scenarios |
