// outcome.infra.ts
import { ErrSeverity, ErrSource } from "../error-report/err-consts/err-consts.js";
import ErrReport from "../error-report/error-report.js";
import {} from "../error-report/err-report.types.js";
import { NO_VAL } from "./outcome.types.js";
export const outcomeIs = {
    OK: (data) => {
        // console.log(getCallingFunction());
        if (data === undefined) {
            return { success: true, data: NO_VAL, __only: true };
        }
        else {
            return { success: true, data: data };
        }
    },
    ERR: (message, existingErr) => {
        const messagePlusXX = `${message}\n`;
        let base;
        if (existingErr && outcomeIs.failErr(existingErr)) {
            // existingErr is already a failure outcome with an ErrReport
            base = existingErr.err;
        }
        else if (existingErr instanceof ErrReport) {
            base = existingErr;
        }
        else {
            // ErrData (or undefined): create a fresh report
            // NOTE: if existingErr is ErrData, you *could* merge it here.
            base = ErrReport.create({
                // CHANGE: preserve caller-supplied ErrData if present
                ...(existingErr && typeof existingErr === "object" ? existingErr : {}),
                message: messagePlusXX,
                module: (existingErr && typeof existingErr === "object" && "module" in existingErr && typeof existingErr.module === "string")
                    ? existingErr.module
                    : "unknown",
                source: (existingErr && typeof existingErr === "object" && "source" in existingErr)
                    ? existingErr.source ?? ErrSource.SYSTEM
                    : ErrSource.SYSTEM,
                severity: (existingErr && typeof existingErr === "object" && "severity" in existingErr)
                    ? existingErr.severity ?? ErrSeverity.MED
                    : ErrSeverity.MED,
            });
        }
        // CHANGE: always append message, never throws, never returns outcome
        const enriched = base.addMessage(messagePlusXX);
        return {
            success: false,
            err: enriched,
            __fail: true,
        };
    },
    /* checking methods: */
    dataOutcome: (outcome) => outcome.success && outcome.data !== NO_VAL && outcome.data != undefined,
    successOnly: (outcome) => typeof outcome === 'object' &&
        outcome != null &&
        'success' in outcome &&
        'data' in outcome &&
        '__only' in outcome &&
        outcome.data === NO_VAL,
    failErr: (outcome) => typeof outcome === "object" &&
        outcome !== null &&
        "success" in outcome &&
        '__fail' in outcome &&
        outcome.success === false,
};
//# sourceMappingURL=outcome.infra.js.map