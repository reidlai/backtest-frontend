<!--
SYNC IMPACT REPORT
==================
Version change:    1.0.0 → 2.0.0
Bump type:         MAJOR (backward-incompatible removal of mandatory CI gate and required
                   directory; implementations that relied on ci-sast-threatmodel as a
                   required status check must be updated)
Ratified:          2026-05-19
Last amended:      2026-05-19

Principles modified:
  7. DevSecOps Gates (Blocking)
     - Removed: ci-sast-threatmodel from mandatory CI (on PR to main) gate list.
       Rationale: threat modelling is a design-time and asynchronous activity; enforcing
       it as a blocking PR gate adds friction without proportional security benefit for
       this project's current maturity level.
  9. Directory & Files That Must Exist
     - Removed: threat_modelling/reports/ from the required directory list.

Sections modified:
  - Operational Constraints & Gates → Definitions of Done (Main PR DoD updated)
  - Operational Constraints & Gates → Enforcement Mapping (ci-sast-threatmodel row removed)

Templates updated:
  - .specify/templates/plan-template.md   ✅ Constitution Check CI gates row updated
  - .specify/templates/tasks-template.md  ✅ [SAST] task type removed

Follow-up TODOs:
  - The existing 002-github-ci-workflow implementation contains a ci-sast-threatmodel job
    that is now no longer constitutionally required. It may remain as a non-blocking
    informational job or be removed in a follow-up feature branch.
  - The threat_modelling/reports/.gitkeep file and directory committed in branch
    002-github-ci-workflow are no longer required; clean-up is optional but recommended.
-->

# backtest-frontend Constitution

## Purpose

This file defines immutable, non-negotiable engineering guardrails for this repository.
All specs, plans, and implementations MUST comply. Changes require the change-control
process below. This constitution is intentionally concise and enforceable.

## Scope

**Tech stack and images**: Services are packaged as Docker using distroless base images.
Multi-stage Docker builds are mandatory.

**Environments and branches**: local, main, dev, sit, uat, staging, prod. Main is
PR-only and has no runtime. Other env branches represent deployable environments.

## Decision Rights & Change Control

**File ownership**: `constitution.md` is protected. Changes require a PR approved by:
Security Lead + Product Owner (PO) + one Maintainer.

**Recording**: Each change MUST include a rationale and enforcement impact in the PR
description and be labeled `constitution-change`.

**Effective date**: Changes take effect only after CI policy jobs pass and merge
protection gates are satisfied.

## Core Principles

### 1. Branching, Protection, and Promotions

- No direct pushes to protected env branches (main, dev, sit, uat, staging, prod).
  All changes flow through PRs from issue branches named `{issueNumber}-{issue_title_snake_case}`.
- Git commits MUST be pushed only to issue-generated branches in the format `###-XXXXX`,
  where `###` is the sequential specification number managed by speckit **zero-padded to
  three digits** (e.g., 001, 042) and `XXXXX` is the summarized specification title in
  snake_case with variable length.
- Required promotion flow:
  1. local work → push → issue branch
  2. PR issue → main (CI must pass)
  3. PR main → dev (CD to dev; run unit, mocked integration, smoke)
  4. On dev pass: create a release tag
  5. PR dev (release tag) → sit (CD to sit; run integration tests)
  6. On sit pass: tag sit at head
  7. With approval: PR sit → uat (CD; run UAT)
  8. On uat pass: tag uat at head
  9. With approval: PR uat → staging (CD; pre-prod checks)
  10. On staging pass: tag staging at head
  11. With approval: PR staging → prod (CD; prod deploy)
- main is PR-only aggregation; it is NEVER deployed.

### 2. Environments & Configuration

- Environments: local (default), dev, sit, uat, staging, prod.
- Configuration is via environment variables (12-Factor App); no secrets in repo.
  Use dotenv or platform env management for local environments only.
- Dev/prod parity: keep environments as similar as possible (12-Factor App principle X).

### 3. Containers & Base Images

- ALL Docker images MUST use a distroless base image with multi-stage builds.
- Images MUST run as a non-root user, with minimal Linux capabilities, and include an
  explicit `HEALTHCHECK` instruction.

### 4. Secrets & Sensitive Data

- NEVER commit secrets, API keys, tokens, or certificates to the repository. All secrets
  MUST come from the runtime secret store or environment variables.
- CI MUST run secrets detection on every PR; any finding blocks merge until remediated.
- Waivers for secrets in repo are NEVER permitted (see Waiver/Override Process).

### 5. Dependencies & Licensing

- Only permissive licenses are permitted: MIT, Apache-2.0, BSD variants.
- Critical CVEs are zero-tolerance. Container HIGH/CRITICAL findings (see Rule 7) are
  also zero-tolerance: remove, patch, or provide an approved, time-bound waiver before
  merge. See Rule 7 for the waiver process.

### 6. Testing (BDD-First)

- Use Cucumber with Gherkin for all behavioral tests. Feature files MUST live in
  `./features/` and MUST be tagged (e.g., `@smoke`, `@integration`, `@api`).
