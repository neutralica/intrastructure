// outcome.wrappers.ts

import { enrichOutcome } from "../error-report/error-report.js";
import { outcomeIs } from "./outcome.infra.js";
import { NO_VAL, type Outcome, type OutcomeAsync, type OutcomeSuccessOnly } from "./outcome.types.js";



export function r_$<T>(outcome: Outcome<T>, msg?: string): T {
    // this (below return type) WAS Promise<T>; now it's T. Either seems to work fine. Seems bad!
    const handler = (resolved: Outcome<unknown>): T => {
        if (!validateOutcome(resolved)) throw outcomeIs.ERR(`r_$ received non-Outcome value`);
        const enriched = enrichOutcome(resolved);
        if (outcomeIs.failErr(enriched)) throw enriched;
        if (outcomeIs.successOnly(enriched)) throw outcomeIs.ERR('successful Outcome with no data');
        return enriched.data as T;

    };
    return handler(outcome);

}


export function wrap_void(outcome: Outcome<void>, msg?: string): OutcomeSuccessOnly;
export function wrap_void(outcome: OutcomeAsync<void>, msg?: string): Promise<OutcomeSuccessOnly>;
export function wrap_void(outcome: Outcome<void> | OutcomeAsync<void>, msg?: string):
    OutcomeSuccessOnly | Promise<OutcomeSuccessOnly> {
    const handler = (unknownOutcome: Outcome<unknown>): OutcomeSuccessOnly => {
        if (!validateOutcome(unknownOutcome)) {
            throw outcomeIs.ERR(`r_$ received non-Outcome value`);
        }
        const enriched = enrichOutcome(unknownOutcome);
        if (outcomeIs.dataOutcome(enriched)) { throw outcomeIs.ERR('$Outcome<vøid> error: data not expected in Outcome<void>'); }
        if (outcomeIs.failErr(enriched)) { throw enriched; }
        return {
            success: true,
            data: NO_VAL,
            __only: true,
        } as const;
    };
    if (outcome instanceof Promise) {
        return outcome.then(resolved => handler(resolved));
    } else {
        return handler(outcome);
    }
}
function validateOutcome<T>(x: unknown): x is Outcome<T> {
    return (
        typeof x === 'object' &&
        x !== null &&
        'success' in x &&
        (x as any).success === true || (x as any).success === false
    );
}
