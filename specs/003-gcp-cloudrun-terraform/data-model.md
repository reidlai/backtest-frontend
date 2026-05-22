# Data Model: GCP Cloud Run OpenTofu Deployment

**Branch**: `003-gcp-cloudrun-terraform` | **Date**: 2026-05-22

## Resource Graph

```
bootstrap/
└── google_storage_bucket.tfstate
        ↓ (output: bucket_name → operator copies to backend.hcl)

main/ (deploy/gcp/terraform/)
├── google_project_service.cloudrun_api          (run.googleapis.com)
├── google_project_service.artifactregistry_api  (artifactregistry.googleapis.com)
├── google_project_service.secretmanager_api     (secretmanager.googleapis.com)
│
├── google_secret_manager_secret.github_token    (secret_id: "ar-github-token")
│   └── depends_on: secretmanager_api
├── google_secret_manager_secret_version.github_token
│   └── depends_on: google_secret_manager_secret.github_token
│
├── terraform_data.ar_service_identity           (local-exec: gcloud beta services identity create)
│   └── depends_on: artifactregistry_api
├── google_secret_manager_secret_iam_member.ar_secret_accessor
│   └── depends_on: terraform_data.ar_service_identity
│
├── google_artifact_registry_repository.ghcr_proxy   (REMOTE_REPOSITORY → https://ghcr.io)
│   └── depends_on: artifactregistry_api,
│                   google_secret_manager_secret_version.github_token,
│                   google_secret_manager_secret_iam_member.ar_secret_accessor
│
├── google_cloud_run_v2_service.frontend
│   └── depends_on: cloudrun_api, ghcr_proxy
│
├── google_cloud_run_v2_service_iam_member.public_access  (allUsers → roles/run.invoker)
│   └── depends_on: frontend service
│
└── google_artifact_registry_repository_iam_member.cloud_run_ar_reader
    (default Compute SA → roles/artifactregistry.reader)
```

---

## Module: bootstrap/

### Resource: `google_storage_bucket.tfstate`

| Attribute                     | Value / Expression                              | Notes |
| ----------------------------- | ----------------------------------------------- | ----- |
| `name`                        | `var.bucket_name`                               | Recommended pattern: `{project_id}-backtest-tfstate` |
| `location`                    | `var.region`                                    | Same region as Cloud Run service |
| `uniform_bucket_level_access` | `true`                                          | Required for consistent IAM enforcement |
| `versioning.enabled`          | `true`                                          | State recovery from prior versions (FR-013) |
| `force_destroy`               | `false`                                         | Prevents accidental state bucket deletion |

### Input Variables (bootstrap/)

| Variable      | Type     | Default         | Required | Description |
| ------------- | -------- | --------------- | -------- | ----------- |
| `project_id`  | `string` | —               | Yes      | GCP project ID |
| `region`      | `string` | `"us-central1"` | No       | GCS bucket location |
| `bucket_name` | `string` | —               | Yes      | Name for the OpenTofu state bucket |

### Outputs (bootstrap/)

| Output        | Type     | Description |
| ------------- | -------- | ----------- |
| `bucket_name` | `string` | Name of the provisioned GCS state bucket |
| `bucket_url`  | `string` | `gs://` URL for backend config reference |

---

## Module: main/ (deploy/gcp/terraform/)

### Resource: `google_project_service` (apis.tf)

| Resource Name             | Service                            | Notes |
| ------------------------- | ---------------------------------- | ----- |
| `cloudrun_api`            | `run.googleapis.com`               | FR-010; `disable_on_destroy = false` |
| `artifactregistry_api`    | `artifactregistry.googleapis.com`  | FR-010; `disable_on_destroy = false` |
| `secretmanager_api`       | `secretmanager.googleapis.com`     | FR-010; `disable_on_destroy = false` |

### Resource: `terraform_data.ar_service_identity` (apis.tf)

