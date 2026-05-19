# Tasks: GitHub CI Workflow with Security and Quality Gates

**Input**: Design documents from `/specs/002-github-ci-workflow/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Constitution**: v2.0.0 applied — ci-sast-threatmodel is retained as informational (no longer a required blocking gate)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4); omitted in Setup, Foundational, and Polish phases
- Exact file paths included in all descriptions

## Path Conventions

- Workflow: `.github/workflows/ci.yaml` (MUST use `.yaml` extension — Constitution Rule 9)
- Docker: `deploy/docker/Dockerfile` (MUST be in `deploy/docker/` — Constitution Rule 9)
- BDD: `features/` (MUST exist — Constitution Rules 6, 9)
- SAST output: `threat_modelling/reports/` (optional — no longer required by Constitution v2.0.0)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Adapter swap, root-level CI support files, BDD feature file (Constitution Rule 6 — MUST precede any implementation task), and required directory scaffolding (Constitution Rule 9).

- [ ] T001 Install `@sveltejs/adapter-node` devDependency — run `pnpm add -D @sveltejs/adapter-node` (updates `package.json` and `pnpm-lock.yaml`)
- [ ] T002 Update `svelte.config.js` — replace `import adapter from '@sveltejs/adapter-auto'` with `import adapter from '@sveltejs/adapter-node'` (prerequisite for distroless Docker build; no other changes needed)
- [ ] T003 [P] Create `.dockerignore` at repository root — exclude: `node_modules`, `.svelte-kit`, `specs`, `.specify`, `.storybook`, `src/stories`, `.git`, `*.md`, `coverage`, `playwright-report`
- [ ] T004 [P] Create `.trivyignore` at repository root — empty file with header: `# CVE suppression file — each entry must be an explicit, reviewable decision tracked in git history`
- [ ] T005 [P] Create `features/ci-quality-gates.feature` — Gherkin BDD feature file; tag all scenarios with `@smoke @ci`; include the following named scenarios: "SCA blocks on HIGH severity dependency vulnerability", "SCA warns on MEDIUM severity finding without blocking", "Formatting check fails on non-conformant file", "Lint check fails on ESLint violation", "Unit test failure halts the pipeline", "Docker image built after all quality gates pass", "Trivy SAST blocks on HIGH severity container finding", "GHCR image pushed on main branch push after all stages pass", "GHCR push skipped on feature branch push" — (Constitution Rule 6 MUST: feature file MUST exist before any CI job implementation begins; Constitution Rule 9: `features/` directory required)
- [ ] T006 [P] Create `threat_modelling/reports/.gitkeep` — establishes output directory for the informational `ci-sast-threatmodel` job; add `threat_modelling/reports/*.json` and `threat_modelling/reports/*.sarif` to `.gitignore` so generated reports are never committed (optional — not required by Constitution v2.0.0)
- [ ] T007 [P] Create `pre-commit-config.yaml` at repository root — configure three hooks: (1) `gitleaks/gitleaks` rev `v8.18.0` for secrets detection; (2) local hook `id: prettier, entry: pnpm prettier --check, language: system, types_or: [javascript, typescript, css, markdown], pass_filenames: true`; (3) local hook `id: eslint, entry: pnpm eslint, language: system, types_or: [javascript, typescript], pass_filenames: true` — mirrors `ci-secrets-scan` and `ci-format-lint` gate behavior locally (Constitution Rule 9)

**Checkpoint**: T001 + T002 complete and `pnpm build` succeeds locally confirming `./build/` is produced. T005 committed — BDD feature file exists before Phase 3 work begins.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Distroless Dockerfile at `deploy/docker/` (Constitution Rules 3, 9) and CI workflow skeleton. MUST complete before any user story job implementation.

**⚠️ CRITICAL**: No user story job task can begin until this phase is complete.

