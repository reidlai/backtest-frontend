@smoke @ci
Feature: CI Quality Gates
  As a developer pushing code to the backtest-frontend repository
  I want automated quality gates to enforce security and code standards
  So that only verified, secure code is merged to main and published to GHCR

  @smoke @ci
  Scenario: SCA blocks on HIGH severity dependency vulnerability
    Given a pull request is opened against the main branch
    And the pnpm-lock.yaml contains a dependency with a HIGH severity CVE
    When the ci-sca job runs
    Then the job exits with a non-zero status code
    And a sca-report.json artifact is uploaded to the run
    And all downstream jobs are skipped

  @smoke @ci
  Scenario: SCA warns on MEDIUM severity finding without blocking
    Given a pull request is opened against the main branch
    And the pnpm-lock.yaml contains a dependency with a MEDIUM severity CVE
    When the ci-sca job runs
    Then the job exits with status code 0
    And a sca-report.json artifact is uploaded to the run

  @smoke @ci
  Scenario: Formatting check fails on non-conformant file
    Given a push is made to a feature branch
    And a TypeScript file does not conform to Prettier formatting rules
    When the ci-format-lint job runs
    Then the job exits with a non-zero status code
    And a format-lint-report artifact containing prettier-report.txt is uploaded
    And all downstream jobs are skipped

  @smoke @ci
  Scenario: Lint check fails on ESLint violation
    Given a push is made to a feature branch
    And a TypeScript file contains an ESLint rule violation
    When the ci-format-lint job runs
    Then the job exits with a non-zero status code
    And a format-lint-report artifact containing eslint-report.json is uploaded
    And all downstream jobs are skipped

  @smoke @ci
  Scenario: Unit test failure halts the pipeline
    Given a push is made to a feature branch
    And a server-side unit test is failing
    When the ci-unit-tests job runs
    Then the job exits with a non-zero status code
    And a coverage-report artifact is uploaded to the run
    And all downstream jobs are skipped

  @smoke @ci
  Scenario: Docker image built after all quality gates pass
    Given a push is made to a feature branch
    And all five quality gate jobs pass successfully
    When the build job runs
    Then a docker-image tarball artifact is uploaded to the run
    And the artifact retention period is 1 day

  @smoke @ci
  Scenario: Trivy SAST blocks on HIGH severity container finding
    Given a docker-image artifact has been built and uploaded
    And the Docker image contains a HIGH severity OS package vulnerability
    When the sast job runs
    Then the job exits with a non-zero status code
    And a trivy-sast-report SARIF artifact is uploaded to the run
    And the push-to-ghcr job is skipped

  @smoke @ci
  Scenario: GHCR image pushed on main branch push after all stages pass
    Given all quality gate, build, and SAST jobs have passed
    And the push event is on the main branch
    When the push-to-ghcr job runs
    Then the Docker image is tagged with the branch name and short commit SHA
    And the image is pushed to ghcr.io under the repository namespace

  @smoke @ci
  Scenario: GHCR push skipped on feature branch push
    Given all quality gate and build jobs have passed
    And the push event is on a feature branch other than main
    When the push-to-ghcr job evaluates its if condition
    Then the push-to-ghcr job is skipped
    And no image is published to GHCR
