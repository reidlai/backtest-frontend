# Operator Interface Contract: GCP Cloud Run Terraform Deployment

**Branch**: `003-gcp-cloudrun-terraform` | **Date**: 2026-05-21

## Overview

This document defines the operator-facing interface contract for the Terraform modules in `deploy/gcp/terraform/`. It specifies the commands, inputs, and expected outputs an operator must interact with to provision, update, and destroy the Cloud Run deployment.

---

## Module: bootstrap/ (one-time setup)

**Purpose**: Provision the GCS bucket used as the Terraform remote state backend for the main module. Run once per environment before initializing the main module.

### Preconditions

- GCP credentials available (`GOOGLE_APPLICATION_CREDENTIALS` or `gcloud auth application-default login`)
- Operator has `storage.buckets.create` permission in the target project

### Inputs

Create `deploy/gcp/terraform/bootstrap/terraform.tfvars` (gitignored) from `terraform.tfvars.example`:

```hcl
project_id  = "my-gcp-project-id"
region      = "us-central1"
bucket_name = "my-gcp-project-id-backtest-tfstate"
```

### Commands

```bash
cd deploy/gcp/terraform/bootstrap
terraform init
terraform plan
terraform apply
```

### Outputs

| Output        | Example Value                                       | Use |
| ------------- | --------------------------------------------------- | --- |
| `bucket_name` | `"my-gcp-project-id-backtest-tfstate"`              | Use in `backend.hcl` |
| `bucket_url`  | `"gs://my-gcp-project-id-backtest-tfstate"`         | Reference only |

---

## Module: main/ (deploy/gcp/terraform/)

**Purpose**: Provision and manage the Cloud Run service, IAM bindings, and required GCP APIs.

### Preconditions

- Bootstrap module has been applied and GCS state bucket exists
- `backend.hcl` created from `backend.hcl.example` with correct bucket name
- GCP credentials available
- Operator has Cloud Run Admin + IAM Admin permissions (or custom minimum role)

### Backend Configuration

Create `deploy/gcp/terraform/backend.hcl` (gitignored) from `backend.hcl.example`:

```hcl
bucket = "my-gcp-project-id-backtest-tfstate"
prefix = "terraform/state"
```

### Inputs

Create `deploy/gcp/terraform/terraform.tfvars` (gitignored) from `terraform.tfvars.example`:

```hcl
project_id    = "my-gcp-project-id"
region        = "us-central1"
image_tag     = "main"
service_name  = "backtest-frontend"
min_instances = 0
max_instances = 10
cpu           = "1"
memory        = "512Mi"

env_vars = {
  PUBLIC_API_URL = "https://api.example.com"
}
```

### Commands

**Initial provisioning:**

```bash
cd deploy/gcp/terraform
terraform init -backend-config=backend.hcl
terraform plan
terraform apply
```

**Update image tag (rolling update):**

```bash
# Edit terraform.tfvars: set image_tag = "abc1234"
terraform plan
terraform apply
```

**Destroy:**

```bash
terraform destroy
```

### Outputs

| Output         | Example Value                                                           | Use |
| -------------- | ----------------------------------------------------------------------- | --- |
| `service_url`  | `"https://backtest-frontend-abc123-uc.a.run.app"`                       | Access the deployed application |
| `service_name` | `"backtest-frontend"`                                                   | Reference in monitoring / CD pipelines |

### Postconditions

After a successful `terraform apply`:
- `service_url` responds with HTTP 200
- Cloud Run service revision is active and serving 100% of traffic
- `terraform plan` returns zero planned changes (idempotency)

---

## Gitignore Requirements

The following files MUST be added to `.gitignore` to prevent secrets/state leakage:

```gitignore
# Terraform
deploy/gcp/terraform/backend.hcl
deploy/gcp/terraform/terraform.tfvars
deploy/gcp/terraform/bootstrap/terraform.tfvars
deploy/gcp/terraform/.terraform/
deploy/gcp/terraform/bootstrap/.terraform/
deploy/gcp/terraform/*.tfstate
deploy/gcp/terraform/*.tfstate.backup
deploy/gcp/terraform/bootstrap/*.tfstate
deploy/gcp/terraform/bootstrap/*.tfstate.backup
```

---

## Error Handling Reference

| Scenario | Terraform Behavior | Operator Action |
| -------- | ----------------- | --------------- |
| Insufficient GCP permissions | `apply` fails with `403 Permission Denied` | Grant required IAM roles and retry |
| Cloud Run API not enabled | `apply` enables it automatically (FR-010) | No action required |
| GHCR image tag not found | Cloud Run revision fails to start; previous revision stays active | Push correct image tag to GHCR and re-apply |
| GCS state bucket missing | `init` fails with bucket not found | Run bootstrap module first |
| Concurrent `terraform apply` | GCS backend state lock prevents concurrent runs | Wait for first apply to complete; lock released automatically |
