// relai.ts  (drop-in replacement)
// CHANGE: keep this import if ErrReport is a class (used by instanceof checks)
import ErrReport from "../error-report/error-report.js";
import { ErrSeverity, ErrSource } from "../error-report/err-consts/err-consts.js";
import { NO_VAL } from "./outcome.types.js";
/**
 * CHANGE: stronger "is ErrData" guard:
 * - rejects arrays
 * - rejects ErrReport instances
 * - rejects Outcome-shaped objects (sentinel fields)
 * - does NOT try to validate full ErrData shape (ErrReport.create handles that)
 */
function isErrData(x) {
    if (typeof x !== "object" || x === null)
        return false;
    if (Array.isArray(x))
        return false;
    if (x instanceof ErrReport)
        return false;
    // ErrData must NOT have Outcome sentinel fields
    if ("success" in x)
        return false;
    if ("__fail" in x)
        return false;
    if ("__only" in x)
        return false;
    return true;
}
export const relai = {
    // ========= constructors =========
    ok: (data) => {
        if (data === undefined) {
            return { success: true, data: NO_VAL, __only: true };
        }
        return { success: true, data };
    },
    err: (message, existingErr) => {
        const messagePlusERR = `${message}\n`;
        let base;
        if (existingErr && relai.failErr(existingErr)) {
            // CHANGE: existing failure Outcome -> reuse its ErrReport and enrich
            base = existingErr.err.addMessage(messagePlusERR);
        }
        else if (existingErr instanceof ErrReport) {
            // CHANGE: direct ErrReport -> enrich it
            base = existingErr.addMessage(messagePlusERR);
        }
        else {
            // CHANGE: only merge if it's actually ErrData (not some random object)
            const partial = isErrData(existingErr) ? existingErr : {};
            // CHANGE: create includes the message; do NOT addMessage again
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
    // ========= type guards =========
    data: (outcome) => outcome.success === true &&
        outcome.data !== NO_VAL &&
        outcome.data !== undefined,
    successOnly: (outcome) => typeof outcome === "object" &&
        outcome !== null &&
        outcome.success === true &&
        outcome.__only === true &&
        outcome.data === NO_VAL,
    failErr: (outcome) => typeof outcome === "object" &&
        outcome !== null &&
        outcome.success === false &&
        outcome.__fail === true &&
        outcome.err instanceof ErrReport,
};
//# sourceMappingURL=relai.js.map