@smoke @infrastructure
Feature: GCP Cloud Run Deployment

  As an operator
  I want the Cloud Run service to be publicly accessible after OpenTofu apply
  So that users can reach the backtest frontend application

  Background:
    Given the environment variable "CLOUD_RUN_URL" is set to the Cloud Run service URL

  @smoke
  Scenario: Service is publicly accessible
    Given the Cloud Run service has been deployed with OpenTofu
    When I send a GET request to the service URL
    Then the response status code should be 200

  @smoke
  Scenario: Service serves a valid HTML document
    Given the Cloud Run service has been deployed with OpenTofu
    When I send a GET request to the service URL
    Then the response Content-Type should contain "text/html"
    And the response body should contain "<html"

  @integration
  Scenario: Service URL is exposed as an OpenTofu output
    Given the OpenTofu configuration has been applied
    When I run "tofu output service_url"
    Then the output should be a valid HTTPS URL

  @integration
  Scenario: Re-applying unchanged OpenTofu configuration produces no changes
    Given the OpenTofu configuration has been applied
    When I run "tofu plan"
    Then the plan should report zero changes

  @integration
  Scenario: Failed revision leaves traffic on the healthy revision
    Given the OpenTofu configuration has been applied
    And a new revision has been deployed that fails health checks
    When I inspect the Cloud Run service traffic allocation
    Then traffic should remain routed to the previously healthy revision
