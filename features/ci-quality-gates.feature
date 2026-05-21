@smoke @ci
Feature: GitHub CI Workflow Quality Gates
  As a developer
  I want my code to pass through sequential quality gates
  So that I can ensure security, quality, and reproducibility before merging

  Scenario: SCA blocks on HIGH severity dependency vulnerability
    Given a commit with a HIGH severity vulnerability in pnpm-lock.yaml
    When the ci-sca job runs
    Then the pipeline fails
    And the sca-report.json is uploaded

  Scenario: SCA warns on MEDIUM severity finding without blocking
    Given a commit with only MEDIUM severity vulnerabilities in pnpm-lock.yaml
    When the ci-sca job runs
    Then the pipeline passes
    And the sca-report.json is uploaded

  Scenario: Formatting check fails on non-conformant file
    Given a commit with a file that does not match Prettier standards
    When the ci-format-lint job runs
    Then the pipeline fails
    And the format-lint-report is uploaded

  Scenario: Lint check fails on ESLint violation
    Given a commit with an ESLint violation
    When the ci-format-lint job runs
    Then the pipeline fails
    And the format-lint-report is uploaded

  Scenario: Unit test failure halts the pipeline
    Given a commit with a failing unit test in the server project
    When the ci-unit-tests job runs
    Then the pipeline fails
    And the coverage-report is uploaded

  Scenario: Secrets scan blocks on committed secret
    Given a commit containing a hardcoded credential or API key
    When the ci-secrets-scan job runs
    Then the pipeline fails
    And the secrets-scan-report is uploaded
    And no waiver can override the failure

  Scenario: Docker image built after all quality gates pass
    Given a commit that passes all quality gates
    When the build job runs
    Then a Docker image is built using the distroless base
    And the docker-image tarball is uploaded

  Scenario: Trivy SAST blocks on HIGH severity container finding
    Given a built Docker image with a HIGH severity vulnerability
    When the sast job runs
    Then the pipeline fails
    And the trivy-sast-report is uploaded

  Scenario: GHCR image pushed on main branch push after all stages pass
    Given a commit on the main branch that passes all stages
    When the push-to-ghcr job runs
    Then the Docker image is pushed to GHCR
    And the GHCR tags match the branch name and commit SHA

  Scenario: GHCR push skipped on feature branch push
    Given a commit on a feature branch that passes all stages
    When the push-to-ghcr job evaluates its condition
    Then the push-to-ghcr job is skipped
