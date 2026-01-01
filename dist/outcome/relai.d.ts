import ErrReport from "../error-report/error-report.js";
import type { ErrData } from "../error-report/err-report.types.js";
import type { Outcome, OutcomeDataSuccess, OutcomeFailErr, OutcomeSuccessOnly, NoValue } from "./outcome.types.js";
export declare const relai: {
    readonly ok: <T>(data?: Exclude<T, NoValue>) => Outcome<T>;
    readonly err: (message: string, existingErr?: Outcome<never> | ErrData | ErrReport) => OutcomeFailErr;
    readonly data: <T>(outcome: Outcome<T>) => outcome is OutcomeDataSuccess<T>;
    readonly successOnly: (outcome: unknown) => outcome is OutcomeSuccessOnly;
    readonly failErr: (outcome: unknown) => outcome is OutcomeFailErr;
};
//# sourceMappingURL=relai.d.ts.map