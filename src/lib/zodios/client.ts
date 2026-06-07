/**
 * Zodios API client singleton for backtest-eapi.
 *
 * Uses @zodios/core v11 (ZodiosCore) with native fetch. The base URL is read
 * from the PUBLIC_BACKTEST_EAPI_URL env var at module initialisation time.
 *
 * All 15 endpoints from the OpenAPI spec are declared here with their Zod
 * response schemas so that every response is validated at runtime.
 *
 * Feature: 021-zodios-api-client
 */
import { z } from 'zod';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — ZodiosCore v11 beta; AnyZodiosFetcherProvider generic not fully exposed
import { ZodiosCore, setFetcherHook } from '@zodios/core';
import {
	ActionResponseSchema,
	BacktestResultResourceSchema,
	BacktestRunResultSchema,
	HealthResponseSchema,
	PagedBacktestResultResourceSchema,
	PagedBacktestRunResultSchema,
	PagedStrategyResultSchema,
	StrategyResultSchema,
	BacktestRunServiceCreateRequestBodySchema,
	StrategyServiceUpsertRequestBodySchema,
	StrategyServiceReplaceRequestBodySchema,
	StrategyServicePatchRequestBodySchema
} from './index.js';

// ── Native-fetch FetcherProvider type ────────────────────────────────────────

/**
 * Minimal FetcherProvider descriptor that satisfies `AnyZodiosFetcherProvider`.
 * This lets us type the ZodiosCore instance without depending on an Axios adapter.
 */
interface NativeFetchProvider {
	arg1: string;
	arg2: RequestInit;
	options: { baseURL?: string };
	config: {
		url: string;
		method: string;
		headers?: Record<string, string>;
		queries?: Record<string, string | number | boolean>;
		params?: Record<string, string>;
		body?: unknown;
		baseURL?: string;
	};
	response: {
		data: unknown;
		headers: Headers;
		status: number;
		config: NativeFetchProvider['config'];
	};
	error: { response?: { status: number; data: unknown }; message: string };
}

// ── Register the global native-fetch hook ─────────────────────────────────────

