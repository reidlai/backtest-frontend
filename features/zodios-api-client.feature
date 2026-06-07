@smoke @api
Feature: Zodios API Client with OpenAPI-Derived Zod Schemas
  As a frontend developer
  I want a typed Zodios API client backed by Zod schemas derived from the OpenAPI spec
  So that all API calls are validated and TypeScript-typed end-to-end

  Background:
    Given the Zodios client is initialised with the backtest-eapi base URL

  # ── User Story 1: Zod Schema Validation ──────────────────────────────────────

  Scenario: Valid HealthResponse is parsed correctly
    Given a valid API response from GET /health with status "ok" and version "1.0.0"
    When the client receives the response
    Then a HealthResponse-shaped object is returned with status and version typed as strings

  Scenario: Missing required field causes Zod parse error
    Given the API returns a StrategyResult with the required "name" field omitted
    When the Zod schema parses the response
    Then a ZodError is thrown before the result reaches state

  Scenario: Valid BacktestRunResult contains all required fields
    Given a valid BacktestRunResult response with id, strategy_ids, strategy_versions, status, and config
    When it is parsed by BacktestRunResultSchema
    Then all required fields are present and correctly typed

  # ── User Story 2: Typed Zodios Client ─────────────────────────────────────────

  Scenario: listStrategies return type is PagedStrategyResult
    When the client calls listStrategies
    Then the return type is inferred as PagedStrategyResult
    And the items array contains StrategyResult objects with id, name, version, status, config

  Scenario: createBacktestRun with valid body returns BacktestRunResult
    Given a valid CreateBacktestRun body with strategy_ids, strategy_versions, and config
    When the client calls createBacktestRun
    And the server responds 201
    Then the return is typed as BacktestRunResult

  Scenario: triggerBacktestRun responds with ActionResponse
    Given a valid run_id
    When the client calls triggerBacktestRun
    And the server responds 202
    Then the return is typed as ActionResponse with run_id and status

  Scenario: getBacktestResult includes all four sub-domains
    Given a valid run_id and result_id
    When the client calls getBacktestResult
    And the server responds 200
    Then the return includes typed performance_metrics, equity_curve, execution_log, and signal_history

  # ── User Story 3: Centralised State ───────────────────────────────────────────

  Scenario: State modules exist for all API resource domains
    When the state directory is inspected
    Then src/lib/state/ contains strategy-list.svelte.ts, backtest-run.svelte.ts, and backtest-result.svelte.ts

  Scenario: Organisms receive data only via props
    Given a strategy list written to strategyListState
    When a page reads from strategyListState and passes data to a child organism
    Then the organism receives items as a prop
    And the organism does not import strategyListState directly

  Scenario: Error response is typed as RFC 7807 ErrorResponse
    Given an API call that returns a 404 error
    When the error is caught and written to state
    Then the state error field contains type, title, status, detail, and instance

  # ── User Story 4: Svelte 5 Rune State ─────────────────────────────────────────

  Scenario: Updating rune state triggers component reactivity
    Given a Svelte component reading from strategyListState
    When strategyListState.data is updated with new mock data
    Then the component re-renders with the new value

  Scenario: State modules compile without RxJS dependency
    # Note (feature 022): RxJS BehaviorSubject streams live in src/lib/rxjs/ (the approved
    # import boundary). State modules in src/lib/state/ remain RxJS-free singletons whose
    # $state properties are written to by layout-level subscription glue. This scenario
    # continues to hold after feature 022 is implemented.
    When the state module files are compiled
    Then no RxJS or Observable import is present in any file under src/lib/state/

  # ── Organism Updates ───────────────────────────────────────────────────────────

  Scenario: TradeLotTable renders snake_case fields correctly
    Given TradeLotTable receives an array of TradeRecord props
    When a trade with trade_id, side, entry_timestamp, exit_timestamp, and exit_reason is rendered
    Then the table displays trade_id, side, entry and exit timestamps, and exit_reason columns
    And no commission, slippage, or holdingDays columns are present

  Scenario: PerformanceSummary accepts four decomposed props
    Given PerformanceSummary receives performanceMetrics, equityCurve, executionLog, and signalHistory props
    When the component renders
    Then it uses performanceMetrics.total_return_pct from the PerformanceMetrics prop

  Scenario: PerformanceMetricGrid keeps UI interaction state local
    Given PerformanceMetricGrid receives a performanceMetrics prop
    When the user drags a tile
    Then draggedIndex is updated in local component state
    And draggedIndex is not present in src/lib/state/
