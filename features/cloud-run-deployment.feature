@smoke @infrastructure
Feature: GCP Cloud Run Deployment

  As an operator
  I want the Cloud Run service to be publicly accessible after Terraform apply
  So that users can reach the backtest frontend application

  Background:
    Given the environment variable "CLOUD_RUN_URL" is set to the Cloud Run service URL

  @smoke
  Scenario: Service is publicly accessible
    Given the Cloud Run service has been deployed with Terraform
    When I send a GET request to the service URL
    Then the response status code should be 200

  @smoke
  Scenario: Service serves a valid HTML document
    Given the Cloud Run service has been deployed with Terraform
    When I send a GET request to the service URL
    Then the response Content-Type should contain "text/html"
    And the response body should contain "<html"

  @integration
  Scenario: Service URL is exposed as a Terraform output
    Given the Terraform configuration has been applied
    When I run "terraform output service_url"
    Then the output should be a valid HTTPS URL

  @integration
  Scenario: Re-applying unchanged Terraform configuration produces no changes
    Given the Terraform configuration has been applied
    When I run "terraform plan"
    Then the plan should report zero changes
