// Cucumber step definitions for features/cloud-run-deployment.feature
// Requires: pnpm add -D @cucumber/cucumber
// Run with: CLOUD_RUN_URL=https://... pnpm cucumber-js features/cloud-run-deployment.feature

import { Given, When, Then, Before } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

interface CloudRunWorld {
  serviceUrl: string;
  response?: { status: number; contentType: string; body: string };
  tofuOutput?: string;
  tofuPlanOutput?: string;
  revisionName?: string;
  trafficAllocations?: Array<{ revision: string; percent: number }>;
}

declare module "@cucumber/cucumber" {
  interface World extends CloudRunWorld {}
}

// ── Background ────────────────────────────────────────────────────────────────

Given(
  "the environment variable {string} is set to the Cloud Run service URL",
  function (this: CloudRunWorld, envVar: string) {
    const url = process.env[envVar];
    assert.ok(
      url,
      `Environment variable ${envVar} must be set to the Cloud Run service URL`
    );
    this.serviceUrl = url;
  }
);

// ── @smoke: Service accessibility ────────────────────────────────────────────

Given(
  "the Cloud Run service has been deployed with OpenTofu",
  function (this: CloudRunWorld) {
    assert.ok(
      this.serviceUrl,
      "Service URL must be set via CLOUD_RUN_URL environment variable"
    );
  }
);

When(
  "I send a GET request to the service URL",
  async function (this: CloudRunWorld) {
    const res = await fetch(this.serviceUrl);
    const body = await res.text();
    this.response = {
      status: res.status,
      contentType: res.headers.get("content-type") ?? "",
      body,
    };
  }
);

Then(
  "the response status code should be {int}",
  function (this: CloudRunWorld, expectedStatus: number) {
    assert.strictEqual(
      this.response!.status,
      expectedStatus,
      `Expected HTTP ${expectedStatus} but got ${this.response!.status}`
    );
  }
);

Then(
  "the response Content-Type should contain {string}",
  function (this: CloudRunWorld, expectedType: string) {
    assert.ok(
      this.response!.contentType.includes(expectedType),
      `Expected Content-Type to contain "${expectedType}" but got "${this.response!.contentType}"`
    );
  }
);

Then(
  "the response body should contain {string}",
  function (this: CloudRunWorld, expectedText: string) {
    assert.ok(
      this.response!.body.includes(expectedText),
      `Expected response body to contain "${expectedText}"`
    );
  }
);

// ── @integration: OpenTofu output and idempotency (T020, T022) ───────────────

Given(
  "the OpenTofu configuration has been applied",
  function (this: CloudRunWorld) {
    assert.ok(
      this.serviceUrl,
      "Service URL must be set — implies OpenTofu has been applied"
    );
  }
);

When(
  "I run {string}",
  async function (this: CloudRunWorld, command: string) {
    const cwd = "deploy/gcp/terraform";
    if (command.startsWith("tofu output")) {
      const { stdout } = await execAsync(command, { cwd });
      this.tofuOutput = stdout.trim();
    } else if (command === "tofu plan") {
      const { stdout } = await execAsync(
        "tofu plan -detailed-exitcode 2>&1 || true",
        { cwd }
      );
      this.tofuPlanOutput = stdout;
    }
  }
);

Then(
  "the output should be a valid HTTPS URL",
  function (this: CloudRunWorld) {
    const url = this.tofuOutput?.replace(/^"|"$/g, "");
    assert.ok(
      url?.startsWith("https://"),
      `Expected a valid HTTPS URL but got: ${url}`
    );
  }
);

Then(
  "the plan should report zero changes",
  function (this: CloudRunWorld) {
    const plan = this.tofuPlanOutput ?? "";
    const noChanges =
      plan.includes("No changes") ||
      plan.includes("0 to add, 0 to change, 0 to destroy");
    assert.ok(
      noChanges,
      `Expected tofu plan to report zero changes.\nPlan output:\n${plan}`
    );
  }
);

// ── @integration: Health-check rollback (T021) ────────────────────────────────

Given(
  "a new revision has been deployed that fails health checks",
  async function (this: CloudRunWorld) {
    // Retrieve the current active revision name before the failed deploy.
    // In a real test environment, this step would deploy a bad image tag and
    // capture the resulting revision name so the Then step can assert traffic
    // has NOT shifted to it. Here we read the currently-serving revision as a
    // baseline — the caller is expected to set CLOUD_RUN_REVISION_FAILED env
    // var to the name of the revision that failed startup.
    const failedRevision = process.env["CLOUD_RUN_REVISION_FAILED"];
    assert.ok(
      failedRevision,
      "CLOUD_RUN_REVISION_FAILED must be set to the name of the revision that failed health checks"
    );
    this.revisionName = failedRevision;
  }
);

When(
  "I inspect the Cloud Run service traffic allocation",
  async function (this: CloudRunWorld) {
    const project = process.env["GCLOUD_PROJECT"];
    const region = process.env["CLOUD_RUN_REGION"] ?? "us-central1";
    const service = process.env["CLOUD_RUN_SERVICE"] ?? "backtest-frontend";
    assert.ok(project, "GCLOUD_PROJECT must be set");

    const { stdout } = await execAsync(
      `gcloud run services describe ${service} --region=${region} --project=${project} --format="json(status.traffic)"`,
      { cwd: "." }
    );
    const parsed = JSON.parse(stdout);
    this.trafficAllocations = (parsed?.status?.traffic ?? []).map(
      (t: { revisionName: string; percent: number }) => ({
        revision: t.revisionName,
        percent: t.percent,
      })
    );
  }
);

Then(
  "traffic should remain routed to the previously healthy revision",
  function (this: CloudRunWorld) {
    const failedRevision = this.revisionName!;
    const failedAllocation = this.trafficAllocations?.find(
      (t) => t.revision === failedRevision
    );
    const failedPercent = failedAllocation?.percent ?? 0;
    assert.strictEqual(
      failedPercent,
      0,
      `Expected failed revision "${failedRevision}" to receive 0% traffic but got ${failedPercent}%`
    );
  }
);
