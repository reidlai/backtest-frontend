# Implementation Plan: GCP Cloud Run OpenTofu Deployment

**Branch**: `003-gcp-cloudrun-terraform` | **Date**: 2026-05-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-gcp-cloudrun-terraform/spec.md`

## Summary

Provision a GCP Cloud Run service for `ghcr.io/reidlai/backtest-frontend:main` using two OpenTofu modules: a one-time `bootstrap/` module that creates the GCS remote state bucket (with versioning), and a main module that manages the Cloud Run v2 service, required GCP APIs, IAM public-access binding, and non-sensitive environment variable injection. All infrastructure is applied manually by an operator. Observability relies on Cloud Run's built-in Cloud Logging; no monitoring resources are in scope.

## Technical Context

**Language/Version**: HCL (OpenTofu >= 1.6.0); Google provider >= 5.0.0

**Primary Dependencies**: `registry.opentofu.org/hashicorp/google` >= 5.0.0 (Cloud Run v2 GA, Artifact Registry remote repository, Secret Manager); `hashicorp/google-beta` (not required for this feature)

**Storage**: GCS bucket (OpenTofu remote state, versioning enabled); Cloud Run is stateless

**Testing**: `tofu validate`, `tofu fmt -check` (HCL); `pnpm prettier --check .` (all repo files including `.ts`/`.md`); Cucumber/Gherkin smoke tests in `features/cloud-run-deployment.feature` (@smoke @infrastructure tags)

**Target Platform**: GCP Cloud Run v2 (`run.googleapis.com`), single region (default: `us-central1`)

**Project Type**: Infrastructure as Code (IaC) — two standalone OpenTofu modules

**Performance Goals**: Full provisioning from clean project in < 10 minutes (SC-001); zero-downtime revision rollout (SC-002)

**Constraints**: Container port 3000 (fixed per Dockerfile `PORT=3000`); minimum instances = 0 (scale-to-zero); no secrets in OpenTofu configs or state; manual `tofu apply` only (no CI automation)

**Scale/Scope**: Single Cloud Run service, single GCS state bucket, single GCP project, single region

## Constitution Check

| Gate | Rule | Check | Status |
| ---- | ---- | ----- | ------ |
| Branch name follows `###-feature-name` format | Rule 1 | `003-gcp-cloudrun-terraform` matches `[0-9]{3}-[a-z-]+` | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios in all three user stories | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | No new Dockerfile introduced; existing `deploy/docker/Dockerfile` already uses distroless base with non-root user and HEALTHCHECK | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | Existing `ci.yaml` covers SCA, lint, secrets scan; tasks include `tofu validate` and `tofu fmt -check` as IaC equivalents; BDD smoke tests added to `features/` | ✅ |
| Required directory structure included | Rule 9 | `deploy/docker/` ✅; `features/` ✅ (cloud-run-deployment.feature added); `e2e-tests/` ❌ pre-existing gap (out of scope for this feature) | Partial (pre-existing) |
| UI components follow Atomic Design + Storybook | Rule 12 | N/A — infrastructure feature, no UI components | N/A |
| Virtual module structure respected | Rule 11 | N/A — no new frontend/backend virtual module | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | All secrets via env vars / `.tfvars` (gitignored); no secrets in OpenTofu source or state | ✅ |

**Violations**: None introduced by this feature. The `e2e-tests/` missing directory is a pre-existing repository gap predating this feature; remediation is tracked separately and is out of scope here.

## Project Structure

### Documentation (this feature)

```text
specs/003-gcp-cloudrun-terraform/
├── spec.md                        # Feature specification
├── plan.md                        # This file
├── research.md                    # Phase 0: decisions and rationale
├── data-model.md                  # Phase 1: OpenTofu resource graph + variable contracts
├── quickstart.md                  # Phase 1: operator getting-started guide
├── contracts/
│   └── operator-interface.md      # Phase 1: operator interface contract
└── checklists/
    └── requirements.md            # Spec quality checklist
```

### Source Code (repository root)

