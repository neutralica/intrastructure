
// result-util.ts

import { ErrSeverity, ErrSource } from "../error-report/err-consts/err-consts.js";
import ErrReport, { type ErrData } from "../error-report/error-report.infra.js";
import { NO_VAL, type NoValue, type RDataSuccess, type Result, type RFailErr, type ROnlySuccess } from "./result.types.js";
import { r_$ } from "./result.wrappers.js";

/**
 *  : r_  (calling shortcut for Result passing)
 *    Factory utility for generating $Result outcomes
 *      local usage of Results typically is prefixed with lowercase `r_`
 *      - r_.OK(data) — creates DataSuccess w/ .data payload
 *      - r_.OK() — creates OnlySuccess
 *      - r_.XX('message') — creates FailResult with message
 *  // it might be good to just export these as separate variables:
 *  //   ` r_OK` rather than `r_.OK` etc (bc tricksy on the fingers)
 *      much like the wrappers
 * 
 *    Methods for checking $Results 
 *      **(to be eventually deprecated in favor of direct checks by the 
 *       $Result itself**: $R.is_ok($result))  ->  $result.is_ok()
 *        - r_.has_data()
 *        - r_.is_ok()
 *        - r_.is_xx()
 * 
 *      WRAPPERS: *(all wrappers work with async and sync; await must be used in arg)*
 *          r_ø, // for wrapping Result<void>-returning fuctions
 *          r_$  // for wrapping Result<any>-returning functions (or unknown)
 *      the new and improved way to handle Result chains (over r_.is_ok(result) etc)
 *      const data = r_$(//any Result-returning function) 
 *          r_$ — wraps functions that return Result<T> 
 *                      {success: true, data: T}
 *                if Result is successful then it returns the data roperty only
 *                if Result is unsuccessful, throws the Result
 *          r_ø  — wraps functions that return Result<void> 
 *                  if Result is successful, groovy
 *                  if Result is unsuccessful, throws Result (to be useds sparingly)
 * 
 */

const ERROR_PATH = '/log-error';
export const $r = {
    OK: <T>(data?: Exclude<T, NoValue>): Result<T> => {
        // console.log(getCallingFunction());
        if (data === undefined) {
            return { success: true, data: NO_VAL, __only: true } as ROnlySuccess;
        } else {
            return { success: true, data: data } as RDataSuccess<T>;
        }
    },
    XX: (message: string, existingErr?: Result<never> | ErrData): Extract<Result<never>, { success: false }> => {
        let enriched: ErrReport;

        const messagePlusXX = (`
            ${message} \n `)
        
        if (existingErr && $r.is_xx(existingErr)) {
            enriched = r_$(existingErr.err.addMessage(messagePlusXX));
        } else if (existingErr instanceof ErrReport) {
            enriched = r_$(existingErr.addMessage(messagePlusXX));
        } else {
            enriched = r_$(ErrReport.create({
                message: messagePlusXX,
                module: 'unknown', // TODO CHANGE ERR
                source: ErrSource.SYSTEM,
                severity: ErrSeverity.MED,
            }));
        }

        // ✅ If client-side, report error to server
        if (typeof window !== "undefined") {
            void fetch(ERROR_PATH, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(enriched),
            }).catch(err => console.warn("Failed to send error report:", err));
        }
        const fail: RFailErr = {
            success: false,
            err: enriched,
            __fail: true
        } 
        return fail;
    },

    /* checking methods: */
    has_data: <T>(result: Result<T>): result is RDataSuccess<T> =>
        result.success && result.data !== NO_VAL && result.data != undefined,
        is_ok: (result: unknown): result is ROnlySuccess =>
            typeof result === 'object' &&
            result != null &&
            'success' in result &&
            'data' in result &&
            '__only' in result &&
            result.data === NO_VAL,
    is_xx: (result: unknown): result is RFailErr =>
        typeof result === "object" &&
        result !== null &&
        "success" in result &&
        '__fail' in result &&
        result.success === false,
}




