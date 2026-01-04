// net-requests
import { NetRetryΔ } from "./net-request.types.js";
export const NetFailureDefault = {
    retries: 1,
    retryDelayMs: 100,
    timeoutMs: 2000,
    strategy: NetRetryΔ.none,
};
export const RetryPresetΔ = {
    DEFAULT: NetFailureDefault,
}; // Added this type, may be misguided but as const wasn't helping
//# sourceMappingURL=net-request.consts.js.map