# Implementation Plan: GitHub CI Workflow with Security and Quality Gates

**Branch**: `002-github-ci-workflow` | **Date**: 2026-05-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-github-ci-workflow/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement a multi-stage GitHub Actions CI pipeline for the SvelteKit frontend project that enforces four sequential blocking quality gates (`ci-sca` → `ci-format-lint` → `ci-secrets-scan` → `ci-unit-tests`), builds a distroless Docker image from `deploy/docker/Dockerfile`, runs Trivy image scan against the built image, and publishes verified images to GHCR on main branch pushes and semantic version tags. Key prerequisites: swap `adapter-auto` for `@sveltejs/adapter-node`; move Docker assets to `deploy/docker/`; create BDD feature file before implementation (Constitution v2.0.0).

## Technical Context

**Language/Version**: TypeScript 6.0.2, Node.js 24 LTS (upgraded from 22 — EOL 2027-04-30)

**Framework**: SvelteKit 2.57.0, Vite 8

**Package Manager**: pnpm (pnpm-lock.yaml present)

**Primary Dependencies**:

- SCA: `audit-ci` via `pnpm dlx` — exits non-zero on High/Critical, produces JSON report for FR-012
- Formatting: Prettier 3.x (already configured, `prettier --check .`)
- Linting: ESLint 10 + eslint-plugin-svelte + typescript-eslint (already configured, `eslint .`)
- Testing: Vitest 4 — `pnpm vitest run --project server --coverage` (Node.js env, no browser/external deps)
- Build: `pnpm build` with `@sveltejs/adapter-node` → outputs `build/index.js`
- Docker: multi-stage build (deps + builder → distroless `gcr.io/distroless/nodejs24-debian12` runner, non-root, HEALTHCHECK) — Constitution Rule 3
- Container image scan (SAST): `aquasecurity/trivy-action` — static image scan, no running container
- Secrets Scan: Gitleaks CLI v8.30.1 (direct install via curl + sha256 checksum verification; Go binary, no Node.js dependency) — Constitution Rule 4 + Rule 7
- Registry: GHCR via `docker/login-action` + re-tag + `docker push` (promotes SAST-verified tarball, not a rebuild)

**Storage**: N/A

**Testing**: Vitest 4 (`--project server` only in CI; no browser, no Playwright dependency)

**Target Platform**: GitHub Actions (ubuntu-latest), Docker (distroless Node.js 24 LTS Debian container)

**Project Type**: Web application frontend (SvelteKit SSR/SPA)

**Performance Goals**:

- Pipeline triggers within 2 minutes of push event (SC-001)
- Full pipeline completes within 30 minutes (SC-002)

**Constraints**:

- Unit test stage must run without browser or network access (`--project server` only)
- GHCR push restricted to `main` branch and `v*.*.*` semver tags (FR-011)
- Fork PRs: quality gates only; build, SAST, and push stages skipped (Assumption)
- Build directory (`./build/`) is NOT retained as a downloadable CI artifact (FR-007)
- The CI workflow MUST use a Node.js LTS version that has not reached End of Life; review and update `node-version:`, Dockerfile base images, and `package.json` engines at each Node.js LTS EOL boundary (Node.js 24 LTS EOL: 2029-04-30)
- `.trivyignore` suppression file must be tracked in version control (FR-015)
- Docker image MUST use distroless base, non-root user, explicit HEALTHCHECK (Constitution Rule 3)
- Dockerfile MUST be located at `deploy/docker/Dockerfile` (Constitution Rule 9)
- BDD feature file MUST be created before any CI job implementation (Constitution Rule 6)
- Workflow file MUST be `.github/workflows/ci.yaml` (Constitution Rule 9)
- CI job names MUST match constitution enforcement mapping (Constitution Rule 7)

**Scale/Scope**: Single frontend repository, single workflow file (`.github/workflows/ci.yaml`), 17 implementation tasks

## Constitution Check

_GATE: Constitution v2.0.0 applied. Original design had 13 CRITICAL violations; all resolved in tasks.md remediation (2026-05-19). Two rows marked N/A — constitution v2.0.0 MAJOR amendment (2026-05-19) removed ci-sast-threatmodel as a mandatory gate and threat_modelling/reports/ as a required directory; both subsequently removed from implementation in analysis remediation (2026-05-20)._

