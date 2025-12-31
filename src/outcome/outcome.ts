
// outcome.ts

import { ErrSeverity, ErrSource } from "../error-report/err-consts/err-consts.js";
import ErrReport from "../error-report/error-report.js";
import { type ErrData } from "../error-report/err-report.types.js";
import { NO_VAL, type NoValue, type OutcomeDataSuccess, type Outcome, type OutcomeFailErr, type OutcomeSuccessOnly } from "./outcome.types.js";
// CHANGE: helper type-guards so ERR() doesn't accidentally treat an Outcome as ErrData
function isErrData(x: unknown): x is ErrData {
    return (
        typeof x === "object" &&
        x !== null &&
        // CHANGE: ErrData must NOT have Outcome sentinel fields
        !("success" in x) &&
        !("__fail" in x) &&
        !("__only" in x)
    );
}

export const outcomeIs = {
    OK: <T>(data?: Exclude<T, NoValue>): Outcome<T> => {
        // unchanged
        if (data === undefined) {
            return { success: true, data: NO_VAL, __only: true } as OutcomeSuccessOnly;
        }
        return { success: true, data } as OutcomeDataSuccess<T>;
    },

    ERR: (
        message: string,
        existingErr?: Outcome<never> | ErrData | ErrReport
    ): OutcomeFailErr => {
        const messagePlusERR = `${message}\n`;

        // CHANGE: pick a base report safely
        let base: ErrReport;

        if (existingErr && outcomeIs.failErr(existingErr)) {
            // CHANGE: existing failure Outcome -> reuse its ErrReport
            base = existingErr.err;

            // CHANGE: add message ONLY when we’re enriching an existing report
            base = base.addMessage(messagePlusERR);

        } else if (existingErr instanceof ErrReport) {
            // CHANGE: direct ErrReport -> enrich it
            base = existingErr.addMessage(messagePlusERR);

        } else {
            // CHANGE: only merge if it's actually ErrData (not a success Outcome)
            const partial: Partial<ErrData> = isErrData(existingErr) ? existingErr : {};

            // CHANGE: create already includes the message; do NOT addMessage again
            base = ErrReport.create({
                ...partial,
                message: messagePlusERR,
                module: typeof partial.module === "string" ? partial.module : "unknown",
                source: partial.source ?? ErrSource.SYSTEM,
                severity: partial.severity ?? ErrSeverity.MED,
            } as ErrData);
        }

        return {
            success: false,
            err: base,
            __fail: true,
        } as const;
    },

    // CHANGE: tighten the guards

    withData: <T>(outcome: Outcome<T>): outcome is OutcomeDataSuccess<T> =>
        outcome.success === true &&
        outcome.data !== NO_VAL &&
        outcome.data !== undefined,

    successOnly: (outcome: unknown): outcome is OutcomeSuccessOnly =>
        typeof outcome === "object" &&
        outcome !== null &&
        "success" in outcome &&
        (outcome as any).success === true &&
        "__only" in outcome &&
        (outcome as any).__only === true &&
        "data" in outcome &&
        (outcome as any).data === NO_VAL,

    failErr: (outcome: unknown): outcome is OutcomeFailErr =>
        typeof outcome === "object" &&
        outcome !== null &&
        "success" in outcome &&
        (outcome as any).success === false &&
        "__fail" in outcome &&
        (outcome as any).__fail === true &&
        "err" in outcome,
};