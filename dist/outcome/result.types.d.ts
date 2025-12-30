import type ErrReport from "../error-report/error-report.infra.js";
/**
 *  Result
 *    Utility type system for a communicating success failure across the system, ensuring
 *    consistent message passing and reducing boilerplate via three subtypes
 *
 * Result and R_ shortcuts are type-related; any internal type (ie for
 *      shaping a metatype) are simply RTypeName. The few shortcuts for use in
 *      code are shortcut with R_.
 *
 * Result variables and methods that involve local, specific use is called
 *      via the r_ shortcut; r_ enums and do not relate to Types.
 *
 *
 *      contains of success and data/err properties
 *      — RDataSuccess {success: true, data: [exists]}
 *      - ROnlySuccess {success: true, data: NO_VAL}
 *      - RFailResult {success: false, err: ErrReport}
 *
 *  Async$Result—encapsulates Promise<Result<T>> boilerplate
 *      - R_syncJSON — currently Promise<Result<T>>, but avilable to be tuned in the future
 *      - R_asyncRNDR - ensures data is in a renderable format (ie contains 'view' property)
 *      - R_asyncSEND - ensures data is not passing unexpected data (ensures NO_VAL)
 *        - (these checks correspond to server-side route wrappers respond.JSON, .RND, and .SEND)
 *
 *
 */
export type RDataSuccess<T> = {
    success: true;
    data: Exclude<T, NoValue>;
};
export type ROnlySuccess = {
    success: true;
    data: NoValue;
    message?: string;
    __only: true;
};
export type RFailErr = {
    success: false;
    err: ErrReport;
    __fail: true;
};
export type Result<T> = RDataSuccess<T> | ROnlySuccess | RFailErr;
export type ResultAsync<T> = Promise<Result<T>>;
export type R_void = Result<void>;
export type R_async_void = ResultAsync<void>;
export type R_asyncJSON<T> = ResultAsync<T>;
export type R_asyncRNDR<T extends Record<string, unknown> = {}> = ResultAsync<{
    view: string;
} & T>;
export type R_asyncSEND = ResultAsync<ROnlySuccess>;
export type NoValue = undefined;
export declare const NO_VAL: NoValue;
//# sourceMappingURL=result.types.d.ts.map