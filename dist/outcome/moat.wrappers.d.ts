import type { Outcome, OutcomeSuccessOnly } from "./outcome.types.js";
type MaybeOutcome<T> = T | Outcome<T>;
type MaybeOutcomePromise<T> = MaybeOutcome<T> | Promise<MaybeOutcome<T>>;
export declare function try_data<T>(fn: () => MaybeOutcomePromise<T>, msg?: string): Promise<Outcome<T>>;
export declare function try_void(fn: () => MaybeOutcomePromise<void>, msg?: string): Promise<Outcome<void>>;
export declare function must_data<T>(fn: () => MaybeOutcomePromise<T>, msg?: string): Promise<T>;
export declare function must_void(fn: () => MaybeOutcomePromise<void>, msg?: string): Promise<OutcomeSuccessOnly>;
export {};
//# sourceMappingURL=moat.wrappers.d.ts.map