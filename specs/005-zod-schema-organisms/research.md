# Research: Zod Schema per Organism

**Phase**: 0 — Research & Unknowns
**Date**: 2026-05-24

## Decision 1: Zod Version

**Decision**: Use `zod` v3.x (latest 3.x stable, currently 3.24.x)

**Rationale**: Zod 3 is the mature, battle-tested release with the widest ecosystem compatibility. The project's SvelteKit 2 + Svelte 5 + TypeScript 6 stack has no known compatibility issues with Zod 3. Zod 4 introduces a new API surface (e.g., `z.string().min()` semantics change) and is still accumulating ecosystem adoption — using it now introduces unnecessary migration risk for a foundational schema layer.

**Alternatives considered**:
- Zod 4: Newer API, faster performance, but breaking changes from Zod 3 and less ecosystem maturity at time of writing. Revisit in a future migration.
- `valibot`: Smaller bundle size, but different API entirely — would require learning a new library when Zod is already constitutionally mandated (Rule 12).

**Install command**: `pnpm add zod`

---

## Decision 2: `z.custom<T>()` with `.default()` — Behavior Verification

**Decision**: Use `z.custom<T>().default(value)` for fields typed with existing TypeScript interfaces

**Rationale**: `z.custom<T>()` creates a passthrough schema that trusts the TypeScript type system at compile time but performs no runtime structural validation. Chaining `.default(value)` on `z.custom<T>()` is fully supported — Zod applies the default when the field value is `undefined`. This means `Schema.parse({})` correctly returns the default value for custom-typed fields.

**Behavior**:
```ts
const schema = z.object({
  messages: z.custom<ChatMessage[]>().default([]),
});
schema.parse({});
// → { messages: [] }  ✅ correct
```

**Limitation acknowledged**: `z.custom<T>()` provides no runtime structural validation for the nested type (e.g., it won't catch a malformed `ChatMessage` object). This is an accepted tradeoff per the spec (FR-009) — avoiding schema duplication is prioritized over deep nested validation.

**Alternatives considered**:
- Full nested schemas (e.g., `ChatMessageSchema`): Rejected per spec (FR-009) to avoid duplicating existing TypeScript interfaces.
- `z.unknown().default([])`: Would lose TypeScript inference — not acceptable.

---

## Decision 3: `ChartTab` Union Literal — `z.custom<T>()` vs `z.enum()`

**Decision**: Use `z.enum(['equity-curve', 'drawdown', 'benchmark-overlay', 'monthly-heatmap'])` for `ChartTab`, not `z.custom<ChartTab>()`

**Rationale**: `ChartTab` is a simple union string literal (`'equity-curve' | 'drawdown' | ...`), not a complex interface. Using `z.enum([...])` provides full runtime validation (rejects invalid strings), produces a better TypeScript type, and enables `.default()` naturally. The spec's decision to use `z.custom<T>()` was intended for complex interface types — for simple enums/union literals, `z.enum()` is the idiomatic and strictly better Zod approach with no downsides.

**Impact on spec**: FR-009 covers complex interfaces. `ChartTab` falls outside that pattern. The Key Entities table note for `PerformancdeChartTabs` is updated in data-model.md accordingly.

**Alternatives considered**:
- `z.custom<ChartTab>()`: Would provide no runtime validation for the enum values — a meaningless schema for a type that Zod can fully model.

---

## Decision 4: Schema File Naming — `PerformancdeChartTabs` Typo

**Decision**: Name the schema file `performance-chart-tabs.schema.ts` (fixing the typo in the organism filename `PerformancdeChartTabs.svelte`)

**Rationale**: The organism file has a typo (`PerformancDe` instead of `PerformancE`). The schema layer should use the correct spelling to avoid propagating the typo. The schema's exported constant should also use the correct name: `PerformanceChartTabsSchema`.

**Note**: The organism `.svelte` filename is NOT changed in this feature (out of scope). Only the schema file uses the corrected spelling.

---

## Decision 5: Testing Approach for Schemas

**Decision**: Unit-test each schema file with Vitest, validating: (1) `schema.parse({})` returns expected defaults, (2) `schema.safeParse()` rejects invalid inputs for fields with runtime validation

**Rationale**: Schema files are pure TypeScript — no DOM or Svelte runtime needed. Vitest runs them in isolation. Each test file maps 1:1 to a schema file.

**Test location**: `src/lib/schemas/__tests__/` or co-located as `*.schema.test.ts`

**Minimum test cases per schema**:
1. `schema.parse({})` succeeds and returns correct defaults
2. For schemas with `z.enum()` or primitive Zod types: `schema.safeParse({ field: wrongType })` returns `success: false`
3. For schemas with `z.custom<T>()` only: no runtime validation test needed (type-only guarantee)

---

## Decision 6: BDD Feature File

**Decision**: Create `features/zod-schema-organisms.feature` with scenarios covering SC-001 through SC-005

**Rationale**: Rule 6 and Rule 8 of the constitution require BDD feature files for new behaviors. The schema creation introduces verifiable behaviors (file existence, parse success, type correctness).

**Note**: BDD scenarios for this feature are developer-observable (file count, parse results, TypeScript compilation) rather than end-user observable (no UI changes). The Cucumber step definitions will use Node.js file system checks and TypeScript compiler API.
