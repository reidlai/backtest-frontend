# Research: GitHub CI Workflow — Phase 0 Findings

**Branch**: `002-github-ci-workflow` | **Date**: 2026-05-19

## Decision 1: SCA Tool for pnpm

**Decision**: Use `audit-ci` via `pnpm dlx audit-ci --high` for the SCA stage.

**Rationale**:

- `pnpm audit --audit-level=high` is the simplest option and has reliable exit codes (exits 1 on High/Critical), but produces no machine-readable artifact needed for FR-012.
- `audit-ci` wraps pnpm audit, adds JSON report output (`--output-format json`), and exits non-zero on threshold violations. No installation required — run via `pnpm dlx`.
- `osv-scanner` (Google) is more comprehensive but adds a separate GitHub Action setup step; overkill for a pure JavaScript project where pnpm's advisory database is authoritative.

**Alternatives considered**:

- `pnpm audit --audit-level=high` — adequate for gate enforcement but no artifact
- `osv-scanner` — more ecosystems, SARIF support, but heavier setup

**CI Step**:

```yaml
- name: SCA — dependency vulnerability scan
  run: pnpm dlx audit-ci --high --output-format json 2>&1 | tee sca-report.json; exit ${PIPESTATUS[0]}
- name: Upload SCA report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: sca-report
    path: sca-report.json
    retention-days: 30
```

---

## Decision 2: SvelteKit Docker Deployment

**Decision**: Replace `@sveltejs/adapter-auto` with `@sveltejs/adapter-node` in `svelte.config.js`.

**Rationale**:

- `adapter-auto` resolves the deployment target at build time. In a generic Docker/Node.js container it may not reliably produce the `build/index.js` entry point needed for `CMD ["node", "build/index.js"]`.
- `adapter-node` explicitly produces a standalone Node.js server at `build/index.js` — deterministic and Docker-friendly.
- The `d3` and `layerchart` packages are runtime `dependencies` (not devDependencies), meaning they may be required server-side; the Dockerfile must copy `node_modules` from the deps stage.

**Dockerfile structure** (multi-stage, Node.js 20 Alpine):

```
Stage 1 (deps)   — install all pnpm deps with frozen lockfile
Stage 2 (builder) — copy source, run pnpm build → outputs build/
Stage 3 (runner)  — copy build/ + node_modules, expose 3000
```

**Build output**: `./build/` at repository root, entry point `node build/index.js`, port configurable via `PORT` env var (default 3000).

**Alternatives considered**:

- Keep `adapter-auto` with `ORIGIN` env var — fragile, not recommended for production containers
- `adapter-static` — would produce only static files, losing SSR capability

---

## Decision 3: Vitest Unit Tests in CI (No Browser)

**Decision**: Run `pnpm vitest run --project server --coverage` for the CI unit test stage.

**Rationale**:

- The `vite.config.ts` defines three Vitest projects: `client` (browser/Playwright), `server` (Node.js), `storybook` (browser/Playwright).
- FR-005 requires tests run in a fully isolated environment with no running server, database, or external service dependency.
- Only the `server` project meets this requirement — it uses `environment: 'node'`, includes `src/**/*.{test,spec}.{js,ts}`, and excludes `.svelte.test` browser files.
- `--coverage` (v8 provider already in devDependencies via `@vitest/coverage-v8`) produces coverage artifacts for FR-012.

**CI command**: `pnpm vitest run --project server --coverage --reporter=verbose`

**Alternatives considered**:

- Running all three projects — `client` and `storybook` require Playwright browser binary, violates no-browser-dependency requirement
- Running `pnpm test:unit` — invokes `vitest` without project filter, will attempt all three projects

---

## Decision 4: GitHub Actions Concurrency (Auto-Cancel)

**Decision**: Workflow-level concurrency group with `cancel-in-progress: true`.

**Rationale**:

- FR-017 requires auto-cancellation of in-progress runs when a newer commit arrives on the same branch.
- Workflow-level declaration cancels quality gate jobs (SCA, format, lint, test) immediately, which is the desired behavior for fast feedback.
- The spec allows build/push stages to complete if already in progress. This is handled via a separate per-job concurrency override on the `push-to-ghcr` job with `cancel-in-progress: false` on a distinct group key.

**Workflow-level declaration**:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Push job override** (prevents partial image pushes):

```yaml
jobs:
  push-to-ghcr:
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}-push
      cancel-in-progress: false
```

**Alternatives considered**:

- Single workflow-level declaration only — adequate for most cases but does not honor the "MAY complete" clause for push stage in FR-017