| Attribute    | Value / Expression                                                             | Notes |
| ------------ | ------------------------------------------------------------------------------ | ----- |
| `input`      | `var.project_id`                                                               | Triggers re-run if project changes |
| `local-exec` | `gcloud --quiet beta services identity create --service=artifactregistry.googleapis.com` | Creates the AR service agent SA so it can be granted SM access |
| `depends_on` | `[google_project_service.artifactregistry_api]`                               | API must be enabled first |

### Resource: `google_secret_manager_secret.github_token` (secrets.tf)

| Attribute    | Value / Expression           | Notes |
| ------------ | ---------------------------- | ----- |
| `secret_id`  | `"ar-github-token"`          | Fixed name; shared across environments |
| `replication`| `auto {}`                    | Automatic multi-region replication |
| `depends_on` | `[secretmanager_api]`        | API must be enabled |

### Resource: `google_secret_manager_secret_version.github_token` (secrets.tf)

| Attribute     | Value / Expression                               | Notes |
| ------------- | ------------------------------------------------ | ----- |
| `secret`      | `google_secret_manager_secret.github_token.id`  | Reference to parent secret |
| `secret_data` | `var.github_token`                               | Value of the PAT; marked sensitive |

### Resource: `google_artifact_registry_repository.ghcr_proxy` (ar.tf)

| Attribute                                  | Value / Expression                                      | Notes |
| ------------------------------------------ | ------------------------------------------------------- | ----- |
| `repository_id`                            | `var.artifact_registry_repo`                            | Default: `"ghcr-proxy"` |
| `location`                                 | `var.region`                                            | Must match Cloud Run region |
| `format`                                   | `"DOCKER"`                                              | |
| `mode`                                     | `"REMOTE_REPOSITORY"`                                   | Pull-through cache (FR-014) |
| `remote_repository_config.docker_repository.custom_repository.uri` | `"https://ghcr.io"` | GHCR upstream |
| `upstream_credentials.username`            | `"reidlai"`                                             | GHCR account |
| `upstream_credentials.password_secret_version` | `google_secret_manager_secret_version.github_token.name` | SM secret reference |
| `depends_on`                               | `[artifactregistry_api, github_token secret version, ar_secret_accessor]` | Full dependency chain required |

### Resource: `google_cloud_run_v2_service.frontend` (main.tf)

| Attribute                                        | Value / Expression                                                   | Notes |
| ------------------------------------------------ | -------------------------------------------------------------------- | ----- |
| `name`                                           | `var.service_name`                                                   | Default: `"backtest-frontend"` |
| `location`                                       | `var.region`                                                         | FR-001 |
| `template.containers[0].image`                   | `"${var.region}-docker.pkg.dev/${var.project_id}/${var.artifact_registry_repo}/reidlai/backtest-frontend:${var.image_tag}"` | AR URL (not ghcr.io directly) — FR-002 |
| `template.containers[0].ports[0].container_port` | `3000`                                                               | Matches Dockerfile `PORT=3000` |
| `template.containers[0].resources.limits.cpu`   | `var.cpu`                                                            | Default: `"1"` (FR-008) |
| `template.containers[0].resources.limits.memory`| `var.memory`                                                         | Default: `"512Mi"` (FR-008) |
| `template.containers[0].env` (dynamic)           | `for k, v in var.env_vars`                                           | Non-sensitive env vars (FR-011) |
| `template.scaling.min_instance_count`            | `var.min_instances`                                                  | Default: `0` (scale-to-zero, FR-004) |
| `template.scaling.max_instance_count`            | `var.max_instances`                                                  | Default: `10` (FR-004) |
| `ingress`                                        | `"INGRESS_TRAFFIC_ALL"`                                              | Public internet access |
| `depends_on`                                     | `[cloudrun_api, ghcr_proxy]`                                         | Ensures API and AR repo ready |

### IAM Resources (iam.tf)

