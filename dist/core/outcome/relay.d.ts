import type { Outcome, OutcomeErr, OutcomeVoid } from "./outcome.types.js";
export declare const relay: {
    readonly data: <T>(data: T) => Outcome<T>;
    readonly ok: () => OutcomeVoid;
    readonly err: (msg: string, cause?: unknown) => OutcomeErr;
};
//# sourceMappingURL=relay.d.ts.map