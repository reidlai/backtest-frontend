resource "google_secret_manager_secret" "github_token" {
  project   = var.project_id
  secret_id = "ar-github-token"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secretmanager_api]
}

resource "google_secret_manager_secret_version" "github_token" {
  secret      = google_secret_manager_secret.github_token.id
  secret_data = var.github_token
}