setFetcherHook({
	fetch(config: NativeFetchProvider['config']): Promise<NativeFetchProvider['response']> {
		// Build URL: base + path (trailing slash already stripped in spec)
		let url = (config.baseURL ?? '') + config.url;

		// Interpolate :param placeholders (e.g. /v1/strategies/:id)
		for (const [key, value] of Object.entries(config.params ?? {})) {
			url = url.replace(`:${key}`, encodeURIComponent(String(value)));
		}

		// Append query parameters
		const queryEntries = Object.entries(config.queries ?? {}).filter(
			([, v]) => v !== undefined && v !== null
		);
		if (queryEntries.length > 0) {
			const qs = new URLSearchParams(queryEntries.map(([k, v]) => [k, String(v)]));
			url += '?' + qs.toString();
		}

		// Build fetch init
		const headers: Record<string, string> = { ...(config.headers ?? {}) };
		const init: RequestInit = {
			method: (config.method ?? 'GET').toUpperCase(),
			headers
		};

		if (config.body !== undefined) {
			init.body = JSON.stringify(config.body);
			headers['Content-Type'] = 'application/json';
		}

		return fetch(url, init).then(async (res) => {
			const contentType = res.headers.get('content-type') ?? '';
			const data: unknown = contentType.includes('application/json')
				? await res.json()
				: await res.text();
			return { data, headers: res.headers, status: res.status, config };
		});
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

// ── Endpoint definitions (all 15 from OpenAPI spec) ───────────────────────────

const backtestEapiEndpoints = [
	// ─── Health ────────────────────────────────────────────────────────────────
	{
		method: 'get' as const,
		path: '/health',
		alias: 'healthz',
		description: 'Liveness check.',
		response: HealthResponseSchema
	},

	// ─── Strategies (collection) ───────────────────────────────────────────────
	{
		method: 'get' as const,
		path: '/v1/strategies',
		alias: 'listStrategies',
		description: 'Paginated list of strategies.',
		response: PagedStrategyResultSchema,
		parameters: [
			{ name: 'offset', type: 'Query' as const, schema: z.number().int().optional() },
			{ name: 'limit', type: 'Query' as const, schema: z.number().int().optional() },
			{ name: 'status', type: 'Query' as const, schema: z.string().optional() }
		]
	},
	{
		method: 'post' as const,
		path: '/v1/strategies',
		alias: 'upsertStrategy',
		description: 'Create or replace a strategy.',
		response: StrategyResultSchema,
		parameters: [
			{ name: 'body', type: 'Body' as const, schema: StrategyServiceUpsertRequestBodySchema }
		]
	},

	// ─── Strategies (model) ────────────────────────────────────────────────────
	{
		method: 'get' as const,
		path: '/v1/strategies/:id',
		alias: 'getStrategy',
		description: 'Retrieve a strategy by UUID.',
		response: StrategyResultSchema,
		parameters: [{ name: 'id', type: 'Path' as const, schema: z.string().uuid() }]
	},
	{
		method: 'put' as const,
		path: '/v1/strategies/:id',
		alias: 'replaceStrategy',
		description: 'Full replacement of a strategy.',
		response: StrategyResultSchema,
		parameters: [
			{ name: 'id', type: 'Path' as const, schema: z.string().uuid() },
			{ name: 'body', type: 'Body' as const, schema: StrategyServiceReplaceRequestBodySchema }
		]
	},
	{
		method: 'delete' as const,
		path: '/v1/strategies/:id',
		alias: 'deleteStrategy',
		description: 'Archive a strategy.',
		response: z.void(),
		parameters: [{ name: 'id', type: 'Path' as const, schema: z.string().uuid() }]
	},
	{
		method: 'patch' as const,
		path: '/v1/strategies/:id',
		alias: 'patchStrategy',
		description: 'Partial update of a strategy.',
		response: StrategyResultSchema,
		parameters: [
			{ name: 'id', type: 'Path' as const, schema: z.string().uuid() },
			{ name: 'body', type: 'Body' as const, schema: StrategyServicePatchRequestBodySchema }
		]
	},

	// ─── Backtest Runs (collection) ────────────────────────────────────────────
	{
		method: 'get' as const,
		path: '/v1/backtest-runs',
		alias: 'listBacktestRuns',
		description: 'Paginated list of backtest runs.',
		response: PagedBacktestRunResultSchema,
		parameters: [
			{ name: 'status', type: 'Query' as const, schema: z.string().optional() },
			{ name: 'offset', type: 'Query' as const, schema: z.number().int().optional() },
			{ name: 'limit', type: 'Query' as const, schema: z.number().int().optional() }
		]
	},
	{
		method: 'post' as const,
		path: '/v1/backtest-runs',
		alias: 'createBacktestRun',
		description: 'Create a new backtest run.',
		response: BacktestRunResultSchema,
		parameters: [
			{
				name: 'body',
				type: 'Body' as const,
				schema: BacktestRunServiceCreateRequestBodySchema
			}
		]
	},

	// ─── Backtest Runs (model) ─────────────────────────────────────────────────
	{
		method: 'get' as const,
		path: '/v1/backtest-runs/:run_id',
		alias: 'getBacktestRun',
		description: 'Retrieve a backtest run by UUID.',
		response: BacktestRunResultSchema,
		parameters: [{ name: 'run_id', type: 'Path' as const, schema: z.string().uuid() }]
	},
	{
		method: 'delete' as const,
		path: '/v1/backtest-runs/:run_id',
		alias: 'deleteBacktestRun',
		description: 'Archive a backtest run.',
		response: z.void(),
		parameters: [{ name: 'run_id', type: 'Path' as const, schema: z.string().uuid() }]
	},

	// ─── Backtest Run actions ──────────────────────────────────────────────────
	{
		method: 'post' as const,
		path: '/v1/backtest-runs/:run_id/run',
		alias: 'triggerBacktestRun',
		description: 'Trigger execution of a backtest run.',
		response: ActionResponseSchema,
		parameters: [{ name: 'run_id', type: 'Path' as const, schema: z.string().uuid() }]
	},
	{
		method: 'post' as const,
		path: '/v1/backtest-runs/:run_id/cancel',
		alias: 'cancelBacktestRun',
		description: 'Cancel a running backtest run.',
		response: ActionResponseSchema,
		parameters: [{ name: 'run_id', type: 'Path' as const, schema: z.string().uuid() }]
	},

	// ─── Backtest Results ──────────────────────────────────────────────────────
	{
		method: 'get' as const,
		path: '/v1/backtest-runs/:run_id/results',
		alias: 'listBacktestResults',
		description: 'Paginated list of results for a backtest run.',
		response: PagedBacktestResultResourceSchema,
		parameters: [
			{ name: 'run_id', type: 'Path' as const, schema: z.string().uuid() },
			{ name: 'offset', type: 'Query' as const, schema: z.number().int().optional() },
			{ name: 'limit', type: 'Query' as const, schema: z.number().int().optional() }
		]
	},
	{
		method: 'get' as const,
		path: '/v1/backtest-runs/:run_id/results/:result_id',
		alias: 'getBacktestResult',
		description: 'Retrieve a single backtest result by UUID.',
		response: BacktestResultResourceSchema,
		parameters: [
			{ name: 'run_id', type: 'Path' as const, schema: z.string().uuid() },
			{ name: 'result_id', type: 'Path' as const, schema: z.string().uuid() }
		]
	}
] as const;

// ── Singleton client ───────────────────────────────────────────────────────────

/**
 * Base URL for backtest-eapi. Reads from PUBLIC_BACKTEST_EAPI_URL at module
 * initialisation time; falls back to localhost:8080 for local development.
 */
const baseUrl: string =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_BACKTEST_EAPI_URL) ||
	'http://localhost:8080';

/**
 * Singleton Zodios client for backtest-eapi.
 *
 * Use the typed aliases for type-safe calls:
 * ```ts
 * const health = await apiClient.healthz();
 * const strategies = await apiClient.listStrategies({ queries: { limit: 20 } });
 * const strategy = await apiClient.getStrategy({ params: { id: '...' } });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiClient: any = new (ZodiosCore as any)(baseUrl, backtestEapiEndpoints);

export type { NativeFetchProvider };
export { backtestEapiEndpoints };