- User stories and acceptance criteria in BDD format (Given/When/Then) MUST be fully
  defined and approved in the specification BEFORE any implementation plan or tasks
  are generated.
- Step definitions MUST be atomic and reusable; no business logic is permitted in steps.
- All relevant BDD scenarios MUST pass in the target environment before promotion.
- Unit tests MUST be isolated: no server runtime or external services; use mocks/stubs.

### 7. DevSecOps Gates (Blocking)

**CI (on PR to main)**:

- `ci-sca`: SCA passes; no CRITICAL findings. HIGH findings require an approved waiver.
- `ci-format-lint`: Formatting and linting pass.
- `ci-secrets-scan`: Secrets detection passes; any finding blocks merge.
- `ci-unit-tests`: All unit tests pass in an isolated environment.

**Container build (pre-merge to env branch)**:

- `build-and-scan-image`: Builds with a distroless base image using multi-stage build;
  scans with Trivy. CRITICAL/HIGH findings block unless an approved, time-boxed waiver
  is attached to the PR.

**CD per environment**:

- `cd-dast` (all envs): OWASP ZAP DAST MUST run and attach a report to the deployment.
- `cd-integration-tests`: Post-deploy integration tests; on dev, run with mock/stub.
- `cd-smoke-tests`: Post-deploy smoke tests via Cucumber; on dev, run with mock/stub.
  CRITICAL runtime vulnerabilities MUST trigger the rollback policy.

### 8. AI Agent Guardrails

AI coding agents MUST:

- Work only against local or issue branches; NEVER push to protected env branches.
- Ensure user stories and acceptance scenarios are fully defined and approved in the
  specification BEFORE proceeding to the planning phase (`/speckit-plan`).
- Generate or update BDD feature files in `./features/` for any new behaviors introduced;
  ensure CI passes locally before submitting a PR.
- NEVER introduce secrets, disable scans, or bypass branch naming or PR requirements.
- Include rationale for significant changes in the PR description (auto-generated is
  acceptable).
- Retain all agent prompts that impact code in PR comments or run artifacts for
  traceability; redact any sensitive information.

### 9. Directory & Files That Must Exist

The following files and directories MUST be present in every repository that is governed
by this constitution. Entries marked with a stack qualifier apply only to projects using
that stack.

- `.github/workflows/ci.yaml` — CI workflow (see Rule 7 Enforcement Mapping)
- `pre-commit-config.yaml` — Pre-commit framework configuration
- `e2e-tests/` — TypeScript end-to-end tests
- `features/` — Cucumber/Gherkin BDD feature files (see Rule 6)
- `deploy/docker/` — Dockerfile, entrypoint.sh, and related container assets
- `package.json` — Root manifest for TypeScript/Frontend stacks
- `go.mod` — Root manifest for Golang/Backend stacks
- `Cargo.toml` — Root manifest for Rust/Backend stacks
- `pubspec.yaml` — Root manifest for Flutter/Frontend stacks
- `frontend/` — Contains `typescript/` and/or `flutter/` per Rule 11
- `backend/` — Contains `go/` and/or `rust/` per Rule 11
- **For Golang stacks**:
  - `backend/go/pkg/` (exposed source)
  - `backend/go/internal/` (internal source)
  - `backend/go/cmd/` (entry point source)
  - `backend/go/tests/` (unit tests)
- **For Rust stacks**:
  - `backend/rust/src/` (source files)
  - `backend/rust/tests/` (integration tests)

### 10. Engineering Principles

- Adopt Twelve-Factor App and SOLID principles as defaults for maintainability and
  scalability. Deviation from either requires an approved waiver with documented
  rationale.

### 11. Virtual Module Structure

Every virtual module MUST follow a standardized directory structure to ensure
cross-platform compatibility and direct importability.

**Root manifests** (MUST be at project root for transparent imports):

- `package.json` — TypeScript/Frontend package; MUST map exports to `frontend/typescript/`
- `go.mod` — Golang module; exposes `backend/go/` packages
- `Cargo.toml` — Rust crate; points to `backend/rust/` source
- `pubspec.yaml` — Flutter/Frontend package

**Directory structure**:

- `frontend/typescript/` — TypeScript implementation (Next.js or SvelteKit)
- `frontend/flutter/` — Flutter implementation for cross-platform mobile support
- `backend/go/` — Golang experience API (BFF) layer
- `backend/rust/` — Rust experience API (BFF) layer

This structure ensures that the frontend can import state logic directly
(e.g., `import { ... } from 'module_a'`) and the backend can import the experience
layer (e.g., `import "github.com/xxxx/module_a/backend/go/pkg/..."`) while maintaining
a clean root-level module definition.

### 12. UI & Schema-First Development Workflow

All frontend virtual modules MUST follow this ordered workflow:

1. **Atomic Design**: UI components MUST be designed and organized as Atoms, Molecules,
   Organisms, Templates, and Pages.
2. **Organism-Level State**: Business logic and state management MUST be implemented at
   the Organism level. Atoms and Molecules MUST remain stateless (presentational only).
3. **Storybook Verification**: All UI components and their states MUST be verified and
   documented using Storybook BEFORE backend implementation begins.
