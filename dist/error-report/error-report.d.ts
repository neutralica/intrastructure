import type { Outcome } from "../outcome/outcome.types.js";
import type { ClientMeta, ServerMeta } from "../types/core.types.js";
import { ErrSource, ErrSeverity } from "./err-consts/err-consts.js";
import type { ErrData } from "./err-report.types.js";
export default class ErrReport extends Error {
    message: string;
    module: string;
    severity: ErrSeverity;
    status?: string;
    stack: string;
    timestamp: string;
    source: ErrSource;
    metadata?: ClientMeta | ServerMeta;
    private constructor();
    static create(data: ErrData): ErrReport;
    addMessage(newMessage: string): ErrReport;
    addBreadCrumb(tag: string): ErrReport;
    private toData;
}
export declare function enrichOutcome<T>(outcome: Outcome<T>, stepId?: string): Outcome<T>;
//# sourceMappingURL=error-report.d.ts.map