| Gate                                                                   | Rule       | Status          | Resolution                                                                                 |
| ---------------------------------------------------------------------- | ---------- | --------------- | ------------------------------------------------------------------------------------------ |
| Branch name `002-github-ci-workflow` matches `###-feature-name` format | Rule 1     | ✅              | —                                                                                          |
| BDD acceptance criteria in spec before this plan                       | Rule 6     | ✅              | spec.md has Given/When/Then scenarios; T005 creates `features/` file before implementation |
| Docker image uses distroless base; non-root; HEALTHCHECK               | Rule 3     | ✅ (remediated) | T008 updated: `gcr.io/distroless/nodejs24-debian12`, `USER nonroot:nonroot`, HEALTHCHECK; upgraded from nodejs22 to nodejs24 in Phase 8 (T020)   |
| Docker assets in `deploy/docker/`                                      | Rule 9     | ✅ (remediated) | T008 path changed from repo root to `deploy/docker/Dockerfile`                             |
| Workflow file is `.github/workflows/ci.yaml`                           | Rule 9     | ✅ (remediated) | T009 extension corrected from `.yml` to `.yaml`                                            |
| `ci-secrets-scan` job present                                          | Rule 7     | ✅ (remediated) | T012 added: Gitleaks-based secrets detection                                               |
| `ci-sast-threatmodel` job present (blocking CI gate)                   | Rule 7     | N/A (v2.0.0)    | Not required by constitution v2.0.0; job removed from implementation (2026-05-20)          |
| `features/` directory exists with BDD files                            | Rules 6, 9 | ✅ (remediated) | T005 creates `features/ci-quality-gates.feature`                                           |
| `threat_modelling/reports/` directory exists                           | Rules 7, 9 | N/A (v2.0.0)    | Not required by constitution v2.0.0; directory removed from implementation (2026-05-20)    |
| `pre-commit-config.yaml` exists                                        | Rule 9     | ✅ (remediated) | T007 creates `pre-commit-config.yaml`                                                      |
| Job names match enforcement mapping (4 required gates)                 | Rule 7     | ✅ (remediated) | `ci-sca`, `ci-format-lint`, `ci-secrets-scan`, `ci-unit-tests`                             |
| No secrets committed                                                   | Rule 4     | ✅              | GITHUB_TOKEN used; no committed credentials                                                |

**Outstanding pre-existing repository violations** (require separate features, not blocking this feature):

- `e2e-tests/` directory absent (Rule 9) — requires dedicated e2e test feature
- `frontend/` directory absent (Rules 9, 11) — requires virtual module structure refactor feature

## Project Structure

### Documentation (this feature)

```text
specs/002-github-ci-workflow/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── workflow-triggers.md
│   └── image-tagging.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
.github/
└── workflows/
    └── ci.yaml            # NEW: Main CI workflow (MUST be .yaml per Constitution Rule 9)

deploy/
└── docker/
    ├── Dockerfile         # NEW: Multi-stage, distroless runner (Constitution Rules 3, 9)
    └── entrypoint.sh      # NEW: Stub (not used with distroless; reserved for future use)

features/
└── ci-quality-gates.feature  # NEW: BDD scenarios US1–US4 (Constitution Rules 6, 8)

.dockerignore              # NEW: Excludes node_modules, .svelte-kit, specs, etc.
.trivyignore               # NEW: Empty CVE suppression file (tracked in VCS)
pre-commit-config.yaml     # NEW: Pre-commit hooks — secrets, format, lint (Constitution Rule 9)
svelte.config.js           # MODIFIED: adapter-auto → adapter-node
package.json               # MODIFIED: add @sveltejs/adapter-node as devDependency
```

**Structure Decision**: Single `ci.yaml` workflow. Docker assets in `deploy/docker/` per Rule 9. BDD feature file in `features/` per Rules 6 and 9. No application source directory changes beyond the adapter swap.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

All 13 CRITICAL violations from `/speckit-analyze` (2026-05-19) resolved via tasks.md remediation. See Constitution Check section above for full gate status table. Two pre-existing repository violations (e2e-tests/, frontend/) noted but outside this feature's scope.

## Key Design Decisions

### Job Dependency Chain

```
ci-sca → ci-format-lint → ci-secrets-scan → ci-unit-tests → build → sast → push-to-ghcr
```

Job names match the Constitution Rule 7 enforcement mapping exactly. Each job `needs` the previous; GitHub Actions skips all downstream jobs when any dependency fails — no explicit `if: success()` required.

### Two-Stage Security Model (Constitution Rule 7)

This feature implements two distinct security gates with non-overlapping scopes:

