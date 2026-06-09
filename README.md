# backtest-frontend

A SvelteKit frontend for visualising and analysing algorithmic trading strategy
backtesting results, deployed to GCP Cloud Run.

## What is Backtesting?

Backtesting is the process of evaluating a trading strategy against historical
market data before committing real capital. Instead of running a strategy live
and risking losses, you replay it over past prices to measure how it would have
performed. Key metrics typically evaluated include:

- **Total return** — cumulative profit/loss over the test period
- **Sharpe ratio** — risk-adjusted return relative to volatility
- **Max drawdown** — the largest peak-to-trough decline (a measure of downside risk)
- **Win rate** — percentage of individual trades that were profitable
- **Trade frequency** — how often the strategy enters and exits positions

This frontend connects to a backend strategy engine, fetches backtesting run
results, and renders interactive performance charts and summary statistics so
traders and quants can compare strategy variants side-by-side.

## Tech Stack

| Layer          | Technology                                                |
| -------------- | --------------------------------------------------------- |
| Framework      | SvelteKit 2 (SSR, Node adapter)                           |
| Styling        | Tailwind CSS 4                                            |
| Charts         | D3 + LayerChart                                           |
| UI Components  | bits-ui + Storybook                                       |
| Testing        | Vitest (unit) · Playwright (e2e) · Cucumber/Gherkin (BDD) |
| Container      | Docker — distroless base, non-root, multi-stage           |
| Infrastructure | OpenTofu (IaC) on GCP Cloud Run v2                        |

## Quick Start (GCP)

Deploy the frontend to GCP Cloud Run in three steps.

### Prerequisites

