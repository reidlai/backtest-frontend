/**
 * Re-exports the canonical TradeRecord schema from src/lib/zodios/schemas/.
 * Import paths using '$lib/schemas/trade-record.schema' continue to work.
 *
 * Migration note: fields updated from camelCase to snake_case per OpenAPI spec.
 * Removed: commission, slippage, holdingDays, direction (→ side), tradeId (→ trade_id)
 * Added: exit_reason (optional), symbol retained, quantity retained
 */
export { TradeRecordSchema, type TradeRecord } from '$lib/zodios/schemas/trade-record.schema.js';
