variable "project_id" {
  description = "The GCP project ID where the Terraform state bucket will be created."
  type        = string
}

variable "region" {
  description = "The GCS bucket location (GCP region)."
  type        = string
  default     = "us-central1"
}

variable "bucket_name" {
  description = "Name of the GCS bucket used for Terraform remote state storage. Recommended pattern: {project_id}-backtest-tfstate"
  type        = string
}
