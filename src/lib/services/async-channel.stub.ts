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
 */

export type AsyncChannelPayload = Record<string, unknown>;

export type AsyncChannelRequest = (payload?: AsyncChannelPayload) => Promise<void>;

/**
 * No-op stub. Replace with real chrome.runtime.sendMessage implementation
 * when async API integration begins.
 */
export const asyncChannelRequest: AsyncChannelRequest = () => Promise.resolve();
