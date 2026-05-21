# Bootstrap: GCS OpenTofu State Bucket

This module provisions the GCS bucket used as the remote state backend for the main
`deploy/gcp/terraform/` module. Run it **once** before initialising the main module.

## Prerequisites

- OpenTofu >= 1.6.0 (`brew install opentofu` on macOS)
- GCP credentials: `gcloud auth application-default login`
- Permission: `storage.buckets.create` in the target project

## Usage

```bash
cd deploy/gcp/terraform/bootstrap

cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — set project_id, region, bucket_name

tofu init
tofu plan
tofu apply
# Note the bucket_name output — use it in deploy/gcp/terraform/backend.hcl
```

## Outputs

| Output | Description |
|--------|-------------|
| `bucket_name` | Name of the created GCS state bucket |
| `bucket_url` | `gs://` URL for reference |

## Teardown (two-step sequence)

> **Warning**: Destroying the state bucket removes the OpenTofu state for the main
> module. Only do this after the main module has been fully destroyed.

1. Destroy the main module first:

   ```bash
   cd deploy/gcp/terraform
   tofu destroy
   ```

2. Optionally destroy the state bucket:

   ```bash
   cd deploy/gcp/terraform/bootstrap
   tofu destroy
   ```

## Safety Notes

- `force_destroy = false` on the GCS bucket prevents accidental deletion while state
  objects exist — OpenTofu will refuse to destroy it if the bucket is non-empty.
- `disable_on_destroy = false` on the Cloud Run API (`run.googleapis.com`) prevents
  disabling the API when the main module's resources are destroyed, protecting other
  services in the same project that may depend on it.
- Bootstrap state is stored locally (`terraform.tfstate` in this directory). This file
  is gitignored. Keep a backup if you need to manage the state bucket with OpenTofu
  in future.
