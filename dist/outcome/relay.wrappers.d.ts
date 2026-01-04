import type { Outcome, OutcomeAsync, OutcomeSuccessOnly } from "./outcome.types.js";
export declare function wrap_data<T>(o: Outcome<T>, step?: string): T;
export declare function wrap_data<T>(o: OutcomeAsync<T>, step?: string): Promise<T>;
export declare function wrap_void(o: Outcome<void>, step?: string): OutcomeSuccessOnly;
export declare function wrap_void(o: OutcomeAsync<void>, step?: string): Promise<OutcomeSuccessOnly>;
//# sourceMappingURL=relay.wrappers.d.ts.map