- [ ] T008 [P] Create `deploy/docker/Dockerfile` and `deploy/docker/entrypoint.sh` — Dockerfile: three stages: `deps` (`FROM node:20-alpine`, corepack enable, `pnpm install --frozen-lockfile`), `builder` (`COPY . .` then `pnpm build`), `runner` (`FROM gcr.io/distroless/nodejs20-debian12`, `WORKDIR /app`, `COPY --from=builder /app/build ./build`, `COPY --from=deps /app/node_modules ./node_modules`, `COPY --from=builder /app/package.json ./`, `ENV NODE_ENV=production PORT=3000`, `EXPOSE 3000`, `USER nonroot:nonroot`, `HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD ["/nodejs/bin/node", "-e", "require('http').get('http://localhost:3000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"]`, `CMD ["/app/build/index.js"]`); `entrypoint.sh`: stub file with comment `#!/bin/sh` and `# Not used with distroless base — reserved for future non-distroless deployments` — (Constitution Rule 3: distroless MUST, non-root MUST, HEALTHCHECK MUST; Constitution Rule 9: deploy/docker/ location MUST)
- [ ] T009 [P] Create `.github/workflows/ci.yaml` — workflow skeleton: `name: CI`, `on:` triggers (`push: {branches: ['**'], tags: ['v[0-9]+.[0-9]+.[0-9]+']}`, `pull_request: {branches: [main]}`), top-level `concurrency: {group: '${{ github.workflow }}-${{ github.ref }}', cancel-in-progress: true}`, top-level `permissions: {contents: read, packages: write, issues: write, security-events: write}`, empty `jobs:` section — (Constitution Rule 9: MUST be `ci.yaml` not `ci.yml`)

**Checkpoint**: `docker build -f deploy/docker/Dockerfile -t backtest-frontend:local .` succeeds. Inspect image: confirms `gcr.io/distroless/nodejs20-debian12` runner layer, `USER nonroot`, and `HEALTHCHECK` instruction present. `ci.yaml` passes YAML lint (`yamllint .github/workflows/ci.yaml`).

---

## Phase 3: User Story 1 — Automated Quality Gate on Code Push (Priority: P1) 🎯 MVP

**Goal**: Every push and PR triggers four sequential blocking CI jobs — `ci-sca` → `ci-format-lint` → `ci-secrets-scan` → `ci-unit-tests` — each gating the next, followed by the informational `ci-sast-threatmodel` job (non-blocking per Constitution v2.0.0). Any blocking-gate failure halts the chain and blocks merging to main.

**Independent Test**: Push a commit to a feature branch. Four blocking jobs plus one informational job appear in GitHub Actions and run sequentially. Introduce a lint violation — `ci-format-lint` fails and all downstream jobs are skipped. Open a PR with the violation — confirm merge button is disabled. Fix the violation and push again — all four blocking gates pass and PR unblocks.

- [ ] T010 [US1] Add `ci-sca` job to `.github/workflows/ci.yaml` — `runs-on: ubuntu-latest`; steps: `actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4` (node-version: 20, cache: pnpm), `run: pnpm install --frozen-lockfile`, `run: pnpm dlx audit-ci --high --output-format json 2>&1 | tee sca-report.json; exit ${PIPESTATUS[0]}`, `actions/upload-artifact@v4` (name: `sca-report`, path: `sca-report.json`, retention-days: 30, if: always())
- [ ] T011 [US1] Add `ci-format-lint` job to `.github/workflows/ci.yaml` — `needs: [ci-sca]`; steps: checkout + pnpm setup (same pattern as T010), `run: pnpm prettier --check . 2>&1 | tee prettier-report.txt; exit ${PIPESTATUS[0]}`, `run: pnpm eslint . --format json --output-file eslint-report.json; exit $?`, `actions/upload-artifact@v4` (name: `format-lint-report`, path including both `prettier-report.txt` and `eslint-report.json`, retention-days: 30, if: always()) — Constitution Rule 7: format + lint are a single combined job; FR-012: combined artifact satisfies machine-readable report requirement
- [ ] T012 [US1] Add `ci-secrets-scan` job to `.github/workflows/ci.yaml` — `needs: [ci-format-lint]`; steps: `actions/checkout@v4` (with `fetch-depth: 0` for full git history required by Gitleaks), `gitleaks/gitleaks-action@v2` (no `exit-code` override — defaults to blocking on any secret found; no waiver permitted per Constitution Rule 4) — Constitution Rule 7: `ci-secrets-scan` MUST block on any finding
- [ ] T013 [US1] Add `ci-unit-tests` job to `.github/workflows/ci.yaml` — `needs: [ci-secrets-scan]`; steps: checkout + pnpm setup, `run: pnpm vitest run --project server --coverage --reporter=verbose`, `actions/upload-artifact@v4` (name: `coverage-report`, path: `coverage/`, retention-days: 30, if: always())
- [ ] T014 [US1] Add `ci-sast-threatmodel` job to `.github/workflows/ci.yaml` — `needs: [ci-unit-tests]`; informational-only (not a blocking gate per Constitution v2.0.0); steps: `actions/checkout@v4`, install Semgrep (`run: pip install semgrep`), `run: semgrep --config=auto --json --output=threat_modelling/reports/pr-threats.json . || true` (generates report regardless of findings; `|| true` intentional — non-blocking), step to create GitHub issues for HIGH/CRITICAL findings: `run: |` parse `threat_modelling/reports/pr-threats.json` with `jq` to extract high/critical findings and for each run `gh issue create --title "SAST: [rule]" --label "security,sast" --body "[message at file:line]"`, `actions/upload-artifact@v4` (name: `sast-threatmodel-report`, path: `threat_modelling/reports/`, retention-days: 30, if: always())

