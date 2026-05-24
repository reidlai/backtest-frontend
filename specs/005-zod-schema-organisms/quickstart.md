# Quickstart: Zod Schema per Organism

**Phase**: 1 — Developer Guide
**Date**: 2026-05-24

## Prerequisites

Ensure `zod` is installed:

```bash
pnpm add zod
```

Verify:
```bash
node -e "require('zod'); console.log('zod ok')"
```

---

## Pattern 1: Organism with local reactive state

This is the primary pattern for organisms that currently have `$state` variables.

**Step 1** — Create the schema file at `src/lib/schemas/<organism-kebab>.schema.ts`:

```ts
import { z } from 'zod';

export const MyOrganismSchema = z.object({
  inputText: z.string().default(''),
  isLoading: z.boolean().default(false),
});

export type MyOrganismState = z.infer<typeof MyOrganismSchema>;
```

Rules:
- All primitive fields use native Zod types (`z.string()`, `z.boolean()`, `z.number()`, `z.number().nullable()`)
- All fields with existing TypeScript interfaces use `z.custom<T>()`
- Every field MUST have `.default(...)` so `Schema.parse({})` succeeds
- Simple union string literals (like `ChartTab`) use `z.enum([...])` for runtime validation

**Step 2** — Update the organism component:

```svelte
<script lang="ts">
  import { MyOrganismSchema } from '$lib/schemas';

  // Replace individual $state vars with one consolidated object
  let state = $state(MyOrganismSchema.parse({}));

  function handleInput(value: string) {
    state.inputText = value;      // ✅ direct property assignment
    // state = { ...state, ... }  // ❌ whole-object replacement
  }
</script>

<!-- Replace direct var references with state.fieldName -->
<input bind:value={state.inputText} />
```

**Step 3** — Add the schema to the barrel export in `src/lib/schemas/index.ts`:

```ts
export * from './my-organism.schema';
```

---

## Pattern 2: Organism with static `const` data

For organisms like `FunctionGateways` and `MainMenuGroup` that use `const` (not reactive `$state`).

```ts
// function-gateways.schema.ts
import { z } from 'zod';
import type { IFunctionGatewayCard } from '$lib/types';

export const FunctionGatewaysSchema = z.object({
  gatewayCards: z.custom<IFunctionGatewayCard[]>().default([]),
});

export type FunctionGatewaysState = z.infer<typeof FunctionGatewaysSchema>;
```

The component keeps its `const` declaration — the schema documents the data shape but does not drive initialization:

```svelte
<script lang="ts">
  // Keep the const; do NOT change to $state for non-reactive data
  const gatewayCards: IFunctionGatewayCard[] = [...];
</script>
```

---

## Pattern 3: Stateless organisms (empty schema)

For organisms with no local state:

```ts
// navigation-sidebar.schema.ts
import { z } from 'zod';

export const NavigationSidebarSchema = z.object({});

export type NavigationSidebarState = z.infer<typeof NavigationSidebarSchema>;
```

No changes to the component.

---

## Pattern 4: Props-only organisms (`StubSection`)

For organisms using `$props()` instead of `$state()`:

```ts
// stub-section.schema.ts
import { z } from 'zod';

export const StubSectionSchema = z.object({
  title: z.string().default('Section'),
});

export type StubSectionProps = z.infer<typeof StubSectionSchema>;
```

In the component — add the type annotation to `$props()`, no runtime `.parse()`:

```svelte
<script lang="ts">
  import type { StubSectionProps } from '$lib/schemas';

  let { title = 'Section' }: StubSectionProps = $props();
</script>
```

---

## Verification checklist

After implementing all 16 schemas:

```bash
# 1. Count schema files (expect 17: 16 schemas + 1 index)
ls src/lib/schemas/ | wc -l

# 2. TypeScript type-check (expect 0 errors)
pnpm check

# 3. Run unit tests
pnpm test:unit

# 4. Lint
pnpm lint
```

Manual smoke test for each schema with local state:
```ts
// In a vitest test or browser console:
import { PerformanceMetricGridSchema } from '$lib/schemas';
console.log(PerformanceMetricGridSchema.parse({}));
// → { tiles: [], draggedIndex: null, editingTileId: null, editValue: '', modalOpen: false }
```
