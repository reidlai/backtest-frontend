# ar-github-token is pre-created outside Terraform; we read it as a data source
# so Terraform never attempts to create or overwrite it.
data "google_secret_manager_secret" "github_token" {
  project   = var.project_id
  secret_id = "ar-github-token"

  depends_on = [google_project_service.secretmanager_api]
}

data "google_secret_manager_secret_version" "github_token" {
  project = var.project_id
  secret  = data.google_secret_manager_secret.github_token.secret_id
}
