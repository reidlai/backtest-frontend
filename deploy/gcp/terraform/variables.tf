variable "project_id" {
  description = "The GCP project ID where the Cloud Run service will be deployed."
  type        = string
}

variable "region" {
  description = "The GCP region for the Cloud Run service."
  type        = string
  default     = "us-central1"
}

variable "service_name" {
  description = "The name of the Cloud Run service resource."
  type        = string
  default     = "backtest-frontend"
}

variable "image_tag" {
  description = "Docker image tag to deploy. Matches a tag pushed to GHCR by ci.yaml and cached by the Artifact Registry remote repository."
  type        = string
  default     = "main"
}

variable "min_instances" {
  description = "Minimum number of Cloud Run instances. 0 enables scale-to-zero (cost-optimal)."
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of Cloud Run instances."
  type        = number
  default     = 10
}

variable "cpu" {
  description = "CPU allocation per container instance. Valid values: '1', '2', '4', '8'."
  type        = string
  default     = "1"
}

variable "memory" {
  description = "Memory limit per container instance. Examples: '512Mi', '1Gi', '2Gi'."
  type        = string
  default     = "512Mi"
}

variable "env_vars" {
  description = "Map of non-sensitive environment variables to inject into the Cloud Run container."
  type        = map(string)
  default     = {}
}

variable "github_token" {
  description = "GitHub Personal Access Token with `read:packages` scope; consumed by the Artifact Registry remote repository to authenticate to GHCR. Supplied via terraform.tfvars (gitignored). Never committed."
  type        = string
  sensitive   = true
}

variable "artifact_registry_repo" {
  description = "Name of the Artifact Registry remote repository used to proxy ghcr.io images."
  type        = string
  default     = "ghcr-proxy"
}
