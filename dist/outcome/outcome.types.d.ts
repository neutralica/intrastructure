import type ErrReport from "../error-report/error-report.js";
export type OutcomeDataSuccess<T> = {
    success: true;
    data: Exclude<T, NoValue>;
};
export type OutcomeSuccessOnly = {
    success: true;
    data: NoValue;
    message?: string;
    __only: true;
};
export type OutcomeFailErr = {
    success: false;
    err: ErrReport;
    __fail: true;
};
export type Outcome<T> = OutcomeDataSuccess<T> | OutcomeSuccessOnly | OutcomeFailErr;
export type OutcomeAsync<T> = Promise<Outcome<T>>;
export type OutcomeVoid = Outcome<void>;
export type OutcomeAsyncVoid = OutcomeAsync<void>;
export type OutcomeAsyncJSON<T> = OutcomeAsync<T>;
export type OutcomeAsyncRender<T extends Record<string, unknown> = {}> = OutcomeAsync<{
    view: string;
} & T>;
export type OutcomeAsyncSend = OutcomeAsync<OutcomeSuccessOnly>;
export type NoValue = '$NOVAL';
export declare const NO_VAL: NoValue;
//# sourceMappingURL=outcome.types.d.ts.map