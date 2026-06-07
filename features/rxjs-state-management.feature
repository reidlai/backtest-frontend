@smoke @api
Feature: RxJS BehaviorSubject State Management for API Resources
  As a frontend developer
  I want RxJS BehaviorSubject streams wired to the Zodios API client
  So that market metrics, strategies, and backtest runs are reactively updated in application state

  Background:
    Given the Zodios API client is initialised with the backtest-eapi base URL
    And the RxJS stream modules are imported from src/lib/rxjs/

  # ── User Story 1: Market Metrics Live Data Feed ───────────────────────────────

  Scenario: Market metrics stream initialises with null value
    When the marketMetricsData$ BehaviorSubject is subscribed before refresh() is called
    Then the subscriber immediately receives null

  Scenario: refresh() triggers a fetch and emits MarketMetricCollectionResult
    Given the API responds to GET /v1/market-metrics with a valid MarketMetricCollectionResult
    When refreshMarketMetrics() is called
    Then marketMetricsData$ emits a MarketMetricCollectionResult containing five items
    And each item has symbol, name, value, change, change_pct, as_of, and stale fields

  Scenario: Market metric with stale flag true is preserved in state
    Given the API responds with a MarketMetricResult where stale is true for VIX
    When refreshMarketMetrics() is called
    Then marketMetricsData$.value.items contains a VIX entry with stale set to true

  Scenario: 401 error on market metrics sets error$ and retains last good data
    Given marketMetricsData$ previously emitted a valid collection
    And the API now responds to GET /v1/market-metrics with 401
    When refreshMarketMetrics() is called
    Then marketMetricsError$ emits an error
    And marketMetricsData$ still holds the previous valid collection

  Scenario: Explicit refresh() clears error and re-fetches
    Given marketMetricsError$ holds an error from a prior failed fetch
    And the API now responds to GET /v1/market-metrics with 200 and a valid collection
    When refreshMarketMetrics() is called
    Then marketMetricsError$ emits null
    And marketMetricsData$ emits the new valid collection

  Scenario: Rapid successive refresh() calls result in exactly one completed request
    Given the API takes 500ms to respond to GET /v1/market-metrics
    When refreshMarketMetrics() is called three times in rapid succession
    Then only one network request completes
    And marketMetricsData$ emits exactly one result

  # ── User Story 2: Strategy List Reactive State ────────────────────────────────

  Scenario: Strategy list BehaviorSubject replays last value to new subscriber
    Given strategiesData$ has already emitted a valid PagedStrategyResult
    When a new component subscribes to strategiesData$
    Then the subscriber immediately receives the last emitted PagedStrategyResult
    And no additional network request is made

  Scenario: refreshStrategies() calls GET /v1/strategies and emits PagedStrategyResult
    Given the API responds to GET /v1/strategies with a valid PagedStrategyResult
    When refreshStrategies() is called
    Then strategiesData$ emits a PagedStrategyResult with an items array of StrategyResult objects

  # ── User Story 3: Backtest Runs Reactive State ────────────────────────────────

  Scenario: Backtest runs stream emits updated list after run creation
    Given backtestRunsData$ holds a PagedBacktestRunResult with two runs
    And a new backtest run is created via the Zodios client
    When refreshBacktestRuns() is called
    Then backtestRunsData$ emits a PagedBacktestRunResult with three runs

  Scenario: Backtest runs 401 error propagates to error$ stream
    Given the API responds to GET /v1/backtest-runs with 401
    When refreshBacktestRuns() is called
    Then backtestRunsError$ emits an error with status 401

  # ── Architecture Constraints ──────────────────────────────────────────────────

  Scenario: RxJS stream modules are singletons
    Given two separate components both import marketMetricsData$ from src/lib/rxjs
    When one component triggers refreshMarketMetrics()
    Then both components receive the same emitted value from the same BehaviorSubject instance

  Scenario: State modules contain no RxJS imports
    When the state directory src/lib/state/ is inspected
    Then no file under src/lib/state/ imports from rxjs or src/lib/rxjs/

  Scenario: Market metric Zod schema validates OpenAPI example payload
    Given the OpenAPI example payload for MarketMetricResult with symbol VIX, value 14.25, change -0.35, change_pct -2.4
    When the payload is parsed by MarketMetricResultSchema
    Then parsing succeeds with no ZodError
    And the result has stale set to false
