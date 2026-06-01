@billing-card-organisms @zod-schemas @frontend
Feature: Billing Card Organisms
  As a developer
  I want each billing page card to be a self-contained organism with Zod schema validation
  So that data integrity is guaranteed and each card can be developed and tested independently

  Background:
    Given the project has the "zod" package installed as a runtime dependency
    And the directory "src/lib/components/organisms" exists
    And the directory "src/lib/schemas" exists

  # -------------------------------------------------------------------------
  # TokenUsageCard
  # -------------------------------------------------------------------------

  @smoke
  Scenario: TokenUsageCard organism file exists with its schema
    Given the organism file "src/lib/components/organisms/TokenUsageCard.svelte" exists
    And the schema file "src/lib/schemas/token-usage-card.schema.ts" exists
    Then the schema export "TokenUsageCardSchema" is available from "$lib/schemas"

  @smoke
  Scenario: TokenUsageCard renders with valid data
    Given the "TokenUsageCardSchema" is loaded
    When I call "TokenUsageCardSchema.parse({ tokensUsed: 4250, tokensTotal: 10000 })"
    Then it returns an object with "tokensUsed" equal to 4250
    And no exception is thrown

  @smoke
  Scenario: TokenUsageCard schema defaults are valid
    Given the "TokenUsageCardSchema" is loaded
    When I call "TokenUsageCardSchema.parse({})"
    Then it returns an object matching the expected defaults
    And no exception is thrown

  @integration
  Scenario: TokenUsageCard schema rejects invalid data — used exceeds total
    Given the "TokenUsageCardSchema" is loaded
    When I call "TokenUsageCardSchema.safeParse({ tokensUsed: 15000, tokensTotal: 10000 })"
    Then the result has "success: false"
    And the error describes a validation failure

  # -------------------------------------------------------------------------
  # BacktestRunsCard
  # -------------------------------------------------------------------------

  @smoke
  Scenario: BacktestRunsCard organism file exists with its schema
    Given the organism file "src/lib/components/organisms/BacktestRunsCard.svelte" exists
    And the schema file "src/lib/schemas/backtest-runs-card.schema.ts" exists
    Then the schema export "BacktestRunsCardSchema" is available from "$lib/schemas"

  @smoke
  Scenario: BacktestRunsCard renders with valid data including plan name
    Given the "BacktestRunsCardSchema" is loaded
    When I call "BacktestRunsCardSchema.parse({ backtestsUsed: 3, backtestsTotal: 10, planName: 'Pro Plan' })"
    Then it returns an object with "planName" equal to "Pro Plan"
    And no exception is thrown

  @integration
  Scenario: BacktestRunsCard schema rejects empty plan name
    Given the "BacktestRunsCardSchema" is loaded
    When I call "BacktestRunsCardSchema.safeParse({ backtestsUsed: 3, backtestsTotal: 10, planName: '' })"
    Then the result has "success: false"
    And the error describes a validation failure

  # -------------------------------------------------------------------------
  # SystemStatusCard
  # -------------------------------------------------------------------------

  @smoke
  Scenario: SystemStatusCard organism file exists with its schema
    Given the organism file "src/lib/components/organisms/SystemStatusCard.svelte" exists
    And the schema file "src/lib/schemas/system-status-card.schema.ts" exists
    Then the schema export "SystemStatusCardSchema" is available from "$lib/schemas"

  @smoke
  Scenario: SystemStatusCard renders with valid data
    Given the "SystemStatusCardSchema" is loaded
    When I call "SystemStatusCardSchema.parse({ queuePosition: 2, complexityScore: 67, estimatedRuntime: '~42s' })"
    Then it returns an object with "complexityScore" equal to 67
    And no exception is thrown

  @integration
  Scenario: SystemStatusCard schema rejects complexity score out of range
    Given the "SystemStatusCardSchema" is loaded
    When I call "SystemStatusCardSchema.safeParse({ queuePosition: 1, complexityScore: 150, estimatedRuntime: '~10s' })"
    Then the result has "success: false"
    And the error describes a validation failure

  # -------------------------------------------------------------------------
  # Page integration
  # -------------------------------------------------------------------------

  @integration
  Scenario: setting-billing page uses all three organism components
    Given the file "src/routes/setting-billing/+page.svelte" exists
    When I inspect its content
    Then it imports "TokenUsageCard" from "$lib/components/organisms/TokenUsageCard.svelte"
    And it imports "BacktestRunsCard" from "$lib/components/organisms/BacktestRunsCard.svelte"
    And it imports "SystemStatusCard" from "$lib/components/organisms/SystemStatusCard.svelte"
    And it does not contain any inline "<Card.Root>" blocks for the billing cards