4. **Zod Schema Creation**: Once Storybook verification is complete, Zod schemas MUST be
   created for every state and data contract.
5. **Contract Generation**: Zod schemas MUST be used as the source of truth to
   automatically generate: OpenAPI/Swagger specifications for the backend, and API
   clients for the frontend.

This workflow ensures frontend requirements drive the API contract, preventing
integration mismatches.

## Operational Constraints & Gates

### Definitions of Done (DoD) by Gate

**Main (PR)**: SCA, lint/format, secrets scan, unit tests all green; all required
artifacts uploaded.

**DEV**: Binary built; Docker container built with distroless base; container scanned;
Docker image pushed; service deployed; post-deploy DAST, post-deploy integration tests
(against composed services with mock/stub), and post-deploy smoke tests (via Cucumber
with mock/stub) all pass; image tagged `build-YYYYMMDDHHmm`.

**SIT**: Image tagged `build-YYYYMMDDHHmm` deployed; post-deploy DAST, integration
tests (against composed services), and smoke tests (via Cucumber) all pass; image tagged
`sit-YYYYMMDDHHmm`; all agreed non-functional acceptance criteria pass; stakeholder
sign-off recorded in PR.

**UAT**: Image tagged `sit-YYYYMMDDHHmm` deployed; post-deploy DAST, integration tests,
and smoke tests (via Cucumber) all pass; image tagged `uat-YYYYMMDDHHmm`; all agreed
functional acceptance criteria pass; stakeholder sign-off recorded in PR.

**Staging**: Image tagged `uat-YYYYMMDDHHmm` deployed; post-deploy DAST, integration
tests, and smoke tests (via Cucumber) all pass; image tagged `staging-YYYYMMDDHHmm`; all
agreed functional acceptance criteria pass; stakeholder sign-off recorded in PR.

**Prod**: Remove existing `blue` tag from Docker registry; image tagged
`staging-YYYYMMDDHHmm` becomes `green` and new image is tagged `prod-YYYYMMDDHHmm` and
`blue`; image tagged `green` deployed as production service; post-deploy DAST passes.

### Enforcement Mapping (Reference Job Names)

| Job                    | Trigger                 | Blocking Behavior                                                      |
| ---------------------- | ----------------------- | ---------------------------------------------------------------------- |
| `ci-sca`               | PR to main              | Blocks on CRITICAL; HIGH requires approved waiver                      |
| `ci-format-lint`       | PR to main              | Blocks on any violation                                                |
| `ci-secrets-scan`      | PR to main              | Blocks on any finding; no waiver permitted                             |
| `ci-unit-tests`        | PR to main              | Blocks on any failure                                                  |
| `build-and-scan-image` | Pre-merge to env branch | Blocks on HIGH/CRITICAL unless approved waiver attached and time-boxed |
| `cd-dast`              | Post-deploy (all envs)  | OWASP ZAP; report attached to deployment                               |
| `cd-integration-tests` | Post-deploy (all envs)  | Env-specific suites; mock/stub on dev                                  |
| `cd-smoke-tests`       | Post-deploy (all envs)  | Cucumber scenarios; mock/stub on dev                                   |

### Waiver/Override Process

**When allowed**: Only for time-bound risk acceptance where no feasible remediation
exists before a deadline. NEVER permitted for secrets committed to the repository.

**Scope**: Specific finding(s), version(s), environment(s), and duration (max 30 days).

**Approval**: Security Lead + Product Owner MUST both approve in the PR. Label the PR
`security-waiver` and link to a GitHub Issue containing the justification and expiry date.

**Recording**: Create a GitHub Issue with full details and link to PR; set an
auto-reminder before expiry. Re-review is required at expiry.

**CI behavior**: Jobs MUST read waiver metadata to determine whether to continue;
otherwise they block unconditionally.

## Architecture & Technology Strategy

### Monorepo Architecture & Stack Strategy

#### Workspace Authority (Moonrepo)

- The project MUST use **moonrepo** (`moon`) as the exclusive build system and task
  runner.
- Moonrepo is the source of truth for the project graph. Strict boundaries between
  projects MUST be enforced via `moon.yml` configurations.
- All environments (local dev and CI) MUST use Moonrepo's toolchain management to pin
  specific versions of Node.js and Golang, eliminating "works on my machine" issues.

#### Authorized Tech Stack

- **Frontend Layer**: Next.js or SvelteKit for all web interfaces and client-side apps.
- **Backend Layer**: Golang, Python, or Rust for all core API services.
- **Unified CI/CD**: CI pipelines MUST use Moonrepo's caching (`moon ci`) to build and
  test only affected projects, preventing redundant computation across frontend and
  backend.

## Governance

This constitution supersedes all other practices. All PRs and reviews MUST verify
compliance with each applicable principle. Complexity MUST be justified; use `CLAUDE.md`
for runtime development guidance.

Amendments require: written documentation of the change, approval from Security Lead +
PO + one Maintainer, the `constitution-change` label on the PR, and passing CI policy
jobs before merge.

**Version**: 2.0.0 | **Ratified**: 2026-05-19 | **Last Amended**: 2026-05-19
