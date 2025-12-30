import { type Result, type ResultAsync, type ROnlySuccess } from "./result.types.js";
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
export declare function r_$<T>(result: Result<T>, msg?: string): T;
/**
 *  $r_ø
 *  wrapper for critical methods that return $Result<void>
 *   bypasses local-failure returns in critical operations and
 *      throws failures instead
 *   for non-trivial operations that don't return a data result but
 *      must not fail
 **/
export declare function r_ø(result: Result<void>, msg?: string): ROnlySuccess;
export declare function r_ø(result: ResultAsync<void>, msg?: string): Promise<ROnlySuccess>;
//# sourceMappingURL=result.wrappers.d.ts.map