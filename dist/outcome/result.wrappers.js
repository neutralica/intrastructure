// result.wrappers.ts
import { enrichResult } from "../error-report/error-report.infra.js";
import { $r } from "./result.infra.js";
import { NO_VAL } from "./result.types.js";
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
export function r_$(result, msg) {
    // this (below return type) WAS Promise<T>; now it's T. Either seems to work fine. Seems bad!
    const handler = (resolved) => {
        if (!isResult(resolved))
            throw $r.XX(`r_$ received non-Result value`);
        const enriched = enrichResult(resolved);
        if ($r.is_xx(enriched))
            throw enriched;
        if ($r.is_ok(enriched))
            throw $r.XX('no data with successful result');
        return enriched.data;
    };
    return handler(result);
}
export function r_ø(result, msg) {
    const handler = (unknownresult) => {
        if (!isResult(unknownresult)) {
            throw $r.XX(`r_$ received non-Result value`);
        }
        const enriched = enrichResult(unknownresult);
        if ($r.has_data(enriched)) {
            if (msg)
                console.error(msg);
            console.error('$Result<vøid> error: \n', enriched);
            console.error(new Error().stack);
            throw $r.XX('$Result<vøid> error: data not expected in $Result<void>');
        }
        if ($r.is_xx(enriched)) {
            if (msg)
                console.error(msg);
            console.error('$Result<void> error: ', enriched.err.message);
            console.error(new Error().stack);
            throw enriched;
        }
        return {
            success: true,
            data: NO_VAL,
            __only: true,
        };
    };
    if (result instanceof Promise) {
        return result.then(resolved => handler(resolved));
    }
    else {
        return handler(result);
    }
}
function isResult(x) {
    return (typeof x === 'object' &&
        x !== null &&
        'success' in x &&
        x.success === true || x.success === false);
}
//# sourceMappingURL=result.wrappers.js.map