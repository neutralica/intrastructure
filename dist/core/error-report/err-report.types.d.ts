import type ErrReport from "./error-report.js";
/**
 * extends Error(), defines a standardized ErrorReport class with
 *  enhanced error context
 *
 */
export type RequiredData = 'message' | 'module' | 'source' | 'severity';
export type ErrData = Partial<{
    [K in keyof ErrReport]: ErrReport[K];
}>;
//# sourceMappingURL=err-report.types.d.ts.map