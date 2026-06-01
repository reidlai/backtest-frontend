---
description: 'Task list for fix-pnpm-build-approval'
---

# Tasks: Fix pnpm Build Approval Error

**Input**: Design documents from `specs/016-fix-pnpm-build-approval/`

**Prerequisites**: plan.md ✅, spec.md ✅

## Phase 1: Setup

**Purpose**: Apply pnpm v10 → v11 config migration

- [x] T001 Remove deprecated `allowBuilds` map key from `pnpm-workspace.yaml`
- [x] T002 Move `pnpm.overrides` from `package.json` `pnpm` field into `pnpm-workspace.yaml` `overrides` section

---

## Phase 2: User Story 1 - Developer Runs Dev Server (Priority: P1) 🎯 MVP

**Goal**: `pnpm install` and `pnpm dev` complete without error after the config migration.

**Independent Test**: Run `pnpm install` (expect exit 0, no "approve-builds" message), then run `pnpm dev` (expect Vite to start on localhost:5173).

### Implementation for User Story 1

- [x] T003 [US1] Verify `pnpm install` exits 0 with no `ERR_PNPM_IGNORED_BUILDS` or `approve-builds` error
- [x] T004 [US1] Verify `pnpm dev` starts Vite on `http://localhost:5173/` without errors

**Checkpoint**: Both T003 and T004 pass — fix is complete and verified.

---

## Phase 3: Polish & Cross-Cutting Concerns

- [ ] T005 [P] Commit `pnpm-workspace.yaml` and `package.json` changes with spec artifacts (`specs/016-fix-pnpm-build-approval/`)

---

## Dependencies & Execution Order

- **Phase 1** (T001, T002): Sequential — T002 depends on T001 completing the file restructure
- **Phase 2** (T003, T004): Depends on Phase 1 — T003 before T004
- **Phase 3** (T005): Depends on Phase 2 verification passing

### Parallel Opportunities

None — all tasks are sequential by nature (config → install → dev → commit).

---

## Implementation Strategy

### MVP (only story, already done)

1. ✅ Complete Phase 1: config migration applied
2. ✅ Complete Phase 2: `pnpm install` and `pnpm dev` verified
3. Complete Phase 3: commit

---

## Notes

- T001 and T002 are already applied; mark as complete before proceeding to T003/T004 verification
- [P] on T005 is relative — it can run independently once T003/T004 pass
