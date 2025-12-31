// outcome.ts
import { ErrSeverity, ErrSource } from "../error-report/err-consts/err-consts.js";
import ErrReport from "../error-report/error-report.js";
import {} from "../error-report/err-report.types.js";
import { NO_VAL } from "./outcome.types.js";
// CHANGE: helper type-guards so ERR() doesn't accidentally treat an Outcome as ErrData
function isErrData(x) {
    return (typeof x === "object" &&
        x !== null &&
        // CHANGE: ErrData must NOT have Outcome sentinel fields
        !("success" in x) &&
        !("__fail" in x) &&
        !("__only" in x));
}
export const outcomeIs = {
    OK: (data) => {
        // unchanged
        if (data === undefined) {
            return { success: true, data: NO_VAL, __only: true };
        }
        return { success: true, data };
    },
    ERR: (message, existingErr) => {
        const messagePlusERR = `${message}\n`;
        // CHANGE: pick a base report safely
        let base;
        if (existingErr && outcomeIs.failErr(existingErr)) {
            // CHANGE: existing failure Outcome -> reuse its ErrReport
            base = existingErr.err;
            // CHANGE: add message ONLY when we’re enriching an existing report
            base = base.addMessage(messagePlusERR);
        }
        else if (existingErr instanceof ErrReport) {
            // CHANGE: direct ErrReport -> enrich it
            base = existingErr.addMessage(messagePlusERR);
        }
        else {
            // CHANGE: only merge if it's actually ErrData (not a success Outcome)
            const partial = isErrData(existingErr) ? existingErr : {};
            // CHANGE: create already includes the message; do NOT addMessage again
            base = ErrReport.create({
                ...partial,
                message: messagePlusERR,
                module: typeof partial.module === "string" ? partial.module : "unknown",
                source: partial.source ?? ErrSource.SYSTEM,
                severity: partial.severity ?? ErrSeverity.MED,
            });
        }
        return {
            success: false,
            err: base,
            __fail: true,
        };
    },
    // CHANGE: tighten the guards
    withData: (outcome) => outcome.success === true &&
        outcome.data !== NO_VAL &&
        outcome.data !== undefined,
    successOnly: (outcome) => typeof outcome === "object" &&
        outcome !== null &&
        "success" in outcome &&
        outcome.success === true &&
        "__only" in outcome &&
        outcome.__only === true &&
        "data" in outcome &&
        outcome.data === NO_VAL,
    failErr: (outcome) => typeof outcome === "object" &&
        outcome !== null &&
        "success" in outcome &&
        outcome.success === false &&
        "__fail" in outcome &&
        outcome.__fail === true &&
        "err" in outcome,
};
//# sourceMappingURL=outcome.js.map