| Job      | Stage           | Tool     | Scope                                                                         | Output              |
| -------- | --------------- | -------- | ----------------------------------------------------------------------------- | ------------------- |
| `ci-sca` | CI gate         | audit-ci | Source-level declared dependencies (pnpm-lock.yaml)                           | `sca-report.json`   |
| `sast`   | Post-build gate | Trivy    | Built Docker image (OS packages, bundled deps, misconfigs, secrets in layers) | `trivy-report.sarif` |

`sast` (Trivy) is the spec's container image CVE gate, conceptually equivalent to Constitution's `build-and-scan-image`. `ci-sca` covers source-level dependencies. These are NOT the same tool or purpose.

### SCA Tool: audit-ci

`audit-ci` via `pnpm dlx` provides:

- Reliable non-zero exit on High/Critical CVEs
- JSON report output for FR-012 artifact requirement
- No package installation — `pnpm dlx` runs it ephemerally

Alternative `pnpm audit --audit-level=high` is simpler but produces no machine-readable artifact.

See `research.md` Decision 1 for full rationale.

### SvelteKit Adapter: adapter-node

`adapter-auto` does not deterministically produce `build/index.js` in a generic Docker container. `@sveltejs/adapter-node` must replace it.

Build output: `./build/` directory, entry point `node build/index.js`, port via `PORT` env var (default 3000).

`d3` and `layerchart` are runtime `dependencies` and may be used server-side — `node_modules` must be copied to the Docker runner stage.

See `research.md` Decision 2 for full rationale.

### Unit Tests: --project server

The `vite.config.ts` defines three Vitest projects. Only `server` runs in pure Node.js without browser binaries:

- `client`: requires Playwright Chromium — not permitted in this stage
- `storybook`: requires Playwright Chromium — not permitted in this stage
- `server`: `environment: 'node'` — qualifies for FR-005 isolation requirement

### Concurrency: Per-job Override for Push Stage

Workflow-level `cancel-in-progress: true` cancels quality gate jobs on superseded commits. The `push-to-ghcr` job uses a separate concurrency group with `cancel-in-progress: false` to honor FR-017's "MAY complete" clause for push stages already in progress.

### Fork PR Isolation

Fork PRs cannot access repository secrets. Build, SAST, and push stages are gated by:

```yaml
if: github.event.pull_request.head.repo.full_name == github.repository
```

Quality gates run unconditionally.

### Trivy Image Scan Scope (`sast` job)

Trivy scans the **built Docker image** (not source manifests). Covers:

- OS packages (`gcr.io/distroless/nodejs22-debian12` base layers)
- Bundled application dependencies within image layers
- Dockerfile misconfigurations
- Accidentally committed secrets within image layers

This is distinct from the SCA stage which scans source-level declared dependencies (`pnpm-lock.yaml`). `.trivyignore` at repo root is passed to Trivy for explicit CVE suppression.

### Distroless Docker Design

The runner stage uses `gcr.io/distroless/nodejs24-debian12`:

- No shell — HEALTHCHECK and CMD must use exec array form with the Node.js binary path `/nodejs/bin/node`
- The distroless image's ENTRYPOINT is already `/nodejs/bin/node`, so CMD is the script path: `["/app/build/index.js"]`
- `USER nonroot:nonroot` — the `nonroot` user (UID 65532) is built into the distroless image
- `d3` and `layerchart` runtime dependencies require copying `node_modules` from the deps stage

### Image Provenance: Tarball Promotion (SC-007)

T015 (build job) saves the Docker image as a tarball (`/tmp/image.tar`, 1-day artifact). T016 (sast) loads and scans it. T017 (push-to-ghcr) loads the same tarball, re-tags it with final GHCR metadata, and pushes. This guarantees the published image digest matches the scanned digest — satisfying SC-007's 100% traceability requirement.

### Artifact Retention (FR-012 + Constitution Rule 7)

| Stage         | Job                   | Artifact Name             | Content                                      | Retention |
| ------------- | --------------------- | ------------------------- | -------------------------------------------- | --------- |
| SCA           | `ci-sca`              | `sca-report`          | `sca-report.json` (audit-ci JSON)            | 30 days   |
| Format + Lint | `ci-format-lint`      | `format-lint-report`  | `prettier-report.txt` + `eslint-report.json` | 30 days   |
| Secrets Scan  | `ci-secrets-scan`     | `secrets-scan-report` | `gitleaks.report.json`                       | 30 days   |
| Unit Tests    | `ci-unit-tests`       | `coverage-report`     | `coverage/` directory (v8 coverage)          | 30 days   |
| Image Scan    | `sast`                | `trivy-sast-report`   | `trivy-report.sarif`                         | 30 days   |
