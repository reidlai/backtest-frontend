@frontend @smoke
Feature: Trade Lot Table Organism
  As a developer
  I want the trade lot table extracted into a self-contained organism
  So that the table logic is encapsulated, validated, and independently reusable

  Background:
    Given the file "src/lib/components/organisms/TradeLotTable.svelte" exists
    And the file "src/lib/schemas/trade-record.schema.ts" exists

  @smoke
  Scenario: Organism renders all fourteen columns for valid trades
    Given the organism receives a non-empty list of valid trade records
    When the organism renders
    Then it displays a table row for each trade
    And each row contains cells for Trade ID, Symbol, L/S, Entry Date, Entry Price, Exit Date, Exit Price, Qty, Comm., Slip., Net PnL, Return %, Days, and Exit Reason

  @smoke
  Scenario: Long trade direction cell uses blue styling
    Given the organism receives a trade with direction "Long"
    When the organism renders
    Then the direction cell text has blue colour styling

  @smoke
  Scenario: Short trade direction cell uses orange styling
    Given the organism receives a trade with direction "Short"
    When the organism renders
    Then the direction cell text has orange colour styling

  @smoke
  Scenario: Positive Net PnL cell uses green styling
    Given the organism receives a trade with a positive netPnl value
    When the organism renders
    Then the Net PnL cell has green colour styling

  @smoke
  Scenario: Zero or negative Net PnL cell uses red styling
    Given the organism receives a trade with a zero or negative netPnl value
    When the organism renders
    Then the Net PnL cell has red colour styling

  @smoke
  Scenario: Empty trades list shows empty-state card
    Given the organism receives an empty trades list
    When the organism renders
    Then it displays a card with the text "No trade records yet."
    And it displays a "Go to Backtest Engine" button

  @smoke
  Scenario: Empty-state button navigates to backtest engine
    Given the organism receives an empty trades list
    When the organism renders
    Then the "Go to Backtest Engine" button links to "/backtest-engine"

  @smoke
  Scenario: Invalid trade records are excluded from the rendered list
    Given the organism receives a list containing one valid and one invalid trade record
    When the organism renders
    Then only the valid trade is displayed as a table row

  @smoke
  Scenario: Parent page delegates table rendering to organism
    Given the file "src/routes/trade-lot/+page.svelte" exists
    When I read the file contents
    Then it does not contain any "Table.Root" markup
    And it does contain a "TradeLotTable" component tag
