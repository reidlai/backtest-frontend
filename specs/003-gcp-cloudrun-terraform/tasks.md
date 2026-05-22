# Tasks: GCP Cloud Run OpenTofu Deployment

**Input**: Design documents from `specs/003-gcp-cloudrun-terraform/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/operator-interface.md ✅, quickstart.md ✅

**BDD-First (Constitution Rule 6 — MANDATORY)**: BDD feature file `features/cloud-run-deployment.feature` was created during the planning phase (confirmed in Phase 1, T001). Step definitions MUST be written at the start of each user story's phase, before that story's implementation tasks.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- **[BDD]**: Cucumber/Gherkin file — MUST precede implementation (Constitution Rule 6)

---

## Phase 1: Setup

**Purpose**: Create the OpenTofu directory skeleton, confirm the BDD feature file, and add `.gitignore` protections before any module code is written.

- [x] T001 [BDD] Verify and finalize `features/cloud-run-deployment.feature` — confirm all 4 scenarios (@smoke, @integration tags) are complete and correctly reflect spec acceptance criteria (Constitution Rule 6 — MUST precede all implementation tasks)
- [x] T002 Create directory structure `deploy/gcp/terraform/` and `deploy/gcp/terraform/bootstrap/` per implementation plan
- [x] T003 [P] Add OpenTofu-specific entries to `.gitignore`: `deploy/gcp/terraform/backend.hcl`, `deploy/gcp/terraform/terraform.tfvars`, `deploy/gcp/terraform/bootstrap/terraform.tfvars`, `.terraform/`, `*.tfstate`, `*.tfstate.backup`

---

## Phase 2: Foundational — Bootstrap Module

**Purpose**: The `bootstrap/` module creates the GCS state bucket that the main module depends on for remote state. MUST be complete before any user story implementation begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete — the main module cannot `tofu init` without the state bucket.

- [x] T004 Create `deploy/gcp/terraform/bootstrap/versions.tf` — declare `required_version = ">= 1.6.0"` and provider `registry.opentofu.org/hashicorp/google` version constraint `>= 5.0.0`
- [x] T005 [P] Create `deploy/gcp/terraform/bootstrap/variables.tf` — declare `project_id` (required string), `region` (string, default `"us-central1"`), `bucket_name` (required string) per data-model.md Bootstrap Module inputs
- [x] T006 Create `deploy/gcp/terraform/bootstrap/main.tf` — implement `google_storage_bucket.tfstate` with `versioning.enabled = true`, `uniform_bucket_level_access = true`, `force_destroy = false`, `location = var.region` per data-model.md
- [x] T007 [P] Create `deploy/gcp/terraform/bootstrap/outputs.tf` — export `bucket_name` (string) and `bucket_url` (string, value `"gs://${google_storage_bucket.tfstate.name}"`) per data-model.md Bootstrap outputs
- [x] T008 [P] Create `deploy/gcp/terraform/bootstrap/terraform.tfvars.example` — template file with placeholder values for `project_id`, `region`, `bucket_name` and inline comments explaining each variable per contracts/operator-interface.md
- [x] T009 Run `tofu init`, `tofu validate`, and `tofu fmt -check` on `deploy/gcp/terraform/bootstrap/` — confirm zero validation errors and zero formatting differences

**Checkpoint**: Bootstrap module ready — GCS state bucket can be provisioned by running `tofu apply` in `deploy/gcp/terraform/bootstrap/`

---

## Phase 3: User Story 1 — Initial Cloud Run Deployment (Priority: P1) 🎯 MVP

**Goal**: An operator runs `tofu apply` in a clean GCP project and gets a publicly accessible Cloud Run service running `ghcr.io/reidlai/backtest-frontend:main`.

**Independent Test**: Run `tofu apply` in a clean project → access `service_url` output → verify HTTP 200 response.

### BDD Step Definitions for User Story 1

- [x] T010 [US1] Write Cucumber step definitions for @smoke scenarios in `features/step-definitions/cloud-run-deployment.ts` — implement steps for "service is publicly accessible" and "service serves a valid HTML document" using `node-fetch` or equivalent HTTP client; read service URL from `CLOUD_RUN_URL` environment variable (Constitution Rule 6)
- [x] T022 [US1] Extend `features/step-definitions/cloud-run-deployment.ts` — implement steps for @integration "re-applying unchanged OpenTofu configuration produces no changes" scenario using `child_process.exec` to run `tofu plan` and assert the output contains `"No changes"` or `"0 to add, 0 to change, 0 to destroy"` (validates SC-003 idempotency)

### GHCR Access via Artifact Registry (Prerequisite for User Story 1)

These tasks add the Artifact Registry remote repository and Secret Manager infrastructure required so Cloud Run can pull private GHCR images. MUST be complete before T014 (main.tf) and T019 (validation).

- [x] T031 [US1] Update `deploy/gcp/terraform/apis.tf` — add `google_project_service.artifactregistry_api` (`artifactregistry.googleapis.com`) and `google_project_service.secretmanager_api` (`secretmanager.googleapis.com`), both with `disable_on_destroy = false` and `disable_dependent_services = false`; also add `terraform_data.ar_service_identity` with `provisioner "local-exec"` running `gcloud --quiet beta services identity create --service=artifactregistry.googleapis.com --project=${self.input}` (creates the AR service agent SA required by `google_secret_manager_secret_iam_member.ar_secret_accessor` in T034)
- [x] T032 [US1] Create `deploy/gcp/terraform/secrets.tf` — implement `google_secret_manager_secret.github_token` with `secret_id = "ar-github-token"` and `replication { auto {} }`; implement `google_secret_manager_secret_version.github_token` with `secret_data = var.github_token`; depends on `google_project_service.secretmanager_api`
- [x] T033 [US1] Create `deploy/gcp/terraform/ar.tf` — implement `google_artifact_registry_repository.ghcr_proxy` with `mode = "REMOTE_REPOSITORY"`, `format = "DOCKER"`, `custom_repository { uri = "https://ghcr.io" }`, and `upstream_credentials { username_password_credentials { username = "reidlai", password_secret_version = google_secret_manager_secret_version.github_token.name } }`; depends on `google_project_service.artifactregistry_api` and `google_secret_manager_secret_version.github_token`
- [x] T034 [US1] Update `deploy/gcp/terraform/iam.tf` — add `data "google_project" "project"` data source; add `google_artifact_registry_repository_iam_member.cloud_run_ar_reader` (`roles/artifactregistry.reader` for `${data.google_project.project.number}-compute@developer.gserviceaccount.com`); add `google_secret_manager_secret_iam_member.ar_secret_accessor` (`roles/secretmanager.secretAccessor` for `service-${data.google_project.project.number}@gcp-sa-artifactregistry.iam.gserviceaccount.com`)
- [x] T035 [P] [US1] Update `deploy/gcp/terraform/variables.tf` — add `github_token` variable (`type = string`, `sensitive = true`, description referencing `read:packages` scope) and `artifact_registry_repo` variable (`type = string`, `default = "ghcr-proxy"`)
- [x] T036 [US1] Update `deploy/gcp/terraform/main.tf` image reference from `"ghcr.io/reidlai/backtest-frontend:${var.image_tag}"` to `"${var.region}-docker.pkg.dev/${var.project_id}/${var.artifact_registry_repo}/reidlai/backtest-frontend:${var.image_tag}"`; add `google_artifact_registry_repository.ghcr_proxy` to the `depends_on` list
- [x] T037 [P] [US1] Update `deploy/gcp/terraform/terraform.tfvars.example` — add `artifact_registry_repo = "ghcr-proxy"` and `github_token = "<your-github-pat-with-read-packages-scope>"` entries with explanatory comments

### Implementation for User Story 1

- [x] T011 [US1] Create `deploy/gcp/terraform/versions.tf` — declare `required_version = ">= 1.6.0"`, provider `registry.opentofu.org/hashicorp/google` `>= 5.0.0`, and GCS backend block placeholder per research.md Decision 1
- [x] T012 [P] [US1] Create `deploy/gcp/terraform/variables.tf` — declare all 9 input variables (`project_id`, `region`, `service_name`, `image_tag`, `min_instances`, `max_instances`, `cpu`, `memory`, `env_vars`) with types, defaults, and descriptions per data-model.md main module input variables table
- [x] T013 [P] [US1] Create `deploy/gcp/terraform/apis.tf` — implement `google_project_service.cloudrun_api` (`run.googleapis.com`) with `disable_on_destroy = false` and `disable_dependent_services = false` per data-model.md; note: `iam.googleapis.com` is enabled by default in GCP and is intentionally omitted (see FR-010)
- [x] T014 [US1] Create `deploy/gcp/terraform/main.tf` — implement `google_cloud_run_v2_service.frontend` with image initially set as `"ghcr.io/reidlai/backtest-frontend:${var.image_tag}"` (updated to AR URL in T036), container port 3000, `min_instance_count = var.min_instances` (default 0), `max_instance_count = var.max_instances` (default 10), CPU/memory limits from variables, `dynamic "env"` block iterating `var.env_vars`, `ingress = "INGRESS_TRAFFIC_ALL"`, `depends_on = [google_project_service.cloudrun_api]`; do NOT set explicit `traffic` blocks (Cloud Run v2 defaults to 100% traffic to latest revision, enabling zero-downtime rollout per SC-002); **final image reference set by T036** using AR URL `"${var.region}-docker.pkg.dev/${var.project_id}/${var.artifact_registry_repo}/reidlai/backtest-frontend:${var.image_tag}"`
- [x] T015 [P] [US1] Create `deploy/gcp/terraform/iam.tf` — implement `google_cloud_run_v2_service_iam_member.public_access` with `role = "roles/run.invoker"`, `member = "allUsers"`, location and name referencing the Cloud Run service per data-model.md
- [x] T016 [P] [US1] Create `deploy/gcp/terraform/outputs.tf` — export `service_url` (`google_cloud_run_v2_service.frontend.uri`) and `service_name` (`google_cloud_run_v2_service.frontend.name`) per data-model.md main module outputs
- [x] T017 [P] [US1] Create `deploy/gcp/terraform/backend.hcl.example` — template with `bucket = "<your-state-bucket-name>"` and `prefix = "terraform/state"` per contracts/operator-interface.md Backend Configuration section
- [x] T018 [P] [US1] Create `deploy/gcp/terraform/terraform.tfvars.example` — template with all 9 variables populated with illustrative values and comments; include `env_vars = { PUBLIC_API_URL = "https://api.example.com" }` example per contracts/operator-interface.md Inputs section
- [x] T019 [US1] Run `tofu init -backend=false`, `tofu validate`, and `tofu fmt -check` on `deploy/gcp/terraform/` — the `-backend=false` flag skips GCS backend initialization so validation runs without a real state bucket or GCP credentials; confirm zero validation errors and zero formatting differences

**Checkpoint**: User Story 1 complete — operator can provision the Cloud Run service via `tofu apply` and access it via `service_url`

---

## Phase 4: User Story 2 — Update Deployment to New Image Tag (Priority: P2)

**Goal**: An operator changes `image_tag` in `terraform.tfvars` and runs `tofu apply` to roll out a new container revision with zero downtime.

**Independent Test**: Change `image_tag` from `"main"` to a short SHA in `terraform.tfvars`, run `tofu apply`, verify Cloud Run creates a new revision and routes 100% traffic to it.

### BDD Step Definitions for User Story 2

- [x] T020 [US2] Extend `features/step-definitions/cloud-run-deployment.ts` — implement steps for @integration "service URL is exposed as OpenTofu output" scenario using `child_process.exec` to run `tofu output service_url` and validate the HTTPS URL format
- [x] T021 [BDD] [US2] Extend `features/step-definitions/cloud-run-deployment.ts` — implement steps for @integration "new revision fails health checks → traffic remains on healthy revision" scenario (US2 acceptance scenario 2); step reads Cloud Run revision health status via `gcloud run revisions describe` and asserts traffic remains on the previous revision (Constitution Rule 6)

**Checkpoint**: User Story 2 complete — operators can update the deployed image tag via `tofu apply` with zero downtime

---

## Phase 5: User Story 3 — Destroy Infrastructure (Priority: P3)

**Goal**: An operator runs `tofu destroy` and all provisioned GCP resources are cleanly removed with no orphaned resources.

**Independent Test**: Run `tofu destroy` after provisioning; verify via `gcloud` CLI or GCP console that no Cloud Run services or IAM bindings remain in the project.

### Implementation for User Story 3

- [x] T025 [US3] Create `deploy/gcp/terraform/bootstrap/README.md` — document the two-step teardown sequence: (1) destroy main module first (`tofu destroy` in `deploy/gcp/terraform/`), (2) optionally destroy bootstrap module (`tofu destroy` in `deploy/gcp/terraform/bootstrap/`), with warning that destroying the bootstrap module removes the state bucket; note that `force_destroy = false` on the state bucket and `disable_on_destroy = false` on project APIs are set in the bootstrap and main modules respectively to protect shared resources

**Checkpoint**: User Story 3 complete — all resources cleanly removed; bootstrap state bucket protected from accidental deletion

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, formatting consistency, and final documentation pass.

- [x] T040 Create `e2e-tests/.gitkeep` — satisfies Constitution Rule 9 mandatory directory requirement; end-to-end test suites will live here in future features
- [x] T026 [P] Run `tofu fmt -recursive deploy/gcp/terraform/` — ensure all `.tf` files across both modules use consistent HCL formatting (SC-005)
- [x] T027 [P] Run `tofu validate` on both `deploy/gcp/terraform/` and `deploy/gcp/terraform/bootstrap/` — confirm zero errors after all implementation tasks complete (SC-005)
- [x] T028 [P] Verify `.gitignore` additions cover all OpenTofu/IaC artefacts: `*.tfstate`, `*.tfstate.backup`, `.terraform/`, `terraform.tfvars`, `backend.hcl` — confirm no state or credentials can be accidentally committed (Constitution Rule 4)
- [x] T029 Update `specs/003-gcp-cloudrun-terraform/quickstart.md` — add OpenTofu installation instructions (e.g., `brew install opentofu` on macOS, or official install script for Linux); replace all `terraform` CLI references with `tofu`; confirm all file paths and command sequences match the final implemented structure
- [x] T039 Update `specs/003-gcp-cloudrun-terraform/quickstart.md` (post-AR remediation) — add GitHub PAT to Prerequisites; expand Step 2 terraform.tfvars comment to include `github_token` and `artifact_registry_repo`; add AR troubleshooting row
- [x] T038 Write `README.md` at project root — backtesting concept overview, tech stack table, GCP Quick Start (Steps 1–3), local development, test commands, CI/CD pipeline summary
- [x] T030 [P] Run `pnpm prettier --write .` on all newly generated files (`.ts` step definitions, `.md` documentation) and verify `pnpm prettier --check .` passes with zero warnings — ensures `ci-format-lint` CI gate passes for non-HCL files (SC-005)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 — BLOCKS all user story phases
- **Phase 3 (US1)**: Depends on Phase 2 — delivers MVP; can run after bootstrap module complete
- **Phase 4 (US2)**: Depends on Phase 3 (US1) complete — image_tag variable implemented in US1
- **Phase 5 (US3)**: Depends on Phase 3 (US1) complete — validates destroy behavior of resources created in US1
- **Phase 6 (Polish)**: Depends on Phases 3–5 complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 (bootstrap) complete — no dependency on US2/US3
- **US2 (P2)**: Depends on US1 complete (image_tag variable is implemented in US1)
- **US3 (P3)**: Depends on US1 complete (resources to destroy are created in US1); can run in parallel with US2

### Within Each Phase

- [BDD] step definition tasks (T010, T020, T022) MUST be written before the implementation tasks they validate (Constitution Rule 6)
- Bootstrap `main.tf` (T006) depends on `variables.tf` (T005) and `versions.tf` (T004)
- Main `main.tf` (T014) depends on `variables.tf` (T012) and `apis.tf` (T013)
- `iam.tf` (T015) depends on `main.tf` (T014) being structurally complete (references service resource)
- Validation tasks (T009, T019) depend on all files in that module being written

### Parallel Opportunities

- T005, T007, T008 can run in parallel (different bootstrap files, no dependencies)
- T012, T013, T015, T016, T017, T018 can all run in parallel (different main module files)
- T026, T027, T028 can run in parallel (different polish tasks)

---

## Parallel Example: User Story 1

```bash
# After T011 (versions.tf) is complete, launch in parallel:
Task T012: "Create deploy/gcp/terraform/variables.tf"
Task T013: "Create deploy/gcp/terraform/apis.tf"
Task T017: "Create deploy/gcp/terraform/backend.hcl.example"
Task T018: "Create deploy/gcp/terraform/terraform.tfvars.example"

