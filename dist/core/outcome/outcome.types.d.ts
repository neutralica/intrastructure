import type ErrReport from "../error-report/error-report.js";
export type NoValue = "$NOVAL";
export declare const NO_VAL: NoValue;
export type Payload<T> = T extends NoValue ? never : T;
export type OutcomeDataSuccess<T> = {
    success: true;
    data: T;
};
export type OutcomeSuccessOnly = {
    success: true;
    data: NoValue;
    __only: true;
};
export type OutcomeFailErr = {
    success: false;
    err: ErrReport;
    __fail: true;
};
export type Outcome<T> = OutcomeDataSuccess<T> | OutcomeSuccessOnly | OutcomeFailErr;
export type OutcomeAsync<T> = Promise<Outcome<T>>;
export type OutcomeAsyncJSON<T> = OutcomeAsync<T>;
export type OutcomeAsyncRender<T extends Record<string, unknown> = {}> = OutcomeAsync<{
    view: string;
} & T>;
/**
 * SEND means “side-effect happened, no payload”
 * so it should be void-success or error.
 */
export type OutcomeAsyncSend = OutcomeAsync<void>;
//# sourceMappingURL=outcome.types.d.ts.map