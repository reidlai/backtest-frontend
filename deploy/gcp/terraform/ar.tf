resource "google_artifact_registry_repository" "backtest-frontend" {
  project       = var.project_id
  location      = var.region
  repository_id = var.artifact_registry_repo
  format        = "DOCKER"
  mode          = "REMOTE_REPOSITORY"

  remote_repository_config {
    description = "Pull-through cache for private GHCR images"
    docker_repository {
      custom_repository {
        uri = "https://ghcr.io"
      }
    }
    upstream_credentials {
      username_password_credentials {
        username                = "reidlai"
        password_secret_version = data.google_secret_manager_secret_version.github_token.name
      }
    }
  }

  depends_on = [
    google_project_service.artifactregistry_api,
    data.google_secret_manager_secret_version.github_token,
    google_secret_manager_secret_iam_member.ar_secret_accessor,
  ]
}
