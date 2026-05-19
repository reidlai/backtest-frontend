# Quickstart: Enterprise AI Backtest Platform — Main Application Page

**Branch**: `001-home-page-svelte` | **Date**: 2026-05-18

## Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Chromium browser (required for Playwright and Vitest browser mode)

## Initial Setup

### 1. Install existing dependencies

```sh
pnpm install
```

### 2. Initialize shadcn-svelte

Run the CLI initializer. When prompted, accept these values:

- Style: **Default**
- Base color: **Slate** (matches the dark theme palette)
- CSS variables: **Yes**

```sh
pnpx shadcn-svelte@latest init
```

This generates `components.json` at the project root and `src/lib/utils.ts` with the `cn()` helper.

### 3. Add required shadcn-svelte components

```sh
pnpx shadcn-svelte@latest add button card dialog input label select separator sonner table tabs textarea tooltip badge progress
```

Components are placed in `src/lib/components/ui/`. Do not hand-edit these files — re-run the `add` command to update.

### 4. Install LayerChart and D3

```sh
pnpm add layerchart d3
pnpm add -D @types/d3
```

### 5. Add zh-TW locale to Paraglide

Edit `project.inlang/settings.json` — add `"zh-TW"` to the `locales` array:

```json
{
	"$schema": "https://inlang.com/schema/project-settings",
	"modules": [
		"https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@4/dist/index.js",
		"https://cdn.jsdelivr.net/npm/@inlang/plugin-m-function-matcher@2/dist/index.js"
	],
	"plugin.inlang.messageFormat": {
		"pathPattern": "./messages/{locale}.json"
	},
	"baseLocale": "en",
	"locales": ["en", "zh-TW"]
}
```

Create `messages/zh-TW.json` (parallel to `messages/en.json`):

```json
{
	"$schema": "https://inlang.com/schema/inlang-message-format"
}
```

The Paraglide runtime (`src/lib/paraglide/`) is regenerated automatically when the dev server starts.

### 6. Enable dark mode globally

Edit `src/app.html` — add `class="dark"` to the `<html>` element:

```html
<html lang="%paraglide.lang%" dir="%paraglide.dir%" class="dark"></html>
```

This activates all Tailwind `dark:` utilities project-wide with no runtime toggle logic needed.

### 7. Start the development server

```sh
pnpm dev
```

Open `http://localhost:5173`. You should see the application shell. The Paraglide runtime is regenerated on first start after adding `zh-TW`.

---

## Running Tests

```sh
# Unit tests (Vitest, browser mode via Playwright)
pnpm test:unit

# End-to-end tests (Playwright)
pnpm test:e2e

# All tests
pnpm test

# Storybook (visual component development)
pnpm storybook
```

---

## Key Commands

| Command          | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `pnpm dev`       | Start dev server at localhost:5173             |
| `pnpm build`     | Production build                               |
| `pnpm check`     | TypeScript + Svelte type checking              |
| `pnpm lint`      | ESLint + Prettier check                        |
| `pnpm format`    | Auto-format with Prettier                      |
| `pnpm storybook` | Storybook component explorer at localhost:6006 |

---

## Project Layout Reference

```text
src/
├── lib/
│   ├── components/
│   │   ├── ui/          # Atoms — shadcn-svelte (do not hand-edit)
│   │   ├── molecules/   # Presentational composites (no state)
│   │   └── organisms/   # Stateful section components
│   ├── data/            # Mock/sample data
│   ├── state/           # app.svelte.ts — global activeSection + currentLocale
│   ├── paraglide/       # Generated i18n runtime (do not edit)
│   └── utils.ts         # cn() helper from shadcn-svelte
├── routes/
│   ├── +layout.svelte   # 3-column shell template + <Toaster>
│   └── +page.svelte     # Root page — mounts all organisms
messages/
├── en.json              # English strings
└── zh-TW.json           # Traditional Chinese strings
```

---

## Implementation Notes

- **Svelte 5 runes only**: All components use `$state`, `$derived`, `$effect`, `$props`. No legacy stores or `$:` reactive statements.
- **Organisms stay mounted**: All 10 section organisms are mounted in the DOM at all times; visibility is toggled via `style:display`. This preserves `$state` across navigation (FR-005).
- **Language switching**: Call `setLocale(locale)` from `$lib/paraglide/runtime`; this updates all `m.*` message functions without a page reload or URL change.
- **Toast notifications**: Use `toast.success()` / `toast.info()` from `svelte-sonner` (installed via shadcn-svelte). `<Toaster />` is placed once in `+layout.svelte`.
- **Dark theme**: `class="dark"` on `<html>` is the only dark mode mechanism. No JavaScript toggle.
- **Export CSV/JSON**: Use `URL.createObjectURL(new Blob([content]))` + programmatic `<a>` click for browser downloads.
