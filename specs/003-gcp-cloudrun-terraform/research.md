# Research: GCP Cloud Run OpenTofu Deployment

**Branch**: `003-gcp-cloudrun-terraform` | **Date**: 2026-05-21

## Decision 1: OpenTofu & Google Provider Version Constraints

**Decision**: OpenTofu `>= 1.6.0`, `registry.opentofu.org/hashicorp/google` provider `>= 5.0.0`

**Rationale**: OpenTofu 1.6.0 is the first stable release of the OpenTofu fork (branched from Terraform 1.5.x). It maintains full HCL compatibility including `check` blocks for post-apply assertions. Google provider 5.x is the current major version with full `google_cloud_run_v2_service` GA support; the provider binary is the same regardless of whether it is sourced from Terraform or OpenTofu registry.

**Alternatives considered**: Terraform (HashiCorp) — BSL-licensed since 1.6.0, incompatible with open-source redistribution requirements; OpenTofu 1.7.x — available but 1.6.0 is the minimum stable version satisfying all feature requirements.

---

## Decision 2: Cloud Run API Version (v1 vs v2)

**Decision**: Use `google_cloud_run_v2_service` (Cloud Run v2 resource type)

**Rationale**: Cloud Run v2 (`run.googleapis.com/v2`) is the current recommended API. `google_cloud_run_service` (v1) is in maintenance mode with no new features. V2 provides cleaner scaling controls (`min_instance_count`, `max_instance_count` directly on the service spec), improved startup/warmup configuration, and will receive all future platform features.

**Alternatives considered**: `google_cloud_run_service` (v1) — still functional but maintenance-mode; would require migration later.

---

## Decision 3: GCS Backend Configuration Approach

**Decision**: Use a `backend.hcl` file (gitignored) alongside the main module. Operators pass it via `tofu init -backend-config=backend.hcl`. The bootstrap module outputs the bucket name for reference.

**Rationale**: OpenTofu backend blocks cannot reference input variables — bucket name must be hardcoded or passed at `tofu init` time. The `-backend-config` file approach avoids hardcoding the bucket name in source while allowing operators to configure per-environment state isolation cleanly. The `backend.hcl` file is gitignored and generated from a committed `backend.hcl.example` template.

**Alternatives considered**: Hardcoding bucket name in `backend {}` block — inflexible, violates DRY for multi-environment use; Partial config via environment variables — less discoverable, harder to document.

---

## Decision 4: Environment Variable Injection

**Decision**: Use `var.env_vars` as `map(string)` iterated with `dynamic "env"` block inside the Cloud Run container spec.

**Rationale**: A map input allows operators to define any number of non-sensitive key-value pairs in their `.tfvars` file without changing the Terraform module itself. The `dynamic "env"` block iterates the map and produces one env block per entry, which is the idiomatic HCL approach for variable-length resource attributes.

**Alternatives considered**: Individual named variables per env var — requires module changes to add new vars; hard-coded env vars — not configurable.

---

## Decision 5: OpenTofu File Layout (Flat vs Modules)

**Decision**: Flat file layout with logical separation by concern: `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf`, `apis.tf`, `iam.tf`. A separate `bootstrap/` subdirectory acts as a standalone module.

**Rationale**: For a single-service deployment, a flat layout is more readable and maintainable than deep module nesting. Separating `apis.tf` and `iam.tf` from `main.tf` keeps the service resource file focused. The `bootstrap/` module is a self-contained one-time operation with its own state (using local backend), separate from the main state bucket it creates.

**Alternatives considered**: Single `main.tf` file — unwieldy as resources grow; Complex module hierarchy — premature abstraction for a single service deployment.

---

## Decision 6: BDD Smoke Tests for Infrastructure

**Decision**: Add `features/cloud-run-deployment.feature` tagged `@smoke @infrastructure` covering public accessibility and HTML response validation.

**Rationale**: Constitution Rule 6 requires Cucumber/Gherkin feature files in `./features/` for all behavioral tests. Infrastructure smoke tests verify that `tofu apply` produced a correctly functioning service, complementing `tofu validate` and `tofu fmt` which only check configuration syntax/style.

**Alternatives considered**: Shell-based health check script — not BDD compliant, not tagged for CI gate integration; No post-deploy tests — violates constitution Rule 7 (`cd-smoke-tests` gate).

---

## Decision 7: Bootstrap Module State

**Decision**: Bootstrap module uses **local state** (default OpenTofu behavior, no `backend {}` block). Main module uses GCS remote state.

**Rationale**: The bootstrap module creates the GCS bucket that the main module depends on for remote state. If bootstrap itself used GCS remote state, there would be a chicken-and-egg dependency. Local state for bootstrap is acceptable because bootstrap is run once by a single operator and the GCS bucket resource is not sensitive or frequently changing.

**Alternatives considered**: Shared remote state for bootstrap — circular dependency problem; OpenTofu Cloud — out of scope for this project.
