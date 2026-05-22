# Implementation Plan: GCP Cloud Run OpenTofu Deployment

**Branch**: `003-gcp-cloudrun-terraform` | **Date**: 2026-05-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-gcp-cloudrun-terraform/spec.md`

## Summary

Provision a publicly accessible GCP Cloud Run service for the `backtest-frontend` application
using OpenTofu HCL. The configuration pulls the container image via a Google Artifact Registry
remote repository (GHCR pull-through proxy) authenticated with a GitHub PAT stored in Secret
Manager. A separate `bootstrap/` module provisions the GCS remote state bucket. All apply and
destroy operations are manual — no CI/CD automation for infrastructure deployment.

## Technical Context

**Language/Version**: HCL (OpenTofu >= 1.6.0); Google provider >= 5.0.0

**Primary Dependencies**: `registry.opentofu.org/hashicorp/google` >= 5.0.0

**Storage**: GCS bucket (remote state, versioned); Secret Manager (GitHub PAT); Artifact Registry (DOCKER remote repository mode, GHCR pull-through)

**Testing**: `tofu validate`, `tofu fmt -check`; BDD smoke tests via Cucumber (`features/cloud-run-deployment.feature @smoke @infrastructure`)

**Target Platform**: GCP (Cloud Run v2 API, `google_cloud_run_v2_service`)

**Project Type**: Infrastructure-as-Code (OpenTofu module — flat layout with bootstrap/ subdirectory)

**Performance Goals**: Full provisioning from zero to live service in < 10 minutes (SC-001); zero-downtime revision rollout on image tag update (SC-002)

**Constraints**: Manual apply only; scale-to-zero default (min: 0, max: 10); single region; no multi-region; Secret Manager only for GHCR auth token (not app runtime config)

**Scale/Scope**: Single Cloud Run service; 0–10 instances; one GCS state bucket; one Artifact Registry remote repository; one Secret Manager secret

## Constitution Check

| Gate | Rule | Check | Status |
| ---- | ---- | ----- | ------ |
| Branch name follows `###-feature-name` format | Rule 1 | Feature branch `003-gcp-cloudrun-terraform` matches `[0-9]{3}-[a-z_-]+`; work merged to main via PRs #60–62 | ✅ |
| BDD acceptance criteria defined in spec before this plan | Rule 6 | spec.md has Given/When/Then scenarios in all three user stories | ✅ |
| Docker image uses distroless base (if feature touches Docker) | Rule 3 | Infrastructure feature only; no Dockerfile produced by this plan | N/A |
| CI gates covered by tasks (SCA, lint, secrets scan, unit tests) | Rule 7 | `ci-format-lint` covers `tofu fmt -check`; `ci-secrets-scan` ensures github_token never committed; no application unit tests (IaC-only feature) | ✅ |
| Required directory structure included | Rule 9 | `deploy/docker/` pre-existing; `features/` BDD file required by Decision 6 in research.md | ✅ |
| UI components follow Atomic Design + Storybook (if frontend feature) | Rule 12 | Infrastructure feature — no UI components | N/A |
| Virtual module structure respected (if adding new module) | Rule 11 | No new TypeScript/Go/Rust module introduced | N/A |
| No secrets or credentials in planned artifacts | Rule 4 | `github_token` marked `sensitive = true`, sourced from `.tfvars` (gitignored); never committed | ✅ |

**Violations**: None. No waivers required.

## Project Structure

### Documentation (this feature)

```text
specs/003-gcp-cloudrun-terraform/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output: OpenTofu/provider versions, layout decisions
├── data-model.md        # Phase 1 output: resource graph, attributes, state transitions
├── quickstart.md        # Phase 1 output: operator runbook (bootstrap → deploy → destroy)
├── contracts/
│   └── operator-interface.md  # Phase 1 output: operator-facing CLI contract
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
deploy/gcp/terraform/
├── versions.tf           # OpenTofu + provider version constraints; GCS backend config
├── variables.tf          # All input variable declarations
├── outputs.tf            # service_url, service_name outputs
├── apis.tf               # google_project_service resources (Cloud Run, AR, Secret Manager)
├── main.tf               # google_cloud_run_v2_service.frontend
├── ar.tf                 # google_artifact_registry_repository.ghcr_proxy (REMOTE_REPOSITORY)
├── secrets.tf            # google_secret_manager_secret + secret_version for github_token
├── iam.tf                # IAM bindings: allUsers invoker, AR reader, SM secret accessor
├── backend.hcl           # gitignored; operator-supplied GCS backend config
├── backend.hcl.example   # committed template for backend.hcl
├── terraform.tfvars      # gitignored; operator-supplied variable values
└── terraform.tfvars.example  # committed template
bootstrap/
├── versions.tf
├── variables.tf
├── outputs.tf
├── main.tf               # google_storage_bucket.tfstate (versioning enabled)
├── README.md
├── terraform.tfvars      # gitignored
└── terraform.tfvars.example
features/
└── cloud-run-deployment.feature  # Cucumber BDD smoke tests (@smoke @infrastructure)
```

**Structure Decision**: Flat HCL layout split by concern (`apis.tf`, `iam.tf`, `secrets.tf`, `ar.tf`, `main.tf`) within a single module directory. `bootstrap/` is a self-contained one-time module with local state. No deep module hierarchy — premature for a single-service deployment.

## Complexity Tracking

No Constitution violations requiring justification.