**Checkpoint**: Push to branch. Four blocking jobs + one informational job run sequentially in GitHub Actions. Artifacts uploaded: `sca-report.json`, `prettier-report.txt` + `eslint-report.json`, `coverage/`, `threat_modelling/reports/pr-threats.json`. Introduce a lint error — `ci-format-lint` fails, remaining jobs skip.

---

## Phase 4: User Story 2 — Reproducible Build Artifacts (Priority: P2)

**Goal**: After all four blocking quality gates pass (and the informational `ci-sast-threatmodel` completes), the Docker image is built from `deploy/docker/Dockerfile` using the distroless base and tagged with branch name + commit SHA. Image is saved as a tarball artifact for container scanning and push consumption. Build is skipped for fork PRs.

**Independent Test**: Push a passing commit. `build` job runs after `ci-sast-threatmodel` completes, uploads a `docker-image` tarball artifact. Introduce a unit test failure — `build` is skipped. Push from a fork PR — `build` is skipped.

- [ ] T015 [US2] Add `build` job to `.github/workflows/ci.yaml` — `needs: [ci-sast-threatmodel]`, per-job concurrency override (`concurrency: {group: '${{ github.workflow }}-${{ github.ref }}-build', cancel-in-progress: false}`) per FR-017 "build stages MAY complete" clause, `if: github.event_name == 'push' || github.event.pull_request.head.repo.full_name == github.repository`, `outputs: {image-name: '${{ steps.meta.outputs.tags }}'}` for downstream SAST job, steps: `actions/checkout@v4`, `docker/setup-buildx-action@v3`, `docker/metadata-action@v5` (id: meta, images: `ghcr.io/${{ github.repository }}`, tags: `type=ref,event=branch` and `type=sha,prefix=,format=short`), `docker/build-push-action@v6` (file: `deploy/docker/Dockerfile`, context: `.`, push: false, tags: `${{ steps.meta.outputs.tags }}`, labels: `${{ steps.meta.outputs.labels }}`, outputs: `type=docker,dest=/tmp/image.tar`), `actions/upload-artifact@v4` (name: `docker-image`, path: `/tmp/image.tar`, retention-days: 1) — 1-day retention: intermediate product for same-run SAST and push consumption only, NOT a downloadable artifact per FR-007

**Checkpoint**: Passing feature branch push → `build` job runs, `docker-image` artifact appears in the run. Fork PR → `build` skipped. Check `outputs` section of `build` job shows `image-name` populated.

---

## Phase 5: User Story 3 — Static Security Analysis of Built Image (Priority: P3)

**Goal**: After the Docker image is built, Trivy scans it statically (no running container). HIGH/CRITICAL findings block the pipeline; MEDIUM/LOW are recorded as warnings. SARIF report retained 30 days.

**Independent Test**: Confirm Trivy produces a SARIF report uploaded as a run artifact. Use a known-vulnerable base image tag — `sast` job exits 1 and `push-to-ghcr` is skipped.

- [ ] T016 [US3] Add `sast` job to `.github/workflows/ci.yaml` — `needs: [build]`, same `if` condition as T015 (skip for fork PRs), steps: `actions/checkout@v4`, `actions/download-artifact@v4` (name: `docker-image`, path: `/tmp`), `run: docker load --input /tmp/image.tar`, `aquasecurity/trivy-action@master` (image-ref: `${{ needs.build.outputs.image-name }}` — resolves image-name from T015 job output, format: sarif, output: `trivy-report.sarif`, exit-code: 1, severity: `HIGH,CRITICAL`, trivyignores: `.trivyignore`), second `aquasecurity/trivy-action@master` pass (image-ref: `${{ needs.build.outputs.image-name }}`, exit-code: 0, severity: `LOW,MEDIUM`, format: table — warning-only, does not block), `actions/upload-artifact@v4` (name: `trivy-sast-report`, path: `trivy-report.sarif`, retention-days: 30, if: always())

