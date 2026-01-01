// outcome.wrappers.ts
import { enrichOutcome } from "../error-report/error-report.js";
import { relai } from "./relai.js";
import { NO_VAL } from "./outcome.types.js";
export function wrap_data(outcome, msg) {
    const handler = (resolved) => {
        // CHANGE: message / naming
        if (!validateOutcome(resolved))
            throw relai.err(`wrap_data received non-Outcome value`);
        const enriched = enrichOutcome(resolved);
        if (relai.failErr(enriched))
            throw enriched;
        if (relai.successOnly(enriched)) {
            throw relai.err(msg ?? "successful Outcome with no data");
        }
        return enriched.data;
    };
    if (outcome instanceof Promise) {
        return outcome.then(resolved => handler(resolved));
    }
    return handler(outcome);
}
export function wrap_void(outcome, msg) {
    const handler = (unknownOutcome) => {
        if (!validateOutcome(unknownOutcome)) {
            throw relai.err(`r_$ received non-Outcome value`);
        }
        const enriched = enrichOutcome(unknownOutcome);
        if (relai.data(enriched)) {
            throw relai.err('$Outcome<vøid> error: data not expected in Outcome<void>');
        }
        if (relai.failErr(enriched)) {
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
export function validateOutcome(x) {
    return (typeof x === "object" &&
        x !== null &&
        "success" in x &&
        ((x.success === true) || (x.success === false)));
}
//# sourceMappingURL=relai.wrappers.js.map