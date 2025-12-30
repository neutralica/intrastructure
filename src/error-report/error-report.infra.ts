// error-report.ts

import { $r } from "../outcome/result.infra.js";
import type { Result } from "../outcome/result.types.js";
import { r_$ } from "../outcome/result.wrappers.js";
import type { ClientMeta, ServerMeta } from "../types/core.types.js";
import { ErrSource, type ErrSeverity } from "./err-consts/err-consts.js";

/**
 * extends Error(), defines a standardized ErrorReport class with
 *  enhanced error context
 *   
 */
type RequiredData = 'message' | 'module' | 'source' | 'severity';


export type ErrData = Partial<{
    [K in keyof ErrReport]: ErrReport[K];
}>;


export default class ErrReport extends Error {
    public message: string;
    public module: string;
    public severity: ErrSeverity;
    public status?: string;
    public stack: string; // one of your counterparts recommended making this readonly after creation?
    public timestamp?: string;
    public source?: ErrSource;
    public metadata?: ClientMeta | ServerMeta;


    private constructor(
        message: string,
        module: string,
        source: ErrSource,
        severity: ErrSeverity,
        partialdata?: Omit<ErrData, RequiredData>
    ) {
        super(message);
        this.message = message;
        this.module = module;
        this.source = source ?? ErrSource.SYSTEM; // TODO change this back to just source, if exists
        this.severity = severity;
        this.timestamp = new Date().toISOString();
        this.stack = new Error(message).stack ?? '(no trace available)';

        Object.assign(this, partialdata);
    }

    public static create(data: ErrData): Result<ErrReport> {
        const issues: string[] = []
        if (data.message === undefined) {
            issues.push('ErrorReport.new() requires message');
        }
        if (!data.module) {
            issues.push('ErrorReport.new() requires module');
        }
        if (!data.source) {
            issues.push('ErrorReport.new() requires source');
        }
        if (!data.severity) {
            issues.push('ErrorReport.new() requires severity');
        }
        if (issues.length !== 0) {
            throw new Error(issues.join(' / '));
        }
        const error: ErrReport = new ErrReport(
            data.message as string,
            data.module as string, // was Mod∆ but that's a DB specific thing
            data.source as ErrSource,
            data.severity as ErrSeverity,
            data);
        // console.error(error);
        return $r.OK(error);
    }


    // these two methods feel like one is redundant:
    public addMessage(newMessage: string): Result<ErrReport> {
        return ErrReport.create({
            message: `${this.message} | ${newMessage}`, // Append new message
            module: this.module,
            source: this.source || ErrSource.SYSTEM,
            severity: this.severity
        });
    }
    public addBreadCrumb(tag: string): Result<ErrReport> {
        const prev = this.metadata?.breadcrumbs ?? [];
        const enriched = [...prev, tag];
        return ErrReport.create({
            ...this,
            metadata: {
                ...this.metadata,
                breadcrumbs: enriched,
                enriched: true,
            }
        });
    }


}
export function enrichResult<T>(
    result: Result<T>,
    stepId?: string
): Result<T> {
    if (!$r.is_xx(result)) return result;
    if (result.err.metadata?.enriched) return result;

    if (!stepId) return result;

    const enriched_err = r_$(result.err.addBreadCrumb(stepId));
    return $r.XX(enriched_err.message, enriched_err);
}