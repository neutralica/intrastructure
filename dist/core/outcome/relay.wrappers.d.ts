import type { Outcome, OutcomeAsync, OutcomeVoid } from "./outcome.types.js";
export declare function relay_data<T>(o: Outcome<T>, step?: string): T;
export declare function relay_data<T>(o: OutcomeAsync<T>, step?: string): Promise<T>;
export declare function relay_void(o: Outcome<void>, step?: string): OutcomeVoid;
export declare function relay_void(o: OutcomeAsync<void>, step?: string): Promise<OutcomeVoid>;
//# sourceMappingURL=relay.wrappers.d.ts.map