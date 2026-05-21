# Feature Specification: GCP Cloud Run OpenTofu Deployment

**Feature Branch**: `003-gcp-cloudrun-terraform`

**Created**: 2026-05-21

**Status**: Draft

**Input**: User description: "Create OpenTofu configuration under ./deploy/gcp/terraform to deploy ghcr.io/reidlai/backtest-frontend:main which is built by ci.yaml to GCP Cloud Run"

## Clarifications

### Session 2026-05-21

- Q: Does the frontend application require runtime environment variables or secrets injected into the Cloud Run service? → A: Non-sensitive env vars only — plain Cloud Run environment variables (e.g., `PUBLIC_API_URL`), no Secret Manager required.
- Q: Should the OpenTofu configuration include a bootstrap configuration to create the GCS state bucket, or assume the bucket already exists? → A: Include bootstrap — a separate `bootstrap/` OpenTofu module provisions the GCS state bucket before the main configuration is applied.
- Q: Should the Cloud Run service scale down to zero instances when idle, or maintain at least one instance always running? → A: Scale to zero (min: 0) — cost-optimal default; cold starts are acceptable.
- Q: Should the OpenTofu configuration include Cloud Monitoring alert policies or log-based metrics, or rely on Cloud Run's built-in logging? → A: Built-in only — rely on Cloud Run's automatic Cloud Logging integration; no additional monitoring resources in scope.
- Q: Should a GitHub Actions workflow be included to automatically run `tofu apply` on push to main, or is manual apply the expected workflow? → A: Manual only — operators run `tofu apply` locally; no CI/CD workflow for infrastructure deployment.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Initial Cloud Run Deployment (Priority: P1)

A developer or operator runs OpenTofu for the first time to provision the GCP Cloud Run service and all required infrastructure, deploying the `ghcr.io/reidlai/backtest-frontend:main` image published by the CI pipeline.

**Why this priority**: This is the foundational step — without it, the application cannot run on GCP. Everything else depends on this working correctly.

**Independent Test**: Can be fully tested by running `tofu apply` in a clean GCP project and verifying the Cloud Run service is publicly reachable and serving the frontend application.

**Acceptance Scenarios**:

1. **Given** a GCP project with the required APIs enabled and valid credentials, **When** the operator runs `tofu apply`, **Then** a Cloud Run service is created and the `ghcr.io/reidlai/backtest-frontend:main` image is deployed and accessible via the service URL.
2. **Given** the Cloud Run service is provisioned, **When** the operator accesses the public URL, **Then** the frontend application responds with an HTTP 200 status.
3. **Given** insufficient GCP permissions, **When** the operator runs `tofu apply`, **Then** OpenTofu reports a clear permission error and no partial resources are created.

---

### User Story 2 - Update Deployment to New Image Tag (Priority: P2)

A developer updates the container image tag (e.g., from `main` to a specific SHA or semver tag) and re-applies the OpenTofu configuration to roll out the new version with zero downtime.

**Why this priority**: The CI pipeline produces multiple image tags (`main`, short SHA, semver). Operators need a repeatable, low-risk way to update the running service.

**Independent Test**: Can be tested by changing the image tag variable and running `tofu apply`, then confirming the new revision is serving traffic.

**Acceptance Scenarios**:

1. **Given** an existing Cloud Run service running `main`, **When** the operator updates the image tag variable and applies OpenTofu, **Then** Cloud Run creates a new revision and shifts 100% of traffic to it without downtime.
2. **Given** a new revision fails health checks, **When** Cloud Run detects the failure, **Then** traffic remains on the previously healthy revision and the operator receives an error signal.

---

### User Story 3 - Destroy Infrastructure (Priority: P3)

An operator tears down all GCP resources provisioned by OpenTofu cleanly, leaving no orphaned resources.

**Why this priority**: Operational hygiene requires a reliable teardown path for staging or ephemeral environments.

**Independent Test**: Can be tested by running `tofu destroy` and verifying via the GCP console that no Cloud Run services, IAM bindings, or other provisioned resources remain.

**Acceptance Scenarios**:

1. **Given** all resources are provisioned, **When** the operator runs `tofu destroy`, **Then** all Cloud Run services, IAM bindings, and associated resources are removed from the GCP project.
2. **Given** a resource deletion fails due to a dependency, **When** OpenTofu encounters the error, **Then** it reports the failing resource clearly without silently leaving other resources in an inconsistent state.

---

### Edge Cases

