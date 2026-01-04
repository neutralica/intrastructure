import type { Outcome, OutcomeFailErr, OutcomeSuccessOnly } from "./outcome.types.js";
export declare const relay: {
    readonly data: <T>(data: T) => Outcome<T>;
    readonly ok: () => OutcomeSuccessOnly;
    readonly err: (msg: string, cause?: unknown) => OutcomeFailErr;
};
//# sourceMappingURL=relay.d.ts.map