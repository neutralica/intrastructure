// outcome.wrappers.ts

import { enrichOutcome } from "../error-report/error-report.js";
import { outcomeIs } from "./outcome.js";
import { NO_VAL, type Outcome, type OutcomeAsync, type OutcomeSuccessOnly } from "./outcome.types.js";


export function wrap_data<T>(outcome: Outcome<T>, msg?: string): T;
export function wrap_data<T>(outcome: OutcomeAsync<T>, msg?: string): Promise<T>;
export function wrap_data<T>(
    outcome: Outcome<T> | OutcomeAsync<T>,
    msg?: string
): T | Promise<T> {
    const handler = (resolved: Outcome<unknown>): T => {
        // CHANGE: message / naming
        if (!validateOutcome(resolved)) throw outcomeIs.ERR(`wrap_data received non-Outcome value`);

        const enriched = enrichOutcome(resolved);

        if (outcomeIs.failErr(enriched)) throw enriched;

        if (outcomeIs.successOnly(enriched)) {
            throw outcomeIs.ERR(msg ?? "successful Outcome with no data");
        }

        return enriched.data as T;
    };

    if (outcome instanceof Promise) {
        return outcome.then(resolved => handler(resolved));
    }
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
        if (outcomeIs.withData(enriched)) { throw outcomeIs.ERR('$Outcome<vøid> error: data not expected in Outcome<void>'); }
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

export function validateOutcome<T>(x: unknown): x is Outcome<T> {
    return (
        typeof x === "object" &&
        x !== null &&
        "success" in x &&
        (((x as any).success === true) || ((x as any).success === false))
    );
}