**Checkpoint**: SARIF artifact appears in run artifacts page. Load a `node:16`-based image as a test — `sast` exits 1 and `push-to-ghcr` (Phase 6) is skipped.

---

## Phase 6: User Story 4 — Publish Verified Image to Container Registry (Priority: P4)

**Goal**: After all stages pass, the SAST-verified Docker image tarball from T015 is loaded, re-tagged with final GHCR metadata, and pushed — ensuring the published digest matches the scanned digest (SC-007). Runs only on `main` branch push and semver tag push.

**Independent Test**: Merge a passing PR to `main` → image appears in GHCR tagged `main` + short SHA. Push `v1.0.0` tag → `v1.0.0`, short SHA, and `latest` tags all appear. Feature branch push → no GHCR entry.

- [ ] T017 [US4] Add `push-to-ghcr` job to `.github/workflows/ci.yaml` — `needs: [sast]`, `if: (github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/v')) && github.event_name == 'push'`, per-job concurrency override (`concurrency: {group: '${{ github.workflow }}-${{ github.ref }}-push', cancel-in-progress: false}`) to prevent partial image pushes per FR-017, steps: `actions/checkout@v4`, `docker/login-action@v3` (registry: `ghcr.io`, username: `${{ github.actor }}`, password: `${{ secrets.GITHUB_TOKEN }}`), `docker/metadata-action@v5` (id: meta, images: `ghcr.io/${{ github.repository }}`, tags: `type=ref,event=branch`, `type=semver,pattern={{version}}`, `type=sha,prefix=,format=short`, `type=raw,value=latest,enable=${{ startsWith(github.ref, 'refs/tags/v') }}`), `actions/download-artifact@v4` (name: `docker-image`, path: `/tmp`), `run: docker load --input /tmp/image.tar` (loads the SAST-verified image — same tarball scanned in T016; pushed digest == scanned digest per SC-007), `run: while IFS= read -r tag; do docker tag "${{ needs.build.outputs.image-name }}" "$tag"; done <<< "${{ steps.meta.outputs.tags }}"` (re-tag loaded image with final GHCR metadata), `run: docker push --all-tags ghcr.io/${{ github.repository }}`, `run: echo "### Published Image" >> $GITHUB_STEP_SUMMARY && echo "**Tags**: ${{ steps.meta.outputs.tags }}" >> $GITHUB_STEP_SUMMARY`

**Checkpoint**: `main` push → two new GHCR tags (`main` + short SHA). `v1.0.0` tag push → three tags (`v1.0.0`, short SHA, `latest`). Feature branch push → zero new GHCR entries.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Local command verification and GitHub branch protection with constitution-mandated job names.

