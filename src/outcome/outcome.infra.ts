
// outcome.infra.ts

import { ErrSeverity, ErrSource } from "../error-report/err-consts/err-consts.js";
import ErrReport from "../error-report/error-report.js";
import { type ErrData } from "../error-report/err-report.types.js";
import { NO_VAL, type NoValue, type OutcomeDataSuccess, type Outcome, type OutcomeFailErr, type OutcomeSuccessOnly } from "./outcome.types.js";

export const outcomeIs = {
    OK: <T>(data?: Exclude<T, NoValue>): Outcome<T> => {
        // console.log(getCallingFunction());
        if (data === undefined) {
            return { success: true, data: NO_VAL, __only: true } as OutcomeSuccessOnly;
        } else {
            return { success: true, data: data } as OutcomeDataSuccess<T>;
        }
    },
    ERR: (
        message: string,
        existingErr?: Outcome<never> | ErrData
    ): Extract<Outcome<never>, { success: false }> => {
        const messagePlusXX = `${message}\n`;

        let base: ErrReport;

        if (existingErr && outcomeIs.failErr(existingErr)) {
            // existingErr is already a failure outcome with an ErrReport
            base = existingErr.err;
        } else if (existingErr instanceof ErrReport) {
            base = existingErr;
        } else {
            // ErrData (or undefined): create a fresh report
            // NOTE: if existingErr is ErrData, you *could* merge it here.
            base = ErrReport.create({
                // CHANGE: preserve caller-supplied ErrData if present
                ...(existingErr && typeof existingErr === "object" ? existingErr : {}),
                message: messagePlusXX,
                module:
                    (existingErr && typeof existingErr === "object" && "module" in existingErr && typeof (existingErr as any).module === "string")
                        ? (existingErr as any).module
                        : "unknown",
                source:
                    (existingErr && typeof existingErr === "object" && "source" in existingErr)
                        ? (existingErr as any).source ?? ErrSource.SYSTEM
                        : ErrSource.SYSTEM,
                severity:
                    (existingErr && typeof existingErr === "object" && "severity" in existingErr)
                        ? (existingErr as any).severity ?? ErrSeverity.MED
                        : ErrSeverity.MED,
            } as ErrData);
        }

        // CHANGE: always append message, never throws, never returns outcome
        const enriched = base.addMessage(messagePlusXX);

        return {
            success: false,
            err: enriched,
            __fail: true,
        } as const;
    },

    /* checking methods: */
    dataOutcome: <T>(outcome: Outcome<T>): outcome is OutcomeDataSuccess<T> =>
        outcome.success && outcome.data !== NO_VAL && outcome.data != undefined,
    successOnly: (outcome: unknown): outcome is OutcomeSuccessOnly =>
        typeof outcome === 'object' &&
        outcome != null &&
        'success' in outcome &&
        'data' in outcome &&
        '__only' in outcome &&
        outcome.data === NO_VAL,
    failErr: (outcome: unknown): outcome is OutcomeFailErr =>
        typeof outcome === "object" &&
        outcome !== null &&
        "success" in outcome &&
        '__fail' in outcome &&
        outcome.success === false,
}




