/**
 * Async Channel Stub — forward-compatibility placeholder for future API integration.
 *
 * BACKGROUND (see specs/009-fix-ui-runtime-errors/plan.md — Bug 2):
 * During development the browser console shows:
 *   "A listener indicated an asynchronous response by returning true, but the message
 *    channel closed before a response was received"
 * This error originates from a Chrome browser extension (runtime-*.js), NOT from
 * application code. The application currently contains no chrome.runtime API calls.
 *
 * FUTURE INTEGRATION:
 * When this app integrates with a Chrome extension or service worker for async market-data
 * API calls, replace this stub with a real implementation that:
 *   1. Calls chrome.runtime.sendMessage(request, sendResponse)
 *   2. Always calls sendResponse (or returns false) — never returns true without calling it
 *   3. Handles the case where the channel closes before the response arrives (e.g., wrap
 *      in try/catch and resolve with an error result rather than leaving the promise pending)
 *
 * Example real implementation:
 *   export const asyncChannelRequest: AsyncChannelRequest = (payload) =>
 *     new Promise((resolve, reject) => {
 *       try {
 *         chrome.runtime.sendMessage(payload, (response) => {
 *           if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
 *           else resolve(response);
 *         });
 *       } catch (err) {
 *         // Channel closed before response — handle gracefully
 *         reject(err);
 *       }
 *     });
 *
 * This file is NOT exported from the barrel index intentionally — it is a documentation
 * stub. Import directly if needed during integration work.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ASYNC PATTERN REFERENCE (for API migration — see specs/019-fix-browser-extension-error)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This app uses MIXED async patterns across organisms (FR-008). Use the correct
 * pattern for each organism type to avoid leaving message channels unclosed:
 *
 * PATTERN A — Fetch-on-mount with AbortController (most organisms):
 *   Use when: data is fetched automatically when a component mounts.
 *   Svelte 5 example:
 *
 *   let data = $state<DataType | null>(null);
 *   $effect(() => {
 *     const controller = new AbortController();
 *     fetchData({ signal: controller.signal })
 *       .then((result) => { data = result; })
 *       .catch((err) => { if (err.name !== 'AbortError') console.error(err); });
 *     return () => controller.abort();  // cleanup on unmount
 *   });
 *
 *   Key rule: always return the cleanup function from $effect. The AbortError
 *   thrown on abort MUST be caught and silenced — it is not a real error.
 *
 * PATTERN B — Event-driven listener deregistration (some organisms):
 *   Use when: data is fetched in response to user actions (e.g., button click).
 *   Svelte 5 example:
 *
 *   $effect(() => {
 *     const handler = (event: CustomEvent) => { ... };
 *     window.addEventListener('market-data-update', handler);
 *     return () => window.removeEventListener('market-data-update', handler);
 *   });
 *
 *   Key rule: every addEventListener MUST have a corresponding removeEventListener
 *   in the $effect cleanup. Failure to deregister is the most common cause of
 *   the "message channel closed" error pattern in component-level code.
 */

export type AsyncChannelPayload = Record<string, unknown>;

export type AsyncChannelRequest = (payload?: AsyncChannelPayload) => Promise<void>;

/**
 * No-op stub. Replace with real chrome.runtime.sendMessage implementation
 * when async API integration begins.
 */
export const asyncChannelRequest: AsyncChannelRequest = () => Promise.resolve();
