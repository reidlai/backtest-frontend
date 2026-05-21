# Data Model: GCP Cloud Run OpenTofu Deployment

**Branch**: `003-gcp-cloudrun-terraform` | **Date**: 2026-05-21

## Resource Graph

```
bootstrap/
└── google_storage_bucket.tfstate
        ↓ (output: bucket_name)
main/
├── google_project_service.cloudrun_api        (run.googleapis.com)
├── google_project_service.iam_api             (iam.googleapis.com)
├── google_cloud_run_v2_service.frontend       (depends on: cloudrun_api)
└── google_cloud_run_v2_service_iam_member.public_access
                                               (depends on: frontend service)
```

---

## Module: bootstrap/

### Resource: `google_storage_bucket.tfstate`

| Attribute                    | Value / Expression                              | Notes |
| ---------------------------- | ----------------------------------------------- | ----- |
| `name`                       | `var.bucket_name`                               | Operator-supplied; recommended pattern: `{project_id}-backtest-tfstate` |
| `location`                   | `var.region`                                    | Same region as Cloud Run service |
| `uniform_bucket_level_access`| `true`                                          | Required for consistent IAM enforcement |
| `versioning.enabled`         | `true`                                          | Enables state recovery from prior versions (FR-013) |
| `force_destroy`              | `false`                                         | Prevents accidental state bucket deletion |

### Input Variables (bootstrap/)

| Variable       | Type     | Default         | Required | Description |
| -------------- | -------- | --------------- | -------- | ----------- |
| `project_id`   | `string` | —               | Yes      | GCP project ID |
| `region`       | `string` | `"us-central1"` | No       | GCS bucket location |
| `bucket_name`  | `string` | —               | Yes      | Name for the OpenTofu state bucket |

### Outputs (bootstrap/)

| Output        | Type     | Description |
| ------------- | -------- | ----------- |
| `bucket_name` | `string` | Name of the provisioned GCS state bucket |
| `bucket_url`  | `string` | `gs://` URL for backend config reference |

---

## Module: main/ (deploy/gcp/terraform/)

### Resource: `google_project_service.cloudrun_api`

| Attribute                  | Value                              | Notes |
| -------------------------- | ---------------------------------- | ----- |
| `service`                  | `"run.googleapis.com"`             | Cloud Run API (FR-010) |
| `disable_on_destroy`       | `false`                            | Prevent disabling API on destroy (shared API) |
| `disable_dependent_services`| `false`                           | Avoids cascading disablement |

### Resource: `google_project_service.iam_api`

| Attribute                  | Value                              | Notes |
| -------------------------- | ---------------------------------- | ----- |
| `service`                  | `"iam.googleapis.com"`             | IAM API (FR-010) |
| `disable_on_destroy`       | `false`                            |  |

### Resource: `google_cloud_run_v2_service.frontend`

| Attribute                                    | Value / Expression                          | Notes |
| -------------------------------------------- | ------------------------------------------- | ----- |
| `name`                                       | `var.service_name`                          | Default: `"backtest-frontend"` |
| `location`                                   | `var.region`                                | GCP region (FR-001) |
| `template.containers[0].image`               | `"ghcr.io/reidlai/backtest-frontend:${var.image_tag}"` | FR-002 |
| `template.containers[0].ports[0].container_port` | `3000`                                  | Matches Dockerfile `PORT=3000` |
| `template.containers[0].resources.limits.cpu`    | `var.cpu`                               | Default: `"1"` (FR-008) |
| `template.containers[0].resources.limits.memory` | `var.memory`                            | Default: `"512Mi"` (FR-008) |
| `template.containers[0].env` (dynamic)       | `for k, v in var.env_vars`                  | Non-sensitive env vars (FR-011) |
| `template.scaling.min_instance_count`        | `var.min_instances`                         | Default: `0` (scale-to-zero, FR-004) |
| `template.scaling.max_instance_count`        | `var.max_instances`                         | Default: `10` (FR-004) |
| `ingress`                                    | `"INGRESS_TRAFFIC_ALL"`                     | Public internet access |
| `depends_on`                                 | `[google_project_service.cloudrun_api]`     | Ensures API enabled before service |

### Resource: `google_cloud_run_v2_service_iam_member.public_access`

| Attribute  | Value                                                   | Notes |
| ---------- | ------------------------------------------------------- | ----- |
| `location` | `google_cloud_run_v2_service.frontend.location`         | |
| `name`     | `google_cloud_run_v2_service.frontend.name`             | |
| `role`     | `"roles/run.invoker"`                                   | Grants invocation right |
| `member`   | `"allUsers"`                                            | Public unauthenticated access (FR-003, FR-006) |

### Input Variables (main/)

| Variable         | Type          | Default              | Required | Description |
| ---------------- | ------------- | -------------------- | -------- | ----------- |
| `project_id`     | `string`      | —                    | Yes      | GCP project ID (FR-005) |
| `region`         | `string`      | `"us-central1"`      | No       | GCP region for Cloud Run service (FR-001, FR-005) |
| `service_name`   | `string`      | `"backtest-frontend"`| No       | Cloud Run service resource name |
| `image_tag`      | `string`      | `"main"`             | No       | Docker image tag to deploy (FR-002) |
| `min_instances`  | `number`      | `0`                  | No       | Min instances; 0 = scale-to-zero (FR-004) |
| `max_instances`  | `number`      | `10`                 | No       | Max instances cap (FR-004) |
| `cpu`            | `string`      | `"1"`                | No       | CPU allocation per container (FR-008) |
| `memory`         | `string`      | `"512Mi"`            | No       | Memory limit per container (FR-008) |
| `env_vars`       | `map(string)` | `{}`                 | No       | Non-sensitive env vars injected into container (FR-011) |

### Outputs (main/)

| Output         | Type     | Description |
| -------------- | -------- | ----------- |
| `service_url`  | `string` | Public HTTPS URL of the deployed Cloud Run service (FR-009) |
| `service_name` | `string` | Name of the deployed Cloud Run service |

---

## State Transitions

```
[Not Provisioned]
      │
      ▼ bootstrap: tofu apply
[GCS State Bucket Created]
      │
      ▼ main: tofu init -backend-config=backend.hcl
[Remote State Initialized]
      │
      ▼ main: tofu apply
[Cloud Run Service Running] ──► (accessible via service_url output)
      │
      ▼ main: tofu apply (image_tag changed)
[Cloud Run New Revision Deployed] ──► (zero-downtime traffic shift)
      │
      ▼ main: tofu destroy
[Cloud Run Service Removed]
      │
      ▼ bootstrap: tofu destroy (optional, manual)
[GCS State Bucket Removed]
[Not Provisioned]
```

---

## Validation Rules

- `project_id`: non-empty string; validated by GCP API on apply
- `region`: must be a valid GCP region string (e.g., `"us-central1"`, `"europe-west1"`)
- `image_tag`: non-empty string; validated by Cloud Run on deploy (image must exist in GHCR)
- `min_instances`: `>= 0` and `<= max_instances`
- `max_instances`: `>= 1`
- `cpu`: valid Cloud Run CPU value (`"1"`, `"2"`, `"4"`, `"8"`)
- `memory`: valid Cloud Run memory string (e.g., `"512Mi"`, `"1Gi"`, `"2Gi"`)
- `env_vars`: keys must be valid shell variable names (uppercase letters, digits, underscores)
