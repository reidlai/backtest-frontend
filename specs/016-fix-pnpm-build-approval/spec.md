# Feature Specification: Fix pnpm Build Approval Error

**Feature Branch**: `016-fix-pnpm-build-approval`

**Created**: 2026-06-01

**Status**: Draft

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Runs Dev Server (Priority: P1)

A developer upgrades pnpm from v10 to v11 and attempts to run `pnpm dev`. The command fails because `pnpm-workspace.yaml` contains the deprecated `allowBuilds` key from pnpm v10, which pnpm v11 no longer recognizes. The fix removes the obsolete key and ensures only `onlyBuiltDependencies` is used.

**Why this priority**: Blocking — no developer can start the dev server.

**Independent Test**: Run `pnpm dev` after fix and confirm it starts without error.

**Acceptance Scenarios**:

1. **Given** pnpm v11 is installed and `pnpm-workspace.yaml` uses only `onlyBuiltDependencies`, **When** `pnpm dev` is run, **Then** the server starts successfully without a "Command failed" error.
2. **Given** the fixed config, **When** `pnpm install` is run, **Then** it completes without prompting to run `pnpm approve-builds`.

### Edge Cases

- What if a new dependency added in the future also requires build approval? The `onlyBuiltDependencies` list must be updated to include it.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: `pnpm-workspace.yaml` MUST NOT contain the deprecated `allowBuilds` key.
- **FR-002**: `pnpm-workspace.yaml` MUST retain `onlyBuiltDependencies` listing all packages that require build scripts (`@tailwindcss/oxide`, `esbuild`).
- **FR-003**: Running `pnpm install` MUST succeed without prompting to approve builds.
- **FR-004**: Running `pnpm dev` MUST start the development server without errors.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: `pnpm dev` starts successfully within 60 seconds of running the command after the fix.
- **SC-002**: `pnpm install` exits with code 0 and no "approve-builds" error message.

## Assumptions

- The only required build-script packages are `@tailwindcss/oxide` and `esbuild`, already listed under `onlyBuiltDependencies`.
- No other pnpm v10-specific workspace keys are present that need migration.
- During remediation a Claude Code file-watcher hook transiently restored a placeholder `allowBuilds` entry; this was resolved by removing the key entirely. The final `pnpm-workspace.yaml` contains no `allowBuilds` field.