| Requirement                                                  | Notes                                                                                                           |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| [OpenTofu](https://opentofu.org/docs/intro/install/) ≥ 1.6.0 | `brew install opentofu` on macOS                                                                                |
| GCP project with billing enabled                             | Any region supported by Cloud Run                                                                               |
| `gcloud` CLI, authenticated                                  | `gcloud auth application-default login`                                                                         |
| Operator IAM role                                            | `roles/editor`, or Cloud Run Admin + IAM Admin + Storage Admin + Artifact Registry Admin + Secret Manager Admin |
| GitHub PAT with `read:packages` scope                        | Used by Artifact Registry to pull the private GHCR image on behalf of Cloud Run                                 |

### Step 1 — Bootstrap (one-time)

Provision the GCS bucket that stores OpenTofu remote state.

```bash
cd deploy/gcp/terraform/bootstrap
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars: set project_id, region, bucket_name
tofu init
tofu apply
# Note the bucket_name output — needed in Step 2
```

### Step 2 — Configure the main module

```bash
cd deploy/gcp/terraform

# Remote state backend
cp backend.hcl.example backend.hcl
# Edit backend.hcl: bucket = "<bucket_name from Step 1>"

# Input variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars and set at minimum:
#   project_id             — your GCP project ID
#   region                 — e.g. us-central1
#   github_token           — GitHub PAT with read:packages scope
#   artifact_registry_repo — AR repo name (default: ghcr-proxy)
#   env_vars               — e.g. { PUBLIC_API_URL = "https://api.example.com" }
```

### Step 3 — Deploy

```bash
tofu init -backend-config=backend.hcl
tofu plan     # Review the planned resources
tofu apply    # Provision Cloud Run, Artifact Registry, Secret Manager
```

`tofu apply` prints a `service_url` output. Open it in a browser to confirm the
frontend is live.

### Updating the deployed image tag

```bash
# Edit terraform.tfvars: change image_tag to a short SHA or semver tag
tofu apply
# Cloud Run creates a new revision and shifts 100% traffic with zero downtime
```

### Teardown

```bash
# Remove all Cloud Run and supporting resources
cd deploy/gcp/terraform && tofu destroy

# Optionally remove the GCS state bucket
cd deploy/gcp/terraform/bootstrap && tofu destroy
```

### Troubleshooting

| Problem                             | Likely Cause                     | Fix                                                     |
| ----------------------------------- | -------------------------------- | ------------------------------------------------------- |
| `403 Permission Denied` on apply    | Insufficient IAM                 | Grant Cloud Run Admin + IAM Admin + AR Admin + SM Admin |
| `Error: bucket not found` on init   | Bootstrap not run                | Complete Step 1 first                                   |
| Service URL returns 503             | Container failed to start        | Check Cloud Logging; verify image tag exists in GHCR    |
| AR cannot pull from GHCR            | Expired GitHub token             | Rotate PAT; run `tofu apply` to update Secret Manager   |
| `tofu plan` shows drift after apply | Non-deterministic GCP attributes | Run `tofu apply` again; resolves on second apply        |

## Run Locally with Docker

Pull and run a published image from GHCR without a local build toolchain.

### Prerequisites

| Requirement                     | Notes                                                                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Docker ≥ 24                     | `docker --version` to confirm                                                                                                          |
| GHCR read access                | Public repo — no `docker login` required for public images; authenticate with a GitHub PAT (`read:packages`) if the package is private |
| A running backtest-eapi backend | Obtain the service URL from your Cloud Run console or `tofu apply` output                                                              |

### Find an available image tag

Browse published tags on the [GHCR packages page](https://github.com/reidlai/backtest-frontend/pkgs/container/backtest-frontend) or retrieve the latest tag from CI output.

Tags follow the format `build-YYYYMMDDHHMI` (e.g. `build-202606090136`) or a semver tag (e.g. `v1.2.3`).

### Run

```bash
docker run -p 3000:3000 \
  -e PUBLIC_USE_MOCK_DATA="false" \
  -e PUBLIC_LOG_LEVEL="info" \
  -e PUBLIC_BACKTEST_EAPI_URL="https://<your-backtest-eapi-url>" \
  -e PUBLIC_BACKTEST_EAPI_TOKEN="<your-token>" \
  ghcr.io/reidlai/backtest-frontend:<IMAGE_TAG>
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Security**: Never commit a real token to source control. Treat
> `PUBLIC_BACKTEST_EAPI_TOKEN` as a secret — supply it via `-e` at runtime only.

### Environment variable reference

| Variable                     | Required | Default | Description                                                                                                                          |
| ---------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `PUBLIC_BACKTEST_EAPI_URL`   | ✅       | —       | Base URL of the backtest-eapi backend (no trailing slash). Obtain from Cloud Run console or `tofu apply` `service_url` output.       |
| `PUBLIC_BACKTEST_EAPI_TOKEN` | ✅       | —       | Bearer token for backend authentication. Any non-empty string works against the demo backend; use a signed JWT in production.        |
| `PUBLIC_USE_MOCK_DATA`       |          | `true`  | Set to `false` to fetch live data from the backend. Leave as `true` to use bundled sample data (no backend required).                |
| `PUBLIC_LOG_LEVEL`           |          | `info`  | Pino log level for RxJS stream logging and server startup diagnostics. Valid values: `debug` · `info` · `warn` · `error` · `silent`. |

### Troubleshooting

| Problem                                    | Likely Cause                        | Fix                                                                                                                          |
| ------------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `docker: Error response: manifest unknown` | Invalid image tag                   | Check the [GHCR packages page](https://github.com/reidlai/backtest-frontend/pkgs/container/backtest-frontend) for valid tags |
| `docker: permission denied`                | Private package, not authenticated  | `echo $GITHUB_TOKEN \| docker login ghcr.io -u <github-username> --password-stdin`                                           |
| Browser shows empty tiles, no data         | `PUBLIC_USE_MOCK_DATA` still `true` | Pass `-e PUBLIC_USE_MOCK_DATA="false"`                                                                                       |
| API calls return 401                       | Token missing or incorrect          | Verify `PUBLIC_BACKTEST_EAPI_TOKEN` is set and non-empty                                                                     |
| No server startup log visible              | `PUBLIC_LOG_LEVEL=warn` or higher   | Set `-e PUBLIC_LOG_LEVEL="info"` to see the startup env summary                                                              |

## Local Development

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

## Running Tests

```bash
pnpm test:unit    # Vitest unit tests
pnpm test:e2e     # Playwright end-to-end tests
```

## CI/CD Pipeline

The CI pipeline (`.github/workflows/ci.yaml`) runs on every push and PR:

1. **`ci-sca`** — dependency vulnerability scan (audit-ci)
2. **`ci-format-lint`** — Prettier + ESLint
3. **`ci-secrets-scan`** — Gitleaks secrets detection
4. **`ci-unit-tests`** — Vitest unit tests
5. **`build`** — Docker image build and export
6. **`sast`** — Trivy container scan (HIGH/CRITICAL findings block)
7. **`push-to-ghcr`** — publish to `ghcr.io/reidlai/backtest-frontend` (main branch and version tags only)

Cloud Run pulls the image via an **Artifact Registry remote repository**
(pull-through proxy to GHCR) authenticated with a GitHub PAT stored in
GCP Secret Manager. No CI pipeline changes are needed for deployment.
