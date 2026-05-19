# Feature Specification: GitHub CI Workflow with Security and Quality Gates

**Feature Branch**: `002-github-ci-workflow`

**Created**: 2026-05-19

**Status**: Draft

**Input**: User description: "Implement Github CI workflow with SCA, Formatting, Linting, Unit Test (with mock data and no server dependency), Build Binary, Build Docker, SAST (Trivy) and then push to GHCR"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automated Quality Gate on Code Push (Priority: P1)

As a developer, when I push code changes to any branch or open a pull request, the CI pipeline automatically runs all quality checks — including dependency vulnerability scanning, code formatting, linting, and unit tests — and reports pass/fail status before the code can be merged.

**Why this priority**: This is the core value of the CI workflow. Without automated quality gates, vulnerabilities, formatting violations, and broken tests can silently slip into the codebase. This is the foundational story that must work for the feature to deliver any value.

**Independent Test**: Can be fully tested by pushing a code change to a branch and verifying that the pipeline triggers, runs each check stage, and reports results — without needing Docker, SAST, or GHCR configured.

**Acceptance Scenarios**:

1. **Given** a developer pushes a commit with a known dependency vulnerability, **When** the SCA stage runs, **Then** the pipeline fails and reports the specific vulnerability with severity and remediation guidance
2. **Given** a developer pushes code with formatting violations, **When** the formatting stage runs, **Then** the pipeline fails and shows which files and lines are incorrectly formatted
3. **Given** a developer pushes code with linting errors, **When** the linting stage runs, **Then** the pipeline fails and reports each lint violation with rule name and location
4. **Given** a developer pushes code with a failing unit test, **When** the unit test stage runs, **Then** the pipeline fails and shows the test name, failure reason, and stack trace
5. **Given** a developer pushes code that passes all quality checks, **When** all quality stages complete, **Then** the pipeline reports success and GitHub unblocks the merge button for the associated pull request
6. **Given** a developer attempts to merge a pull request with a failing or in-progress pipeline, **When** GitHub evaluates branch protection rules, **Then** the merge is blocked until the pipeline passes

---

### User Story 2 - Reproducible Build Artifacts (Priority: P2)

As a developer or release engineer, when all quality gates pass, the CI pipeline automatically builds the application binary and a Docker container image, ensuring every verified code change produces a deployable, traceable artifact.

**Why this priority**: Quality gates alone are not sufficient — the team also needs confidence that the verified code can actually be built and packaged. This story ensures that build failures are caught in CI, not in production deployments.

**Independent Test**: Can be tested by pushing a passing commit and verifying that a Docker image is produced and tagged with the commit SHA and branch name; the intermediate binary need not be separately verified.

**Acceptance Scenarios**:

1. **Given** all quality gate stages pass, **When** the build binary stage runs, **Then** a compiled application binary is produced as an intermediate product and passed directly to the Docker build step; it is not retained as a downloadable artifact
2. **Given** the binary build succeeds, **When** the Docker build stage runs, **Then** a container image is created and tagged with the branch name and commit SHA
3. **Given** any quality gate stage fails, **When** the pipeline evaluates next steps, **Then** the build stages are skipped and no artifacts are produced
4. **Given** the binary build fails, **When** the pipeline evaluates next steps, **Then** the Docker build stage is skipped and the failure is reported

---

### User Story 3 - Static Security Analysis of Built Image (Priority: P3)

As a security-conscious developer or team lead, when a container image is successfully built, the CI pipeline runs static application security testing (SAST) using Trivy against the built image to detect vulnerabilities, misconfigurations, and exposed secrets before the image is published.

**Why this priority**: SAST with Trivy catches OS-level and application-level vulnerabilities, Dockerfile misconfigurations, and accidentally committed secrets in the final image — without requiring the container to be running. It acts as the final security gate before publishing and is faster and simpler than dynamic scanning.

**Independent Test**: Can be tested by building a Docker image from a known branch and verifying Trivy scans the image statically, producing a security report with findings categorised by severity.

**Acceptance Scenarios**:

1. **Given** a Docker image is successfully built, **When** the SAST stage runs, **Then** Trivy scans the image statically without starting the container and produces a structured findings report
2. **Given** SAST completes, **When** High or Critical severity findings are detected, **Then** the pipeline fails and the Trivy report is attached as a pipeline artifact
3. **Given** SAST completes with no High or Critical findings, **When** the pipeline evaluates next steps, **Then** SAST is considered passing and the push-to-GHCR stage proceeds
4. **Given** SAST detects Medium or lower severity findings, **When** the pipeline evaluates results, **Then** findings are recorded in the report as warnings but do not block the push

---

### User Story 4 - Publish Verified Image to Container Registry (Priority: P4)

As a release engineer or deployment system, when all pipeline stages including SAST pass, the CI pipeline automatically pushes the verified container image to the GitHub Container Registry (GHCR) so it is available for deployment.

**Why this priority**: Publishing is the final step that makes verified images available to deployment pipelines. It runs last and only when all prior gates have passed, ensuring only validated images reach the registry.

