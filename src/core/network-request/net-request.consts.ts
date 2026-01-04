// net-requests

import { NetRetryΔ, type FailRecoveryMode } from "./net-request.types.js";


export const NetFailureDefault: FailRecoveryMode = {
    retries: 1,
    retryDelayMs: 100,
    timeoutMs: 2000,
    strategy: NetRetryΔ.none,
}


export const RetryPresetΔ: { [key: string]: FailRecoveryMode } = {
    DEFAULT: NetFailureDefault,
} as Record<string, FailRecoveryMode>; // Added this type, may be misguided but as const wasn't helping

