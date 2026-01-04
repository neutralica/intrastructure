// relay.ts
import ErrReport from "../error-report/error-report.js";
import { ErrSeverity, ErrSource } from "../error-report/err-consts/err-consts.js";
import { NO_VAL } from "./outcome.types.js";
import { format_err } from "../helpers/format-err.js"; // returns string (as you described)
function isObject(x) {
    return typeof x === "object" && x !== null;
}
function isErrData(x) {
    return (isObject(x) &&
        !Array.isArray(x) &&
        !(x instanceof ErrReport) &&
        !("success" in x) &&
        !("__fail" in x) &&
        !("__only" in x));
}
/**
 * CHANGE: internal coercion — callers pass unknown, relay decides.
 */
function coerce_report(cause) {
    if (cause instanceof ErrReport)
        return cause;
    if (cause instanceof Error) {
        return ErrReport.create({
            message: cause.message,
            source: ErrSource.SYSTEM,
            severity: ErrSeverity.MED,
            stack: cause.stack ?? "",
            timestamp: new Date().toISOString(),
        });
    }
    if (isErrData(cause)) {
        return ErrReport.create({
            ...cause,
            message: cause.message ?? "unknown error",
            module: cause.module ?? "unknown",
            source: cause.source ?? ErrSource.SYSTEM,
            severity: cause.severity ?? ErrSeverity.MED,
        });
    }
    // fallback: stringifying unknowns
    return ErrReport.create({
        message: typeof cause === "string" ? cause : format_err(cause),
        module: "unknown",
        source: ErrSource.SYSTEM,
        severity: ErrSeverity.MED,
        stack: "",
        timestamp: new Date().toISOString(),
    });
}
export const relay = {
    data: (data) => {
        return { success: true, data };
    },
    ok: () => ({
        success: true,
        data: NO_VAL,
        __only: true,
    }),
    err: (msg, cause) => {
        const cleanMsg = msg.trim();
        let rep;
        if (cause instanceof ErrReport) {
            // CHANGE: reuse existing; only add if it adds information
            rep = cause.addMessage(cleanMsg);
        }
        else {
            // CHANGE: create fresh with msg as the headline
            rep = ErrReport.create({
                message: cleanMsg.length > 0 ? cleanMsg : "(/)",
                module: "unknown",
                source: ErrSource.SYSTEM,
                severity: ErrSeverity.MED,
                metadata: cause === undefined ? undefined : { cause }, // keep raw cause
            });
        }
        return { success: false, err: rep, __fail: true };
    },
};
//# sourceMappingURL=relay.js.map