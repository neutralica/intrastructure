import ErrReport from "../error-report/error-report.js";
import { type ErrData } from "../error-report/err-report.types.js";
import { type NoValue, type OutcomeDataSuccess, type Outcome, type OutcomeFailErr, type OutcomeSuccessOnly } from "./outcome.types.js";
export declare const outcomeIs: {
    OK: <T>(data?: Exclude<T, NoValue>) => Outcome<T>;
    ERR: (message: string, existingErr?: Outcome<never> | ErrData | ErrReport) => OutcomeFailErr;
    withData: <T>(outcome: Outcome<T>) => outcome is OutcomeDataSuccess<T>;
    successOnly: (outcome: unknown) => outcome is OutcomeSuccessOnly;
    failErr: (outcome: unknown) => outcome is OutcomeFailErr;
};
//# sourceMappingURL=outcome.d.ts.map