# Quickstart: GitHub CI Workflow

**Branch**: `002-github-ci-workflow` | **Date**: 2026-05-19

---

## Prerequisites

- GitHub repository with Actions enabled
- GHCR package write permission (granted via `GITHUB_TOKEN` — no additional secrets required)
- GitHub branch protection rules configured on `main` (see Setup step 3)
- Docker installed locally (for Dockerfile testing)
- `pnpm` installed locally

---

## Local Quality Gate Verification

Run each gate locally before pushing to verify pipeline will pass:

```bash
# 1. SCA — dependency scan
pnpm dlx audit-ci --high

# 2. Formatting check
pnpm prettier --check .

# 3. Linting
pnpm eslint .

# 4. Unit tests (server project only, with coverage)
pnpm vitest run --project server --coverage
```

All commands run from the repository root. Exit code 0 = pass, non-zero = fail.

---

## Local Docker Build Verification

```bash
# Build the Docker image locally (Dockerfile lives in deploy/docker/)
docker build -f deploy/docker/Dockerfile -t backtest-frontend:local .

# Run the container as nonroot (matches distroless USER nonroot:nonroot = UID 65532)
docker run --rm --user 65532:65532 -p 3000:3000 backtest-frontend:local

# Open http://localhost:3000 to verify the app serves
```

If the build fails, verify `svelte.config.js` uses `@sveltejs/adapter-node` (not `adapter-auto`).

---

## Triggering the CI Pipeline

**Quality gates only** (any branch):

```bash
git push origin feature/your-branch
```

**Full pipeline including SAST** (any branch push after quality gates pass):
The build and SAST jobs run automatically on all branch pushes after quality gates pass.

**Full pipeline including GHCR push**:

```bash
# Push to main
git push origin main

# Or push a semver tag
git tag v1.0.0
git push origin v1.0.0
```

---

## Verifying a Published Image

```bash
# Pull and inspect the published image
docker pull ghcr.io/reidlai/backtest-frontend:main
docker inspect ghcr.io/reidlai/backtest-frontend:main

# Verify the SHA tag exists
docker pull ghcr.io/reidlai/backtest-frontend:<short-sha>
```

Digest and tags are also reported in the GitHub Actions job summary after a successful push.

---

## Setup: GitHub Branch Protection

After the first successful pipeline run on `main`:

1. Go to **Repository → Settings → Branches → Add branch protection rule**
2. Branch name pattern: `main`
3. Enable **Require status checks to pass before merging**
4. Add required checks (exact job names — Constitution Rule 7, v2.0.0):
   - `ci-sca`
   - `ci-format-lint`
   - `ci-secrets-scan`
   - `ci-unit-tests`
5. Enable **Require branches to be up to date before merging**
6. Enable **Include administrators** (recommended)

---

## CVE Suppression

To suppress a specific CVE that has no available fix:

```bash
# Add to .trivyignore at repo root
echo "CVE-2024-12345  # Acknowledged YYYY-MM-DD: no fix available" >> .trivyignore
git add .trivyignore
git commit -m "chore: suppress CVE-2024-12345 (no fix available)"
```

All suppressed CVEs are reviewable via git history. The `.trivyignore` file is always passed to the Trivy scan.

---

## Troubleshooting

| Symptom                             | Likely cause                         | Fix                                                                                   |
| ----------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------- |
| SCA job fails with CVE found        | New vulnerability in dependency      | Update the dependency or add to `.trivyignore` with justification                     |
| Format job fails                    | Code not formatted                   | Run `pnpm prettier --write .` locally and push                                        |
| Lint job fails                      | ESLint violation                     | Run `pnpm eslint . --fix` or fix manually                                             |
| Test job fails                      | Broken test or missing mock          | Run `pnpm vitest run --project server` locally to reproduce                           |
| Docker build fails                  | Missing adapter-node, or build error | Verify `svelte.config.js` uses adapter-node; run `pnpm build` locally                 |
| SAST fails                          | Trivy found HIGH/CRITICAL in image   | Update base image (`node:22-alpine`) or suppress with justification in `.trivyignore` |
| GHCR push fails with auth error     | GITHUB_TOKEN lacks package write     | Add `permissions: packages: write` to workflow                                        |
| GHCR push skipped on feature branch | Expected behavior                    | Push only runs on `main` and semver tags (FR-011)                                     |