- [ ] T018 [P] Verify local end-to-end quality gate commands match final `ci.yaml` — run: `pnpm dlx audit-ci --high`, `pnpm prettier --check .`, `pnpm eslint . --format json`, `pnpm vitest run --project server --coverage`, `docker build -f deploy/docker/Dockerfile -t backtest-frontend:local .`, `docker run --rm --user 65532:65532 -p 3000:3000 backtest-frontend:local`; confirm all commands succeed locally; update `specs/002-github-ci-workflow/quickstart.md` if any command diverges from the final workflow
- [ ] T019 [P] Set up GitHub branch protection rules for `main` — in repository Settings → Branches, add protection rule: require the four Constitution v2.0.0 status checks before merging: `ci-sca`, `ci-format-lint`, `ci-secrets-scan`, `ci-unit-tests`; enable "Require branches to be up to date before merging"; document completion in `specs/002-github-ci-workflow/quickstart.md` under the Setup section

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T005 (BDD feature file) MUST complete before any Phase 3 job tasks per Constitution Rule 6
- **Foundational (Phase 2)**: Depends on T001 + T002 (adapter-node must be installed before Dockerfile's `pnpm build` step works) — **BLOCKS all user story phases**
- **US1 Quality Gates (Phase 3)**: Depends on Phase 2 complete (`ci.yaml` skeleton must exist)
- **US2 Build (Phase 4)**: Depends on US1 complete — T015 `needs: [ci-sast-threatmodel]` (waits for informational job to complete before building)
- **US3 SAST (Phase 5)**: Depends on US2 complete — T016 `needs: [build]`; uses `needs.build.outputs.image-name`
- **US4 Push (Phase 6)**: Depends on US3 complete — T017 `needs: [sast]`; loads same tarball as T016
- **Polish (Phase 7)**: Depends on Phase 6 complete

### User Story Dependencies

- **US1 (P1)**: Unblocked after Phase 2; T005 BDD feature file MUST precede T010–T014
- **US2 (P2)**: Depends on US1 — `build` runs only after `ci-sast-threatmodel` passes
- **US3 (P3)**: Depends on US2 — Trivy scans the T015 tarball artifact via `needs.build.outputs.image-name`
- **US4 (P4)**: Depends on US3 — `push-to-ghcr` loads the same T015 tarball and re-tags it (published digest = scanned digest)

### CI Gate Sequential Chain (Constitution Rule 7 Enforcement Mapping)

```
ci-sca → ci-format-lint → ci-secrets-scan → ci-unit-tests → ci-sast-threatmodel
       → build → sast → push-to-ghcr
```

### Within Each Phase

| Phase            | Tasks     | Parallelism                              |
| ---------------- | --------- | ---------------------------------------- |
| Setup (1)        | T001–T007 | T003–T007 parallel after T001+T002       |
| Foundational (2) | T008–T009 | T008 and T009 parallel (different files) |
| US1 (3)          | T010–T014 | Sequential — all modify `ci.yaml`        |
| US2 (4)          | T015      | Sequential after T014                    |
| US3 (5)          | T016      | Sequential after T015                    |
| US4 (6)          | T017      | Sequential after T016                    |
| Polish (7)       | T018–T019 | Parallel — different concerns            |

---

## Parallel Example: Phase 1

```bash
# After T001 + T002 complete, launch all remaining Phase 1 tasks together:
Task T003: "Create .dockerignore at repository root"
Task T004: "Create .trivyignore at repository root"
Task T005: "Create features/ci-quality-gates.feature"          ← MUST finish before Phase 3
Task T006: "Create threat_modelling/reports/.gitkeep"
Task T007: "Create pre-commit-config.yaml"

# After all Phase 1 tasks complete, launch both Phase 2 tasks together:
Task T008: "Create deploy/docker/Dockerfile (distroless)"
Task T009: "Create .github/workflows/ci.yaml skeleton"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T007) — T005 BDD feature file commits before implementation
2. Complete Phase 2: Foundational (T008–T009) — **CRITICAL, blocks everything**
3. Complete Phase 3: US1 Quality Gates (T010–T014)
4. **STOP and VALIDATE**: Five CI jobs run sequentially; failure halts chain; fork PR skips build
5. Configure branch protection (T019) with five constitution job names — merge blocking live on `main`

### Incremental Delivery

1. Setup + Foundational → distroless build verified locally, CI skeleton and BDD file committed
2. Add US1 Quality Gates (5 jobs: SCA, format+lint, secrets, unit tests, code SAST) → automated enforcement live (MVP!)
3. Add US2 Build → Docker images produced from `deploy/docker/Dockerfile` for every verified commit
4. Add US3 SAST → Trivy image CVE gate; only zero HIGH/CRITICAL images proceed
5. Add US4 Push → SAST-verified images promoted to GHCR with guaranteed digest traceability

### Single-Developer Strategy

All jobs in phases 3–6 modify the same `ci.yaml`. Work strictly one task at a time. Push after each job is added to validate sequencing before adding the next.

---

## Notes

- [P] tasks operate on different files — no merge conflict risk
- T005 (BDD feature file) MUST be committed before any Phase 3 task begins — Constitution Rule 6 is non-negotiable
- `deploy/docker/Dockerfile` uses distroless runner — no shell available; `HEALTHCHECK CMD` and `CMD` MUST use exec array form with `/nodejs/bin/node`
- Two distinct SAST stages: `ci-sast-threatmodel` (T014) = Semgrep code SAST → `threat_modelling/reports/pr-threats.json`; `sast` (T016) = Trivy container image CVE scan → `trivy-report.sarif`; different tools, different scopes, both required
- T015 (`build`) saves image as tarball; T016 (`sast`) loads and scans it; T017 (`push-to-ghcr`) loads the same tarball and re-tags it — the published image digest is guaranteed to match the scanned digest (SC-007 100% traceability)
- `.trivyignore` committed empty — first suppression entry is an intentional, reviewable git change
- Pre-existing repository violations outside this feature's scope: `e2e-tests/` absent (Rule 9), `frontend/` absent (Rules 9, 11) — require separate features
