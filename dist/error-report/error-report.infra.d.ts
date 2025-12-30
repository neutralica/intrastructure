import type { Result } from "../outcome/result.types.js";
import type { ClientMeta, ServerMeta } from "../types/state-meta.types.js";
import { ErrSource, type ErrSeverity } from "./err-consts/err-consts.js";
export type ErrData = Partial<{
    [K in keyof ErrReport]: ErrReport[K];
}>;
export default class ErrReport extends Error {
    message: string;
    module: string;
    severity: ErrSeverity;
    status?: string;
    stack: string;
    timestamp?: string;
    source?: ErrSource;
    metadata?: ClientMeta | ServerMeta;
    private constructor();
    static create(data: ErrData): Result<ErrReport>;
    addMessage(newMessage: string): Result<ErrReport>;
    addBreadCrumb(tag: string): Result<ErrReport>;
}
export declare function enrichResult<T>(result: Result<T>, stepId?: string): Result<T>;
//# sourceMappingURL=error-report.infra.d.ts.map