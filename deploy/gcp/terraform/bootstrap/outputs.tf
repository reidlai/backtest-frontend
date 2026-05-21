output "bucket_name" {
  description = "Name of the provisioned GCS Terraform state bucket. Use this in backend.hcl."
  value       = google_storage_bucket.tfstate.name
}

output "bucket_url" {
  description = "gs:// URL of the Terraform state bucket."
  value       = "gs://${google_storage_bucket.tfstate.name}"
}