- What happens when the GCP project does not have the Cloud Run API enabled?
- How does the system handle a missing or inaccessible GHCR image (e.g., private package, wrong tag)?
- What happens if the OpenTofu state file is lost or corrupted?
- How does Cloud Run behave if the container fails to start (bad image, missing env vars)?
- What happens if resource quotas are exceeded in the target GCP project?
- What happens if a required environment variable is missing from the `.tfvars` file?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The OpenTofu configuration MUST provision a GCP Cloud Run service in a configurable region.
- **FR-002**: The Cloud Run service MUST deploy the container image `ghcr.io/reidlai/backtest-frontend` with a configurable image tag (defaulting to `main`).
- **FR-003**: The Cloud Run service MUST be publicly accessible (unauthenticated access allowed) via its generated service URL.
- **FR-004**: The OpenTofu configuration MUST support configurable minimum and maximum instance counts; minimum instances MUST default to 0 (scale-to-zero) and maximum instances MUST default to 10.
- **FR-005**: The OpenTofu configuration MUST accept a configurable GCP project ID and region as input variables.
- **FR-006**: The OpenTofu configuration MUST manage all necessary IAM bindings to allow public invocation of the Cloud Run service.
- **FR-007**: The OpenTofu configuration MUST store state remotely (e.g., GCS bucket) to enable team collaboration and reproducible infrastructure management.
- **FR-008**: The OpenTofu configuration MUST allow container resource limits (CPU, memory) to be configurable via input variables.
- **FR-009**: The OpenTofu configuration MUST expose the Cloud Run service URL as an output value after provisioning.
- **FR-010**: The OpenTofu configuration MUST enable the required GCP APIs (Cloud Run, IAM) if not already enabled in the target project.
- **FR-011**: The OpenTofu configuration MUST support defining non-sensitive environment variables (e.g., `PUBLIC_API_URL`) as input variables that are injected into the Cloud Run service at provision time.
- **FR-012**: A separate `bootstrap/` OpenTofu module MUST be provided that provisions the GCS bucket used for remote state storage, and MUST be applied once before the main OpenTofu configuration.
- **FR-013**: The `bootstrap/` module MUST enable versioning on the GCS state bucket to allow state recovery from prior versions.

### Key Entities

- **Cloud Run Service**: The managed serverless container runtime that hosts the frontend application; key attributes include image reference, scaling settings, resource limits, environment variables, and public URL.
- **Container Image**: The Docker image `ghcr.io/reidlai/backtest-frontend` built and pushed by `ci.yaml`; referenced by tag (`main`, semver, or short SHA).
- **GCP Project**: The target Google Cloud project where all resources are provisioned; identified by project ID.
- **OpenTofu State**: The record of provisioned infrastructure stored remotely in a GCS bucket with versioning enabled; enables incremental updates, team collaboration, and state recovery.
- **Bootstrap Module**: A one-time OpenTofu module (`bootstrap/`) that provisions the GCS state bucket before the main configuration can be applied.
- **IAM Binding**: The policy granting unauthenticated (public) invocation rights on the Cloud Run service.
- **Environment Variable**: A non-sensitive runtime configuration value passed to the container via plain Cloud Run environment variables (not Secret Manager).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A developer with valid GCP credentials can go from a clean GCP project to a running, publicly accessible Cloud Run service in under 10 minutes by running OpenTofu commands.
- **SC-002**: Updating the deployed image tag and re-applying OpenTofu completes with zero downtime (no dropped requests during revision rollout).
- **SC-003**: Running `tofu plan` on an already-provisioned, unchanged environment produces zero planned changes, confirming idempotency.
- **SC-004**: All provisioned GCP resources are cleanly removed after `tofu destroy` with no orphaned resources remaining.
- **SC-005**: All HCL files pass `tofu validate` and `tofu fmt -check` with no errors or formatting warnings; all repo files (including `.ts` and `.md`) pass `pnpm prettier --check .` with no formatting warnings.

## Assumptions

- The `ghcr.io/reidlai/backtest-frontend` package is set to public visibility in GitHub Packages, so GCP Cloud Run can pull it without additional authentication.
- The operator has Owner or Editor permissions (or a custom role with the minimum required permissions) on the target GCP project.
- The GCS bucket for OpenTofu remote state is provisioned by the `bootstrap/` module; operators run bootstrap once before applying the main configuration.
- The Cloud Run service listens on port 3000 (matching the existing `Dockerfile` and `entrypoint.sh` in `deploy/docker/`).
- Only a single Cloud Run service is required (no multi-region setup for this feature).
- Environment-specific configuration (e.g., staging vs. production) is managed via OpenTofu variable files (`.tfvars`) rather than separate module instances.
- The CI pipeline (`ci.yaml`) already pushes the `main`-tagged image to GHCR after all checks pass; the OpenTofu configuration consumes this image without modifying the CI pipeline.
- All runtime environment variables are non-sensitive; Secret Manager integration is out of scope for this feature.
- Cloud Monitoring alert policies, dashboards, and log-based metrics are out of scope; Cloud Run's automatic Cloud Logging integration is sufficient for this feature.
- Automated CI/CD execution of `tofu apply` is out of scope; all infrastructure changes are applied manually by an operator with local GCP credentials.
