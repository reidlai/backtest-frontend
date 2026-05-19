# Contract: Docker Image Tagging and Naming

**Branch**: `002-github-ci-workflow` | **Date**: 2026-05-19

---

## Registry and Repository

```
ghcr.io/{github.repository_owner}/{github.event.repository.name}
```

Example: `ghcr.io/reidlai/backtest-frontend`

---

## Tagging Rules (FR-013)

### Push to `main` branch

| Tag           | Example                                     | Purpose                |
| ------------- | ------------------------------------------- | ---------------------- |
| `main`        | `ghcr.io/reidlai/backtest-frontend:main`    | Mutable ref pointer    |
| `{short-sha}` | `ghcr.io/reidlai/backtest-frontend:a1b2c3d` | Immutable commit trace |

### Push of semver tag (`v*.*.*`)

| Tag           | Example                                     | Purpose                |
| ------------- | ------------------------------------------- | ---------------------- |
| `{version}`   | `ghcr.io/reidlai/backtest-frontend:v1.2.3`  | Explicit version       |
| `{short-sha}` | `ghcr.io/reidlai/backtest-frontend:a1b2c3d` | Immutable commit trace |
| `latest`      | `ghcr.io/reidlai/backtest-frontend:latest`  | Latest stable release  |

### Feature branch push (build + SAST only, no push)

No tags applied — image is built and scanned locally within the runner but not pushed to GHCR.

---

## Tag Generation (docker/metadata-action)

```yaml
- name: Docker metadata
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: ghcr.io/${{ github.repository }}
    tags: |
      type=ref,event=branch
      type=semver,pattern={{version}}
      type=semver,pattern={{major}}.{{minor}}
      type=sha,prefix=,format=short
      type=raw,value=latest,enable=${{ startsWith(github.ref, 'refs/tags/v') }}
```

---

## Digest Reporting (FR-013, SC-007)

After a successful push, the pipeline MUST report the image digest and all applied tags in the GitHub Actions job summary:

```yaml
- name: Report image digest
  run: |
    echo "### Published Image" >> $GITHUB_STEP_SUMMARY
    echo "**Digest**: ${{ steps.push.outputs.digest }}" >> $GITHUB_STEP_SUMMARY
    echo "**Tags**: ${{ steps.meta.outputs.tags }}" >> $GITHUB_STEP_SUMMARY
```

---

## Authentication

GHCR authentication uses the built-in `GITHUB_TOKEN` — no additional secrets required:

```yaml
- name: Log in to GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

If `GITHUB_TOKEN` permissions are insufficient (e.g., for package write on org repos), the workflow MUST set:

```yaml
permissions:
  contents: read
  packages: write
```
