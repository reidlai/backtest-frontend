resource "google_project_service" "cloudrun_api" {
  service                    = "run.googleapis.com"
  disable_on_destroy         = false
  disable_dependent_services = false
}

resource "google_project_service" "artifactregistry_api" {
  service                    = "artifactregistry.googleapis.com"
  disable_on_destroy         = false
  disable_dependent_services = false
}

resource "terraform_data" "ar_service_identity" {
  input = var.project_id

  provisioner "local-exec" {
    command = "gcloud --quiet beta services identity create --service=artifactregistry.googleapis.com --project=${self.input}"
  }

  depends_on = [google_project_service.artifactregistry_api]
}

resource "google_project_service" "secretmanager_api" {
  service                    = "secretmanager.googleapis.com"
  disable_on_destroy         = false
  disable_dependent_services = false
}
