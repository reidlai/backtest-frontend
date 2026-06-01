@frontend @smoke
Feature: Sentiment Events Table Organism
  As a developer
  I want the sentiment events table extracted into a self-contained organism
  So that the table logic is encapsulated, validated, and independently reusable

  Background:
    Given the file "src/lib/components/organisms/SentimentEventsTable.svelte" exists
    And the file "src/lib/schemas/sentiment-event.schema.ts" exists

  @smoke
  Scenario: Organism renders all six columns for valid events
    Given the organism receives a non-empty list of valid sentiment events
    When the organism renders
    Then it displays a table row for each event
    And each row contains cells for Type, Symbol, Date, Headline, Sentiment, and Score

  @smoke
  Scenario: Symbol cell falls back to "Global" when symbol is empty
    Given the organism receives an event with an empty symbol field
    When the organism renders
    Then the Symbol cell displays "Global"

  @smoke
  Scenario: Sentiment badge uses green styling for positive sentiment
    Given the organism receives an event with sentiment "positive"
    When the organism renders
    Then the Sentiment badge has green colour styling

  @smoke
  Scenario: Sentiment badge uses red styling for negative sentiment
    Given the organism receives an event with sentiment "negative"
    When the organism renders
    Then the Sentiment badge has red colour styling

  @smoke
  Scenario: Sentiment badge uses muted styling for neutral sentiment
    Given the organism receives an event with sentiment "neutral"
    When the organism renders
    Then the Sentiment badge has muted colour styling

  @smoke
  Scenario: Score bar extends right for positive score
    Given the organism receives an event with a positive score
    When the organism renders
    Then the score bar extends to the right of centre in green

  @smoke
  Scenario: Score bar extends left for negative score
    Given the organism receives an event with a negative score
    When the organism renders
    Then the score bar extends to the left of centre in red

  @smoke
  Scenario: Empty events list shows "No events found" row
    Given the organism receives an empty events list
    When the organism renders
    Then it displays a single row with the text "No events found" spanning all columns

  @smoke
  Scenario: Invalid events are excluded from the rendered list
    Given the organism receives a list containing one valid and one invalid event
    When the organism renders
    Then only the valid event is displayed as a table row

  @smoke
  Scenario: Parent page delegates table rendering to organism
    Given the file "src/routes/sentiment-events/+page.svelte" exists
    When I read the file contents
    Then it does not contain any "Table.Root" markup
    And it does contain a "SentimentEventsTable" component tag
