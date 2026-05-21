# Data Model: GitHub CI Workflow

**Branch**: `002-github-ci-workflow` | **Date**: 2026-05-19

This feature introduces CI infrastructure, not application data models. The "entities" are the conceptual objects defined in the spec, mapped to their GitHub Actions / GHCR representations.

---

## Entity: Pipeline Run

**Represents**: A single execution of the CI workflow.

| Field           | Type     | Value / Source                                                     |
| --------------- | -------- | ------------------------------------------------------------------ |
| `id`            | string   | `github.run_id` — unique integer assigned by GitHub                |
| `commit_sha`    | string   | `github.sha` — full 40-char SHA; short form via `${GITHUB_SHA::7}` |
| `branch`        | string   | `github.ref_name` (e.g., `main`, `feature/x`, `v1.2.3`)            |
| `trigger_event` | enum     | `push` or `pull_request`                                           |
| `actor`         | string   | `github.actor` — username who triggered the run                    |
| `status`        | enum     | `pending` → `in_progress` → `success` / `failure` / `cancelled`    |
| `created_at`    | datetime | `github.event.head_commit.timestamp`                               |

**State transitions**:

```
triggered → quality-gates (SCA → Format → Lint → Test) → build → SAST → [push] → complete
                                    │
                          any stage fails → halt (subsequent jobs skipped)
```

---

## Entity: Quality Gate Stage

**Represents**: An individual check job that must pass before build stages begin.

| Stage      | Job Name | Tool                            | Failure Condition                  | Report Artifact       |
| ---------- | -------- | ------------------------------- | ---------------------------------- | --------------------- |
| SCA        | `sca`    | `audit-ci`                      | Any High/Critical CVE (CVSS ≥ 7.0) | `sca-report.json`     |
| Formatting | `format` | Prettier (`prettier --check .`) | Any file non-conformant            | None (stdout diff)    |
| Linting    | `lint`   | ESLint (`eslint .`)             | Any lint violation                 | None (stdout)         |
| Unit Tests | `test`   | Vitest (`--project server`)     | Any test failure                   | `coverage/` directory |

**Execution order**: Sequential — each job `needs` the previous job (SCA → Format → Lint → Test).

**Failure behavior**: GitHub Actions `needs` dependency causes subsequent jobs to be skipped automatically when a dependency fails.

---

## Entity: Build Artifact

**Represents**: The intermediate build product and the Docker container image derived from it.

| Field           | Type     | Value                                                                    |
| --------------- | -------- | ------------------------------------------------------------------------ |
| `build_dir`     | path     | `./build/` — SvelteKit adapter-node output (NOT retained as CI artifact) |
| `entry_point`   | path     | `./build/index.js` — Node.js server entry                                |
| `image_name`    | string   | `ghcr.io/{owner}/{repo}`                                                 |
| `image_tags`    | string[] | See tagging contract in `contracts/image-tagging.md`                     |
| `base_image`    | string   | `node:20-alpine`                                                         |
| `build_context` | path     | Repository root                                                          |

**Intermediate binary**: The `./build/` directory is used solely to construct the Docker image layer. It is copied into the image and not uploaded as a separate downloadable CI artifact (FR-007).

---

## Entity: SAST Report

**Represents**: The Trivy static analysis findings for the built Docker image.

| Field                | Type     | Value                                                         |
| -------------------- | -------- | ------------------------------------------------------------- |
| `scanner`            | string   | `aquasecurity/trivy-action`                                   |
| `scan_target`        | string   | Built Docker image (image name + tag)                         |
| `scan_type`          | string   | `image` (static, no running container)                        |
| `scan_scope`         | string[] | OS packages, bundled app deps, Dockerfile misconfigs, secrets |
| `report_format`      | string   | SARIF or table (configurable)                                 |
| `artifact_name`      | string   | `trivy-sast-report`                                           |
| `retention_days`     | int      | 30                                                            |
| `blocking_threshold` | string   | HIGH, CRITICAL (CVSS ≥ 7.0)                                   |
| `suppression_file`   | path     | `.trivyignore` (tracked in VCS)                               |

**State transitions**:

```
image built → trivy scan → findings classified
  → HIGH/CRITICAL found → pipeline FAILS, report uploaded
  → MEDIUM/LOW only     → warnings logged, report uploaded, pipeline continues
  → CLEAN               → report uploaded, push stage proceeds
```

---

## Entity: Published Image

**Represents**: A Docker image successfully pushed to GHCR after all gates pass.

| Field            | Type   | Value                                                                        |
| ---------------- | ------ | ---------------------------------------------------------------------------- |
| `registry`       | string | `ghcr.io`                                                                    |
| `repository`     | string | `ghcr.io/{github.repository_owner}/{github.event.repository.name}`           |
| `tag_ref`        | string | Branch name (e.g., `main`) or semver tag (e.g., `v1.2.3`)                    |
| `tag_sha`        | string | Short commit SHA (7 chars, e.g., `a1b2c3d`)                                  |
| `tag_latest`     | string | `latest` — applied only on semver tag pushes                                 |
| `digest`         | string | Image content digest, reported in pipeline summary                           |
| `push_condition` | string | `github.ref == 'refs/heads/main'` OR `startsWith(github.ref, 'refs/tags/v')` |

**Published on**: main branch push and `v*.*.*` tag push only.
**Not published on**: feature branches, pull_request events, fork PRs.

---

## Job Dependency Graph

```
trigger (push / PR)
│
├── sca
│   └── format
│       └── lint
│           └── test
│               └── build-binary-and-docker
│                   └── sast (trivy)
│                       └── push-to-ghcr (main/tag only)
│
└── [fork PR] ──► sca → format → lint → test (only; build/sast/push skipped)
```

---

## Suppression File

**`.trivyignore`** — tracked in version control at repository root.

Format: one CVE ID per line (comments with `#` are allowed).

```
# CVE-YYYY-NNNNN  Acknowledged YYYY-MM-DD: no fix available, risk accepted
```

An absent or empty `.trivyignore` means all findings at HIGH/CRITICAL severity block the pipeline.
