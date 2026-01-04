import type { Outcome, OutcomeDataSuccess, OutcomeFailErr, OutcomeSuccessOnly } from "./outcome.types.js";
export declare const outcome: {
    readonly isOutcome: (x: unknown) => x is Outcome<unknown>;
    readonly isData: <T>(o: Outcome<T>) => o is OutcomeDataSuccess<T>;
    readonly isOK: <T>(o: Outcome<T>) => o is OutcomeSuccessOnly;
    readonly isErr: <T>(o: Outcome<T>) => o is OutcomeFailErr;
};
//# sourceMappingURL=outcome.d.ts.map