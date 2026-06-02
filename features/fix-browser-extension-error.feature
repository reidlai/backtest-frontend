@smoke @fix
Feature: Fix Browser Extension Message Channel Error on Initial Page Load

  As a developer running the backtest app locally
  I want the browser console to be free of message channel errors on page load
  So that real application errors are not masked during development

  # US1: Home page loads without message channel errors
  Scenario: Home page loads without message channel errors
    Given the app is running
    When the user navigates to "/"
    Then the browser console shows no errors for route "/"

  # US2: Console stays clean across 10 consecutive reloads
  Scenario: Home page console stays clean across multiple reloads
    Given the app is running
    When the user reloads "/" 10 consecutive times
    Then the browser console shows no errors for route "/"

  # US3: Console remains clean when async data source is swapped (future)
  @future
  Scenario: Console remains clean when async data source is swapped from mock to real
    Given the app is running with at least one component using a real async data source
    When the user navigates to "/"
    Then the browser console shows no errors for route "/"
