# Contract: Workflow Triggers and Stage Eligibility

**Branch**: `002-github-ci-workflow` | **Date**: 2026-05-19

This contract defines which pipeline stages run for each trigger event and context.

---

## Trigger Events

```yaml
on:
  push:
    branches: ['**']
    tags: ['v[0-9]+.[0-9]+.[0-9]+']
  pull_request:
    branches: [main]
```

---

## Stage Eligibility Matrix

| Stage        | Push (feature branch) | Push (main) | Push (semver tag) | PR (from fork) | PR (same-repo) |
| ------------ | --------------------- | ----------- | ----------------- | -------------- | -------------- |
| SCA          | ✅                    | ✅          | ✅                | ✅             | ✅             |
| Format       | ✅                    | ✅          | ✅                | ✅             | ✅             |
| Lint         | ✅                    | ✅          | ✅                | ✅             | ✅             |
| Unit Tests   | ✅                    | ✅          | ✅                | ✅             | ✅             |
| Build Docker | ✅                    | ✅          | ✅                | ❌             | ✅             |
| SAST (Trivy) | ✅                    | ✅          | ✅                | ❌             | ✅             |
| Push to GHCR | ❌                    | ✅          | ✅                | ❌             | ❌             |

**Fork PR restriction** (FR-016 + Assumption): PRs from forked repositories run only quality gate stages. Build, SAST, and push stages are skipped to protect repository secrets.

Detection expression:

```yaml
if: github.event.pull_request.head.repo.full_name == github.repository
```

**GHCR push condition** (FR-011):

```yaml
if: |
  (github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/v')) &&
  github.event_name == 'push'
```

---

## Required Status Checks (FR-016)

The following job names MUST be registered as required status checks in GitHub branch protection for the `main` branch:

- `sca`
- `format`
- `lint`
- `test`

Build, SAST, and push jobs are not required status checks (they run only after quality gates pass and are informational for feature branches).

---

## Concurrency Policy (FR-017)

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Push job override (prevents partial GHCR pushes):

```yaml
jobs:
  push-to-ghcr:
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}-push
      cancel-in-progress: false
```

---

## Sequential Gate Enforcement

Quality gates run sequentially via `needs` dependencies:

```
sca → format → lint → test → build → sast → push
```

If any gate job fails or is cancelled, all downstream jobs that `needs` it are automatically skipped by GitHub Actions. No explicit `if: success()` guards are needed for the sequential chain; they are implicit in `needs`.