# After T012 + T013 complete, then:
Task T014: "Create deploy/gcp/terraform/main.tf"  ← depends on T012, T013

# After T014 complete, launch in parallel:
Task T015: "Create deploy/gcp/terraform/iam.tf"
Task T016: "Create deploy/gcp/terraform/outputs.tf"

# Then validate:
Task T019: "Run tofu validate + fmt on main module"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Bootstrap Module (T004–T009)
3. Complete Phase 3: Initial Cloud Run Deployment (T010–T019, T022)
4. **STOP and VALIDATE**: Run `tofu apply` and verify HTTP 200 from `service_url`
5. Demo: Share the Cloud Run URL

### Incremental Delivery

1. Setup + Foundation → Bootstrap module ready to provision GCS bucket
2. US1 complete → Cloud Run service deployed, HTTP 200 ✅
3. US2 complete → Image tag update workflow verified ✅
4. US3 complete → Clean destroy verified ✅
5. Polish → All format/validate checks passing ✅

---

## Notes

- [P] tasks have no file conflicts and no dependency on incomplete tasks — safe to run in parallel
- [BDD] tasks (T001, T010, T022, T020) are Constitution Rule 6 requirements and MUST precede implementation of the behaviors they describe; T022 lives in Phase 3 (US1) because it validates SC-003 idempotency, a property of the initial deployment
- `features/cloud-run-deployment.feature` was created during the planning phase — T001 confirms it rather than creates from scratch
- Bootstrap module uses local state (no `backend {}` block) — this is intentional to avoid the chicken-and-egg GCS dependency (see research.md Decision 7)
- The `google_cloud_run_v2_service` resource does NOT need explicit traffic blocks — Cloud Run v2 defaults to 100% traffic to the latest revision, which provides the zero-downtime behavior required by SC-002
- All `terraform.tfvars` and `backend.hcl` files are gitignored — only `.example` variants are committed
- Step definitions for infrastructure smoke tests belong in `features/step-definitions/` using TypeScript (matching the project's Node.js/TypeScript stack)
- IaC runtime is **OpenTofu** (>= 1.6.0), not HashiCorp Terraform — all CLI commands use the `tofu` binary; provider source is `registry.opentofu.org/hashicorp/google`
- Task IDs T023 and T024 are intentionally absent — US3 (destroy) is fully validated by `tofu destroy` manual execution and the README documentation in T025; no additional BDD steps are required for the destroy path at this scope
