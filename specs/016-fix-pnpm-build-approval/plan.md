# Implementation Plan: Fix pnpm Build Approval Error

**Branch**: `016-fix-pnpm-build-approval` | **Date**: 2026-06-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/016-fix-pnpm-build-approval/spec.md`

## Summary

Remove the deprecated pnpm v10 `allowBuilds` map key from `pnpm-workspace.yaml` and migrate `pnpm.overrides` from `package.json` to `pnpm-workspace.yaml`, so that pnpm v11 can install and run the dev server without error.

Both changes have already been applied and verified: `pnpm install` exits 0 and `pnpm dev` starts cleanly.

## Technical Context

**Language/Version**: Node.js ≥24, pnpm 11.5.0

**Primary Dependencies**: pnpm workspace config (`pnpm-workspace.yaml`), `package.json`

**Storage**: N/A

**Testing**: Manual — run `pnpm install` (exit 0) and `pnpm dev` (server starts)

**Target Platform**: macOS / Linux developer workstation

**Project Type**: SvelteKit web application (frontend)

**Performance Goals**: N/A — config-only change

**Constraints**: Must not break existing `onlyBuiltDependencies` allowlist for `@tailwindcss/oxide` and `esbuild`

**Scale/Scope**: Two config files modified

## Constitution Check

| Gate | Rule | Check | Status |
|---|---|---|---|
| Branch name follows `###-feature-name` format | Rule 1 | `016-fix-pnpm-build-approval` matches pattern | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | Given/When/Then scenarios present in spec.md | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | No Docker involvement | N/A |
| CI gates covered by tasks | Rule 7 | Config-only fix; no new CI jobs required | N/A |
| Required directory structure included | Rule 9 | No new source directories introduced | N/A |
| UI components follow Atomic Design + Storybook | Rule 12 | No UI components affected | N/A |
| Virtual module structure respected | Rule 11 | No new modules | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | Only package version overrides — no secrets | ✅ |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/016-fix-pnpm-build-approval/
├── plan.md              # This file
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Quality checklist (all pass)
```

### Source Code (repository root)

```text
pnpm-workspace.yaml      # Removed allowBuilds map; added overrides section
package.json             # Removed pnpm.overrides field (moved to workspace yaml)
```

## Phase 0: Research

No unknowns — root cause identified from pnpm v11 release notes:

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| Remove `allowBuilds` map key | pnpm v11 dropped support for the v10 `allowBuilds: pkg: true` map syntax | Keep `allowBuilds` as list — redundant with `onlyBuiltDependencies`; chose removal |
| Move `pnpm.overrides` to `pnpm-workspace.yaml` | pnpm v11 no longer reads `pnpm` field from `package.json` | Keep in `package.json` — causes WARN on every install |

## Phase 1: Design & Contracts

No data model or external interface contracts — this is a purely declarative config change.

### Changes Applied

**`pnpm-workspace.yaml`** — before:
```yaml
allowBuilds:
  esbuild: true
onlyBuiltDependencies:
  - '@tailwindcss/oxide'
  - esbuild
```

**`pnpm-workspace.yaml`** — after:
```yaml
onlyBuiltDependencies:
  - '@tailwindcss/oxide'
  - esbuild

overrides:
  cookie: 0.7.2
```

**`package.json`** — removed:
```json
"pnpm": {
  "overrides": {
    "cookie": "0.7.2"
  }
}
```

### Verification

- `pnpm install` — exits 0, no "approve-builds" error
- `pnpm dev` — Vite starts on `http://localhost:5173/` within normal startup time