**Independent Test**: Can be tested by completing a full pipeline run on main branch and verifying the image appears in GHCR with correct tags and is pullable.

**Acceptance Scenarios**:

1. **Given** all pipeline stages pass including SAST, **When** running on the main branch or a release tag, **Then** the Docker image is pushed to GHCR with the branch/tag name and commit SHA as image tags
2. **Given** the pipeline runs on a feature branch (not main, not a release tag), **When** all stages pass, **Then** the image is built and tested but NOT pushed to GHCR
3. **Given** any upstream stage fails, **When** the pipeline reaches the push stage, **Then** the push step is skipped and no image is published
4. **Given** the GHCR push succeeds, **When** the pipeline completes, **Then** the exact image digest and tags are reported in the pipeline summary

---

### Edge Cases

- What happens when a dependency vulnerability is found but has no available fix? (Pipeline fails unless the CVE ID is listed in a committed `.trivyignore` file; each suppressed entry must be an explicit, reviewable decision in version control)
- How does the pipeline behave if the Docker build succeeds but Trivy cannot access the image for scanning? (SAST stage should fail with a clear error, blocking the push)
- What happens if GHCR credentials are expired or missing? (Pipeline should fail with an authentication error, not silently skip the push)
- How are pipeline results surfaced for PRs from forks? (SAST and push stages may need to be skipped for untrusted fork PRs)
- What happens if unit tests produce flaky results due to timing? (Tests must use mock data only; any flakiness indicates a test quality issue, not an infrastructure issue)
- What happens when two commits are pushed in rapid succession to the same branch? (The in-progress pipeline run for the earlier commit is automatically cancelled; only the run for the latest commit proceeds to completion)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The pipeline MUST trigger automatically on every push to any branch and on every pull request targeting the main branch
- **FR-002**: The pipeline MUST run SCA (Software Composition Analysis) as the very first stage, scanning declared library dependencies from project source manifests and lock files (e.g., package manifests, dependency lock files) for known CVEs before any formatting, linting, build, or test work begins; the stage MUST fail if any declared dependency has a known vulnerability of High or Critical severity (CVSS ≥ 7.0); Medium and lower findings MUST generate warnings but MUST NOT block the pipeline
- **FR-003**: The pipeline MUST run a code formatting check and fail if any file does not conform to the project's formatting standard
- **FR-004**: The pipeline MUST run static code analysis (linting) and fail if any lint violation is detected
- **FR-005**: The pipeline MUST run unit tests in a fully isolated environment using only mock data, with no dependency on any running server, database, or external service; the stage MUST measure and report code coverage as part of the test output; coverage results MUST be retained as a pipeline artifact but MUST NOT gate or block the pipeline regardless of the coverage percentage
- **FR-006**: The quality gate stages MUST execute sequentially in this order: SCA → Formatting → Linting → Unit Tests; if any stage fails, subsequent stages in the sequence MUST be skipped and the pipeline MUST halt before reaching build stages
- **FR-007**: The pipeline MUST compile the application binary as an intermediate build product; the binary is used exclusively as input to the Docker image build step and is NOT retained as a separately downloadable pipeline artifact
- **FR-008**: The pipeline MUST build a Docker container image only after the binary build succeeds
- **FR-009**: After all quality gate and build stages pass, the pipeline MUST run Trivy against the built Docker image to scan it statically without starting the container; the scan MUST cover OS-level packages, bundled application dependencies, Dockerfile misconfigurations, and exposed secrets within the image layers; Trivy operates on the final image artifact only and is distinct from the SCA stage which scans source-level dependencies
- **FR-010**: The pipeline MUST block the GHCR push if Trivy reports any High or Critical severity findings (CVSS ≥ 7.0); Medium and lower findings MUST be recorded in the report as warnings only
- **FR-011**: The pipeline MUST push the verified Docker image to GHCR only when triggered by a push to the main branch or a semantic version tag (matching `v[0-9]+.[0-9]+.[0-9]+`), and only after all prior stages pass
- **FR-012**: Each pipeline stage MUST produce a machine-readable report artifact (e.g., SCA report, test results, Trivy SAST findings) retained for at least 30 days
- **FR-013**: The pipeline MUST tag published GHCR images with both the triggering ref (branch name or semantic version tag, e.g., `main`, `v1.2.3`) and the short commit SHA for traceability; semantic version tag pushes MUST also apply the `latest` tag
- **FR-014**: Pipeline stage failures MUST include actionable error messages identifying the specific issue (file, line, rule, or CVE) to enable fast resolution
- **FR-015**: The SAST stage MUST support a committed suppression file (`.trivyignore`) that allows specific CVE IDs to be explicitly acknowledged and excluded from blocking the pipeline; the suppression file MUST be tracked in version control
- **FR-016**: The repository MUST be configured with GitHub branch protection rules that designate the CI pipeline as a required status check on the main branch; pull requests MUST be blocked from merging until all required pipeline stages report a passing status
- **FR-017**: The pipeline MUST be configured to automatically cancel any in-progress run for a given branch when a newer commit is pushed to that same branch; build and push stages that are already in progress when the cancellation signal arrives MAY complete to avoid partial image pushes

