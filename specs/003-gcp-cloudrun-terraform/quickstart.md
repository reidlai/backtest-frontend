# Quickstart: GCP Cloud Run OpenTofu Deployment

**Branch**: `003-gcp-cloudrun-terraform` | **Date**: 2026-05-21

## Prerequisites

- [OpenTofu](https://opentofu.org/docs/intro/install/) >= 1.6.0
  - macOS: `brew install opentofu`
  - Linux: see [official install script](https://opentofu.org/docs/intro/install/standalone/)
- GCP project with billing enabled
- `gcloud` CLI authenticated: `gcloud auth application-default login`
- Operator IAM role: `roles/editor` or a custom role with Cloud Run Admin + IAM Admin + Storage Admin

## Step 1: Bootstrap (One-Time)

Provision the GCS bucket for OpenTofu remote state.

```bash
cd deploy/gcp/terraform/bootstrap

# Copy and fill in your values
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars: set project_id, region, bucket_name

tofu init
tofu apply
# Note the bucket_name output
```

## Step 2: Configure Main Module

```bash
cd deploy/gcp/terraform

# Configure the remote state backend
cp backend.hcl.example backend.hcl
# Edit backend.hcl: set bucket = "<bucket_name from Step 1>"

# Configure input variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars: set project_id, region, and any env_vars
```

## Step 3: Deploy

```bash
tofu init -backend-config=backend.hcl
tofu plan          # Review what will be created
tofu apply         # Provision Cloud Run service
```

After apply completes, OpenTofu prints the `service_url`. Open it in a browser to verify the frontend is live.

## Updating the Deployed Image

```bash
# Edit terraform.tfvars: change image_tag to a new value (e.g., a short SHA)
tofu apply
# Cloud Run creates a new revision and shifts traffic with zero downtime
```

## Tearing Down

```bash
# Remove all Cloud Run resources
tofu destroy

# Optionally remove the state bucket (bootstrap)
cd bootstrap
tofu destroy
```

## Troubleshooting

| Problem | Cause | Fix |
| ------- | ----- | --- |
| `403 Permission Denied` on apply | Insufficient IAM permissions | Grant Cloud Run Admin + IAM Admin to your account |
| `Error: bucket not found` on init | Bootstrap not run | Complete Step 1 first |
| Service URL returns 503 | Container failed to start | Check Cloud Logging for startup errors; verify image tag exists in GHCR |
| `tofu plan` shows drift after apply | GCP API returned non-deterministic attributes | Run `tofu apply` again; should be idempotent on second run |
