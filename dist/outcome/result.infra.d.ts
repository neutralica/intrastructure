import { type ErrData } from "../error-report/error-report.infra.js";
import { type NoValue, type RDataSuccess, type Result, type RFailErr, type ROnlySuccess } from "./result.types.js";
export declare const $r: {
    OK: <T>(data?: Exclude<T, NoValue>) => Result<T>;
    XX: (message: string, existingErr?: Result<never> | ErrData) => Extract<Result<never>, {
        success: false;
    }>;
    has_data: <T>(result: Result<T>) => result is RDataSuccess<T>;
    is_ok: (result: unknown) => result is ROnlySuccess;
    is_xx: (result: unknown) => result is RFailErr;
};
//# sourceMappingURL=result.infra.d.ts.map