### Key Entities

- **Pipeline Run**: A single execution of the workflow, associated with a commit SHA, branch, and trigger event; has an overall pass/fail status
- **Quality Gate Stage**: An individual check (SCA, format, lint, unit test) that must pass before build stages begin; produces a report artifact
- **Build Artifact**: The Docker container image produced from a verified commit; tagged with commit SHA and branch; the compiled binary is an intermediate product used only to produce this image and is not separately retained
- **SAST Report**: The security findings report produced by Trivy's static scan of the built Docker image; covers vulnerabilities, misconfigurations, and secrets; determines whether publishing is permitted
- **Published Image**: A Docker image pushed to GHCR, identified by digest, tagged with branch/version and commit SHA

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every code push triggers the full pipeline within 2 minutes of the push event being received
- **SC-002**: The complete pipeline (all stages including SAST) completes within 30 minutes for a typical build
- **SC-003**: 100% of images published to GHCR have passed all quality gates and SAST with no High or Critical severity findings
- **SC-004**: Developers receive actionable failure details within the GitHub CI interface (PR status checks and job logs) identifying the exact file, line, and issue for every failure; no external notification channels are required
- **SC-005**: Unit test execution completes without requiring any network call to external services, confirmed by test isolation enforcement
- **SC-006**: All pipeline stage reports (SCA, test results including coverage, Trivy SAST) are retained and accessible for a minimum of 30 days per run
- **SC-007**: Published images are traceable to their source commit with 100% accuracy via image tags
- **SC-008**: The pipeline correctly blocks GHCR publishing on feature branches, permitting publication only from main branch and release tags

## Clarifications

### Session 2026-05-19 (second continuation)

- Q: SCA vulnerability severity threshold (FR-002 vs Assumptions contradiction) → A: High and Critical only (CVSS ≥ 7.0) — blocks on high/critical, warns on medium and below
- Q: Quality gate stage execution order → A: Sequential — SCA → Formatting → Linting → Unit Tests; each stage must pass before the next begins
- Q: Security testing type correction → A: DAST replaced with SAST using Trivy; Trivy scans the built Docker image statically (no running container required), covering OS packages, app dependencies, misconfigurations, and secrets
- Q: GHCR image version tag format → A: Semantic versioning (`v1.2.3`); semver tags also apply the `latest` tag; images tagged with both the triggering ref and short commit SHA
- Q: Pipeline failure notification channel → A: GitHub PR status checks and job logs only; no external notifications (Slack, email, etc.) required
- Q: Vulnerability suppression mechanism for unfixable CVEs → A: Committed `.trivyignore` file in version control; suppressed CVE IDs are explicitly listed and reviewable via PR history
- Q: Branch protection enforcement → A: Required status check — GitHub branch protection blocks merges to main until all pipeline stages pass
- Q: SCA vs Trivy scope clarification → A: SCA is a separate first-gate stage scanning source-level declared dependencies (manifests/lock files) for CVEs before any CI work; Trivy exclusively scans the built Docker image after all prior stages pass — these are two distinct tools with non-overlapping scopes
- Q: Concurrent pipeline run cancellation → A: Auto-cancel — in-progress runs for a branch are cancelled when a newer commit is pushed; build/push stages in progress MAY complete to avoid partial image pushes
- Q: Binary artifact accessibility → A: Intermediate product only — binary is used solely to build the Docker image and is not retained as a downloadable CI artifact
- Q: Unit test coverage enforcement → A: Reporting only — coverage is measured and retained as a pipeline artifact but does not gate or block the pipeline; no minimum threshold enforced

## Assumptions

- The project already has a working unit test suite that uses mock data; the CI pipeline will execute existing tests rather than create new ones
- SCA and Trivy (SAST) are two separate stages with different scopes: SCA scans declared source-level library dependencies from manifests and lock files as the pipeline's first gate; Trivy scans the built Docker image after all prior stages pass, covering OS packages, bundled dependencies, misconfigurations, and secrets within the image
- GHCR publishing is restricted to the main branch and semantic version tags (e.g., `v1.2.3`); feature branch builds produce artifacts that are verified but not published; semantic version tag pushes also apply the `latest` tag
- SCA failures are triggered by High or Critical severity findings (CVSS ≥ 7.0); Medium, Low, and Informational findings generate warnings but do not block the pipeline
- The project already has a formatting configuration file committed; the pipeline enforces the existing configuration rather than introducing a new one
- Fork-submitted pull requests will run quality gate stages only (SCA, format, lint, unit tests); build, SAST, and push stages are skipped for untrusted forks to protect secrets
- Pipeline secrets (GHCR credentials, signing keys) are managed via the repository's CI secrets store and are not committed to code
- The Docker image build does not require access to external registries or private dependencies beyond what is already cached or available in the CI environment
- A `.trivyignore` file may be committed to the repository root to suppress specific CVE IDs that have been explicitly accepted as risk; an absent or empty file means all findings are enforced
