output "service_url" {
  description = "Public HTTPS URL of the deployed Cloud Run service."
  value       = google_cloud_run_v2_service.frontend.uri
}

output "service_name" {
  description = "Name of the deployed Cloud Run service."
  value       = google_cloud_run_v2_service.frontend.name
}
