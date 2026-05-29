/**
 * Canonical Zod schema for the ScreenerFilterPanel organism.
 * Re-exports FundamentalScreenerSchema so the organism has a dedicated schema
 * entry consistent with the project's one-schema-per-organism convention.
 */
export {
	FundamentalScreenerSchema as ScreenerFilterPanelSchema,
	type FundamentalScreenerState as ScreenerFilterPanelState
} from './fundamental-screener.schema';
