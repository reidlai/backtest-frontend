import { env } from '$env/dynamic/public';

/**
 * True when PUBLIC_USE_MOCK_DATA=true — organisms read from shared-mockdata.
 * False (default) — RxJS streams fetch from the real backend API.
 */
export const useMockData: boolean = env.PUBLIC_USE_MOCK_DATA === 'true';
