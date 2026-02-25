import type { Outcome, OutcomeData, OutcomeErr, OutcomeVoid } from "./outcome.types.js";
export declare const outcome: {
    readonly isOutcome: (x: unknown) => x is Outcome<unknown>;
    readonly isData: <T>(o: Outcome<T>) => o is OutcomeData<T>;
    readonly isOK: <T>(o: Outcome<T>) => o is OutcomeVoid;
    readonly isErr: <T>(o: Outcome<T>) => o is OutcomeErr;
};
//# sourceMappingURL=outcome.d.ts.map