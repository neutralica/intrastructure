import { type Outcome, type OutcomeAsync, type OutcomeSuccessOnly } from "./outcome.types.js";
export declare function r_$<T>(outcome: Outcome<T>, msg?: string): T;
export declare function wrap_void(outcome: Outcome<void>, msg?: string): OutcomeSuccessOnly;
export declare function wrap_void(outcome: OutcomeAsync<void>, msg?: string): Promise<OutcomeSuccessOnly>;
//# sourceMappingURL=outcome.wrappers.d.ts.map