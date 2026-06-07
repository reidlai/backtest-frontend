/**
 * Zodios endpoint contract for backtest-eapi.
 *
 * This file is the DESIGN REFERENCE for src/lib/zodios/client.ts.
 * It is not executed directly — it documents the intended Zodios endpoint array
 * and serves as the contract that implementation tasks must match.
 *
 * Source: /Users/reidlai/GitLocal/backtest-eapi/gen/http/openapi.yaml
 * Feature: 021-zodios-api-client
 */

import { z } from "zod";
import {
  // Response schemas
  ActionResponseSchema,
  BacktestResultResourceSchema,
  BacktestRunResultSchema,
  HealthResponseSchema,
  PagedBacktestResultResourceSchema,
  PagedBacktestRunResultSchema,
  PagedStrategyResultSchema,
  StrategyResultSchema,
  // Request body schemas
  BacktestRunServiceCreateRequestBodySchema,
  StrategyServiceUpsertRequestBodySchema,
  StrategyServiceReplaceRequestBodySchema,
  StrategyServicePatchRequestBodySchema,
} from "$lib/zodios/index";

/** All 15 backtest-eapi endpoints */
export const backtestEapiEndpoints = [
  // ─── Health ───────────────────────────────────────────────────────────────
  {
    method: "get",
    path: "/health",
    alias: "healthz",
    description: "Liveness check. Returns 200 OK regardless of JWT token.",
    response: HealthResponseSchema,
  },

  // ─── Strategies (collection) ───────────────────────────────────────────────
  {
    method: "get",
    path: "/v1/strategies",
    alias: "listStrategies",
    description: "Paginated list of strategies.",
    response: PagedStrategyResultSchema,
    parameters: [
      { name: "offset", type: "Query", schema: z.number().int().optional() },
      { name: "limit",  type: "Query", schema: z.number().int().optional() },
      { name: "status", type: "Query", schema: z.string().optional() },
    ],
  },
  {
    method: "post",
    path: "/v1/strategies",
    alias: "upsertStrategy",
    description: "Create a new strategy (upsert — server determines create vs replace by name).",
    response: StrategyResultSchema,
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StrategyServiceUpsertRequestBodySchema,
      },
    ],
  },

  // ─── Strategies (model) ────────────────────────────────────────────────────
  {
    method: "get",
    path: "/v1/strategies/:id",
    alias: "getStrategy",
    description: "Retrieve a single strategy by UUID.",
    response: StrategyResultSchema,
    parameters: [
      { name: "id", type: "Path", schema: z.string().uuid() },
    ],
  },
  {
    method: "put",
    path: "/v1/strategies/:id",
    alias: "replaceStrategy",
    description: "Full replacement of an existing strategy.",
    response: StrategyResultSchema,
    parameters: [
      { name: "id", type: "Path", schema: z.string().uuid() },
      {
        name: "body",
        type: "Body",
        schema: StrategyServiceReplaceRequestBodySchema,
      },
    ],
  },
  {
    method: "delete",
    path: "/v1/strategies/:id",
    alias: "deleteStrategy",
    description: "Soft-delete (archive) a strategy.",
    response: z.void(),
    parameters: [
      { name: "id", type: "Path", schema: z.string().uuid() },
    ],
  },
  {
    method: "patch",
    path: "/v1/strategies/:id",
    alias: "patchStrategy",
    description: "Partial update of a strategy.",
    response: StrategyResultSchema,
    parameters: [
      { name: "id", type: "Path", schema: z.string().uuid() },
      {
        name: "body",
        type: "Body",
        schema: StrategyServicePatchRequestBodySchema,
      },
    ],
  },

  // ─── Backtest Runs (collection) ────────────────────────────────────────────
  {
    method: "get",
    path: "/v1/backtest-runs",
    alias: "listBacktestRuns",
    description: "Paginated list of backtest runs.",
    response: PagedBacktestRunResultSchema,
    parameters: [
      { name: "status", type: "Query", schema: z.string().optional() },
      { name: "offset", type: "Query", schema: z.number().int().optional() },
      { name: "limit",  type: "Query", schema: z.number().int().optional() },
    ],
  },
  {
    method: "post",
    path: "/v1/backtest-runs",
    alias: "createBacktestRun",
    description: "Create a new backtest run. strategy_ids must be non-empty.",
    response: BacktestRunResultSchema,
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BacktestRunServiceCreateRequestBodySchema,
      },
    ],
  },

  // ─── Backtest Runs (model) ─────────────────────────────────────────────────
  {
    method: "get",
    path: "/v1/backtest-runs/:run_id",
    alias: "getBacktestRun",
    description: "Retrieve a single backtest run by UUID.",
    response: BacktestRunResultSchema,
    parameters: [
      { name: "run_id", type: "Path", schema: z.string().uuid() },
    ],
  },
  {
    method: "delete",
    path: "/v1/backtest-runs/:run_id",
    alias: "deleteBacktestRun",
    description: "Archive a backtest run.",
    response: z.void(),
    parameters: [
      { name: "run_id", type: "Path", schema: z.string().uuid() },
    ],
  },

  // ─── Backtest Run actions ──────────────────────────────────────────────────
  {
    method: "post",
    path: "/v1/backtest-runs/:run_id/run",
    alias: "triggerBacktestRun",
    description: "Trigger execution of a pending backtest run.",
    response: ActionResponseSchema,
    parameters: [
      { name: "run_id", type: "Path", schema: z.string().uuid() },
    ],
  },
  {
    method: "post",
    path: "/v1/backtest-runs/:run_id/cancel",
    alias: "cancelBacktestRun",
    description: "Cancel a running backtest run.",
    response: ActionResponseSchema,
    parameters: [
      { name: "run_id", type: "Path", schema: z.string().uuid() },
    ],
  },

  // ─── Backtest Results (collection + model) ─────────────────────────────────
  {
    method: "get",
    path: "/v1/backtest-runs/:run_id/results",
    alias: "listBacktestResults",
    description: "Paginated list of results for a backtest run.",
    response: PagedBacktestResultResourceSchema,
    parameters: [
      { name: "run_id", type: "Path", schema: z.string().uuid() },
      { name: "offset", type: "Query", schema: z.number().int().optional() },
      { name: "limit",  type: "Query", schema: z.number().int().optional() },
    ],
  },
  {
    method: "get",
    path: "/v1/backtest-runs/:run_id/results/:result_id",
    alias: "getBacktestResult",
    description: "Retrieve a single backtest result by UUID.",
    response: BacktestResultResourceSchema,
    parameters: [
      { name: "run_id",    type: "Path", schema: z.string().uuid() },
      { name: "result_id", type: "Path", schema: z.string().uuid() },
    ],
  },
] as const;
