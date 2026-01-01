import { type Outcome, type OutcomeAsync, type OutcomeSuccessOnly } from "./outcome.types.js";
export declare function wrap_data<T>(outcome: Outcome<T>, msg?: string): T;
export declare function wrap_data<T>(outcome: OutcomeAsync<T>, msg?: string): Promise<T>;
export declare function wrap_void(outcome: Outcome<void>, msg?: string): OutcomeSuccessOnly;
export declare function wrap_void(outcome: OutcomeAsync<void>, msg?: string): Promise<OutcomeSuccessOnly>;
export declare function validateOutcome<T>(x: unknown): x is Outcome<T>;
//# sourceMappingURL=relai.wrappers.d.ts.map