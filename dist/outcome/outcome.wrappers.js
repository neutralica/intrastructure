// outcome.wrappers.ts
import { enrichOutcome } from "../error-report/error-report.js";
import { outcomeIs } from "./outcome.infra.js";
import { NO_VAL } from "./outcome.types.js";
export function r_$(outcome, msg) {
    // this (below return type) WAS Promise<T>; now it's T. Either seems to work fine. Seems bad!
    const handler = (resolved) => {
        if (!validateOutcome(resolved))
            throw outcomeIs.ERR(`r_$ received non-Outcome value`);
        const enriched = enrichOutcome(resolved);
        if (outcomeIs.failErr(enriched))
            throw enriched;
        if (outcomeIs.successOnly(enriched))
            throw outcomeIs.ERR('successful Outcome with no data');
        return enriched.data;
    };
    return handler(outcome);
}
export function wrap_void(outcome, msg) {
    const handler = (unknownOutcome) => {
        if (!validateOutcome(unknownOutcome)) {
            throw outcomeIs.ERR(`r_$ received non-Outcome value`);
        }
        const enriched = enrichOutcome(unknownOutcome);
        if (outcomeIs.dataOutcome(enriched)) {
            throw outcomeIs.ERR('$Outcome<vøid> error: data not expected in Outcome<void>');
        }
        if (outcomeIs.failErr(enriched)) {
            throw enriched;
        }
        return {
            success: true,
            data: NO_VAL,
            __only: true,
        };
    };
    if (outcome instanceof Promise) {
        return outcome.then(resolved => handler(resolved));
    }
    else {
        return handler(outcome);
    }
}
function validateOutcome(x) {
    return (typeof x === 'object' &&
        x !== null &&
        'success' in x &&
        x.success === true || x.success === false);
}
//# sourceMappingURL=outcome.wrappers.js.map