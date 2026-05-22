data "google_project" "project" {
  project_id = var.project_id
}

resource "google_cloud_run_v2_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.frontend.location
  name     = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_artifact_registry_repository_iam_member" "cloud_run_ar_reader" {
  project    = var.project_id
  location   = var.region
  repository = google_artifact_registry_repository.ghcr_proxy.repository_id
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

resource "google_secret_manager_secret_iam_member" "ar_secret_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.github_token.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-artifactregistry.iam.gserviceaccount.com"
}
