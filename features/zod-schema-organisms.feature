@zod-schemas @frontend
Feature: Zod Schema per Organism
  As a developer
  I want each organism to have a corresponding Zod schema
  So that organism state has a single, validated, typed source of truth

  Background:
    Given the project has the "zod" package installed as a runtime dependency
    And the directory "src/lib/schemas" exists

  @smoke
  Scenario: Schema file exists for every organism
    Given 33 organism Svelte files exist in "src/lib/components/organisms/"
    When I list the files in "src/lib/schemas/"
    Then there are exactly 55 schema files with the ".schema.ts" suffix
    And a barrel export file "src/lib/schemas/index.ts" exists

  @smoke
  Scenario Outline: Schema parse with no arguments returns valid default state
    Given the schema file "<schema-file>" exists
    When I call "<schema-export>.parse({})"
    Then it returns an object matching the expected defaults
    And no exception is thrown

    Examples:
      | schema-file                          | schema-export                  |
      | ai-chat-panel.schema.ts              | AIChatPanelSchema              |
      | ai-research-box.schema.ts            | AIResearchBoxSchema            |
      | ai-review-panel.schema.ts            | AIReviewPanelSchema            |
      | performance-chart-tabs.schema.ts     | PerformanceChartTabsSchema     |
      | performance-metric-grid.schema.ts    | PerformanceMetricGridSchema    |
      | stub-section.schema.ts               | StubSectionSchema              |

  @integration
  Scenario: TypeScript compilation passes after schema integration
    Given all organism schemas are created
    And all organism components with local $state have been updated to use their schema
    When I run the TypeScript type-checker ("pnpm check")
    Then it exits with code 0
    And there are zero type errors

  @integration
  Scenario: PerformanceChartTabs schema validates enum values at runtime
    Given the "PerformanceChartTabsSchema" is loaded
    When I call "PerformanceChartTabsSchema.safeParse({ activeChartTab: 'invalid-tab' })"
    Then the result has "success: false"
    And the error describes an invalid enum value

  @integration
  Scenario: PerformanceMetricGrid state consolidation
    Given the "PerformanceMetricGrid.svelte" component is loaded
    When it initializes
    Then its local state is a single "$state" object typed as "PerformanceMetricGridState"
    And the individual "$state" declarations for tiles, draggedIndex, editingTileId, editValue, and modalOpen are removed

  @integration
  Scenario: Global state singletons are not modified
    Given the feature is fully implemented
    When I inspect "src/lib/state/app.svelte.ts"
    And I inspect "src/lib/state/backtest.svelte.ts"
    And I inspect "src/lib/state/strategy.svelte.ts"
    Then none of these files have been modified
    And none of these files import from "src/lib/schemas"

  @integration
  Scenario: All schemas are re-exported from the index barrel
    Given "src/lib/schemas/index.ts" exists
    When I import from "$lib/schemas"
    Then all 55 schema exports and their inferred types are available
