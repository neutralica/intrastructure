// result.wrappers.ts

import { enrichResult } from "../error-report/error-report.js";
import { $r } from "./result.infra.js";
import { NO_VAL, type Result, type ResultAsync, type ROnlySuccess } from "./result.types.js";

/**
 *
 *  : $r_
 *      Wrapper functions to automatically verify $Results
 *
 *   - $r_data - allows easy data access by encapsulating null-check boilerplate
 *      wraps & checks methods that return <DataSuccess>
 *          - if successful, verifies and returns the .data payload
 *          - if failure, throws or creates new $R.XX()
 *
 *    - $r_ø — wraps methods that return $Result<void>
 *          - can stack multiple methods in arguments sequentially
 *          - verifies success of wrapped methods before allowing to continue
 *          - warns of $R.XX() but (probably?) does not throw
 *          - does not return a value (errors if data is returned)
 *  */



export function r_$<T>(result: Result<T>, msg?: string): T {
    // this (below return type) WAS Promise<T>; now it's T. Either seems to work fine. Seems bad!
    const handler = (resolved: Result<unknown>): T => {
        if (!isResult(resolved)) throw $r.XX(`r_$ received non-Result value`);
        const enriched = enrichResult(resolved);
        if ($r.is_xx(enriched)) throw enriched;
        if ($r.is_ok(enriched)) throw $r.XX('no data with successful result');
        return enriched.data as T;

    };
    return handler(result);

}

/**
 *  $r_ø
 *  wrapper for critical methods that return $Result<void>
 *   bypasses local-failure returns in critical operations and
 *      throws failures instead
 *   for non-trivial operations that don't return a data result but
 *      must not fail
 **/

export function r_ø(result: Result<void>, msg?: string): ROnlySuccess;
export function r_ø(result: ResultAsync<void>, msg?: string): Promise<ROnlySuccess>;
export function r_ø(result: Result<void> | ResultAsync<void>, msg?: string):
    ROnlySuccess | Promise<ROnlySuccess> {
    const handler = (unknownresult: Result<unknown>): ROnlySuccess => {
        if (!isResult(unknownresult)) {
            throw $r.XX(`r_$ received non-Result value`);
        }
        const enriched = enrichResult(unknownresult);
        if ($r.has_data(enriched)) {
            if (msg) console.error(msg);
            console.error('$Result<vøid> error: \n', enriched);
            console.error(new Error().stack);
            throw $r.XX('$Result<vøid> error: data not expected in $Result<void>');
        }
        if ($r.is_xx(enriched)) {
            if (msg) console.error(msg);
            console.error('$Result<void> error: ', enriched.err.message);
            console.error(new Error().stack);
            throw enriched;
        }
        return {
            success: true,
            data: NO_VAL,
            __only: true,
        } as const;
    };
    if (result instanceof Promise) {
        return result.then(resolved => handler(resolved));
    } else {
        return handler(result);
    }
}
function isResult<T>(x: unknown): x is Result<T> {
    return (
        typeof x === 'object' &&
        x !== null &&
        'success' in x &&
        (x as any).success === true || (x as any).success === false
    );
}