| Resource                                                  | Principal | Role | Target | Notes |
| --------------------------------------------------------- | --------- | ---- | ------ | ----- |
| `google_cloud_run_v2_service_iam_member.public_access`    | `allUsers` | `roles/run.invoker` | Cloud Run service | Public unauthenticated access (FR-003, FR-006) |
| `google_artifact_registry_repository_iam_member.cloud_run_ar_reader` | Default Compute SA (`{project_number}-compute@developer.gserviceaccount.com`) | `roles/artifactregistry.reader` | AR repo | Cloud Run can pull images from AR (FR-006) |
| `google_secret_manager_secret_iam_member.ar_secret_accessor` | AR service agent (`service-{project_number}@gcp-sa-artifactregistry.iam.gserviceaccount.com`) | `roles/secretmanager.secretAccessor` | github_token secret | AR can read PAT from SM (FR-006) |

### Input Variables (main/)

| Variable                | Type          | Default               | Required | Description |
| ----------------------- | ------------- | --------------------- | -------- | ----------- |
| `project_id`            | `string`      | —                     | Yes      | GCP project ID (FR-005) |
| `region`                | `string`      | `"us-central1"`       | No       | GCP region (FR-001, FR-005) |
| `service_name`          | `string`      | `"backtest-frontend"` | No       | Cloud Run service resource name |
| `image_tag`             | `string`      | `"main"`              | No       | Docker image tag to deploy (FR-002) |
| `min_instances`         | `number`      | `0`                   | No       | Min instances; 0 = scale-to-zero (FR-004) |
| `max_instances`         | `number`      | `10`                  | No       | Max instances cap (FR-004) |
| `cpu`                   | `string`      | `"1"`                 | No       | CPU per container (FR-008) |
| `memory`                | `string`      | `"512Mi"`             | No       | Memory per container (FR-008) |
| `env_vars`              | `map(string)` | `{}`                  | No       | Non-sensitive env vars (FR-011) |
| `github_token`          | `string`      | —                     | Yes      | GitHub PAT with `read:packages`; `sensitive = true` (FR-015) |
| `artifact_registry_repo`| `string`      | `"ghcr-proxy"`        | No       | AR repository ID for GHCR proxy (FR-014) |

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
[GCS State Bucket Created]  (local state in bootstrap/)
      │
      ▼ main: tofu init -backend-config=backend.hcl
[Remote State Initialized]
      │
      ▼ main: tofu apply
[APIs Enabled → SM Secret Created → AR Service Identity Created]
      → [AR Secret IAM Binding Created]
      → [AR Remote Repo Created]
      → [Cloud Run Service Running] ──► (accessible via service_url)
      → [Public IAM Binding Applied]
      → [Cloud Run AR Reader IAM Binding Applied]
      │
      ▼ main: tofu apply (image_tag changed)
[Cloud Run New Revision Deployed] ──► (zero-downtime traffic shift; SC-002)
      │
      ▼ main: tofu destroy
[Cloud Run Service Removed → IAM Removed → AR Repo Removed → Secrets Removed → APIs remain]
      │
      ▼ bootstrap: tofu destroy (optional, manual)
[GCS State Bucket Removed]
[Not Provisioned]
```

---

## Validation Rules

| Variable            | Constraint |
| ------------------- | ---------- |
| `project_id`        | Non-empty string; validated by GCP API |
| `region`            | Valid GCP region (e.g., `"us-central1"`, `"europe-west1"`) |
| `image_tag`         | Non-empty string; image must exist in GHCR/AR cache |
| `min_instances`     | `>= 0` and `<= max_instances` |
| `max_instances`     | `>= 1` |
| `cpu`               | Valid Cloud Run CPU value: `"1"`, `"2"`, `"4"`, `"8"` |
| `memory`            | Valid Cloud Run memory: `"512Mi"`, `"1Gi"`, `"2Gi"`, etc. |
| `env_vars` keys     | Valid shell variable names (uppercase letters, digits, underscores) |
| `github_token`      | GitHub PAT with `read:packages` scope; never committed to source control |
| `artifact_registry_repo` | Valid Artifact Registry repository ID (lowercase letters, digits, hyphens) |