```text
deploy/
└── gcp/
    └── terraform/
        ├── bootstrap/                     # One-time GCS state bucket provisioning
        │   ├── main.tf                    # google_storage_bucket resource
        │   ├── variables.tf               # project_id, region, bucket_name inputs
        │   ├── outputs.tf                 # bucket_name, bucket_url outputs
        │   ├── versions.tf                # opentofu + google provider version constraints
        │   └── terraform.tfvars.example   # Template for operator configuration
        ├── main.tf                        # google_cloud_run_v2_service resource
        ├── variables.tf                   # All input variables with defaults
        ├── outputs.tf                     # service_url, service_name outputs
        ├── versions.tf                    # opentofu + google provider version constraints
        ├── apis.tf                        # google_project_service resources (Cloud Run, AR, Secret Manager)
        ├── iam.tf                         # IAM bindings: public invoker, AR reader, Secret Manager accessor
        ├── ar.tf                          # google_artifact_registry_repository (REMOTE_REPOSITORY, proxies ghcr.io)
        ├── secrets.tf                     # google_secret_manager_secret + secret_version (GitHub PAT)
        ├── backend.hcl.example            # Template for backend configuration (gitignored actual)
        └── terraform.tfvars.example       # Template for operator variable configuration (gitignored actual)

features/
└── cloud-run-deployment.feature           # BDD smoke + integration tests (@smoke @infrastructure)
```

**Structure Decision**: Flat file layout within the main OpenTofu module (logical separation by concern: `main.tf`, `apis.tf`, `iam.tf`, `variables.tf`, `outputs.tf`, `versions.tf`) and a self-contained `bootstrap/` subdirectory with its own state. This avoids premature abstraction for a single-service deployment while keeping each file focused. See `research.md` Decision 5 for rationale.

## Phase 0: Research

All NEEDS CLARIFICATION items resolved. See `research.md` for full decision log.

| Decision | Resolution |
| -------- | ---------- |
| OpenTofu version | >= 1.6.0 (check blocks); Google provider >= 5.0.0 |
| Cloud Run API version | `google_cloud_run_v2_service` (v2 GA) |
| GCS backend approach | `-backend-config=backend.hcl` (file gitignored, example committed) |
| Env var injection | `map(string)` with `dynamic "env"` block |
| GHCR access strategy | Artifact Registry `REMOTE_REPOSITORY` proxying `ghcr.io`; GitHub PAT stored in Secret Manager; Cloud Run uses AR URL exclusively — no direct GHCR access |
| File layout | Flat + `bootstrap/` subdirectory |
| BDD tests | `features/cloud-run-deployment.feature` @smoke @infrastructure |
| Bootstrap state | Local state (avoids chicken-and-egg with remote GCS) |

## Phase 1: Design Artifacts

- **data-model.md**: OpenTofu resource graph, all input variables, outputs, validation rules, state transitions
- **contracts/operator-interface.md**: Full operator interface contract (commands, inputs, outputs, preconditions, error reference)
- **quickstart.md**: Step-by-step getting-started guide for operators
- **features/cloud-run-deployment.feature**: BDD feature file (4 scenarios: public access, HTML response, OpenTofu output, idempotency)

## Implementation Sequence

Tasks are sequenced to respect dependencies. See `tasks.md` (generated by `/speckit-tasks`) for full breakdown.

1. Bootstrap module (`bootstrap/`) — creates GCS state bucket
2. Versions and provider constraints (`versions.tf` in both modules)
3. API enablement (`apis.tf`) — Cloud Run, IAM, Artifact Registry, Secret Manager
4. Secret Manager secret for GitHub PAT (`secrets.tf`) — must precede AR remote repo
5. Artifact Registry remote repository (`ar.tf`) — proxies `ghcr.io` using Secret Manager credential
6. Cloud Run service (`main.tf`) — image URL references AR remote repo
7. IAM bindings (`iam.tf`) — public invoker + AR reader + Secret Manager accessor
8. Input variables and outputs (`variables.tf`, `outputs.tf`)
9. Example configuration files (`terraform.tfvars.example`, `backend.hcl.example`) — include `github_token` and `artifact_registry_repo` placeholders
10. `.gitignore` additions (prevent committing state/secrets)
11. BDD step definitions for `cloud-run-deployment.feature`
12. Documentation updates (`quickstart.md` — including OpenTofu installation instructions)

## Complexity Tracking

No constitution violations introduced by this feature. IaC runtime changed from HashiCorp Terraform to OpenTofu (>= 1.6.0) — HCL syntax is fully compatible; only the CLI binary (`tofu`) and registry source (`registry.opentofu.org/hashicorp/google`) differ. No complexity justification required.
