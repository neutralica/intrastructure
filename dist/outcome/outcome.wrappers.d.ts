import type { Outcome, OutcomeSuccessOnly } from "./outcome.types.js";
/**
 * Either a raw payload OR an Outcome<T>.
 * The moat accepts both and normalizes to Outcome<T>.
 */
type MaybeOutcome<T> = T | Outcome<T>;
type MaybeOutcomePromise<T> = MaybeOutcome<T> | Promise<MaybeOutcome<T>>;
/**
 * Moat: always returns Outcome<T>
 */
export declare function try_data<T>(fn: () => MaybeOutcomePromise<T>, step?: string): Promise<Outcome<T>>;
/**
 * Moat: always returns Outcome<void>
 */
export declare function try_void(fn: () => MaybeOutcomePromise<void>, step?: string): Promise<Outcome<void>>;
/**
 * must_*: developer-facing “blow up on failure” helpers
 */
export declare function must_data<T>(fn: () => MaybeOutcomePromise<T>, step?: string): Promise<T>;
export declare function must_void(fn: () => MaybeOutcomePromise<void>, step?: string): Promise<OutcomeSuccessOnly>;
export {};
//# sourceMappingURL=outcome.wrappers.d.ts.map