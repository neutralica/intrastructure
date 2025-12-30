// error-report.ts
import { $r } from "../outcome/result.infra.js";
import { r_$ } from "../outcome/result.wrappers.js";
import { ErrSource } from "./err-consts/err-consts.js";
export default class ErrReport extends Error {
    message;
    module;
    severity;
    status;
    stack; // one of your counterparts recommended making this readonly after creation?
    timestamp;
    source;
    metadata;
    constructor(message, module, source, severity, partialdata) {
        super(message);
        this.message = message;
        this.module = module;
        this.source = source ?? ErrSource.SYSTEM; // TODO change this back to just source, if exists
        this.severity = severity;
        this.timestamp = new Date().toISOString();
        this.stack = new Error(message).stack ?? '(no trace available)';
        Object.assign(this, partialdata);
    }
    static create(data) {
        const issues = [];
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
        const error = new ErrReport(data.message, data.module, // was Mod∆ but that's a DB specific thing
        data.source, data.severity, data);
        // console.error(error);
        return $r.OK(error);
    }
    // these two methods feel like one is redundant:
    addMessage(newMessage) {
        return ErrReport.create({
            message: `${this.message} | ${newMessage}`, // Append new message
            module: this.module,
            source: this.source || ErrSource.SYSTEM,
            severity: this.severity
        });
    }
    addBreadCrumb(tag) {
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
export function enrichResult(result, stepId) {
    if (!$r.is_xx(result))
        return result;
    if (result.err.metadata?.enriched)
        return result;
    if (!stepId)
        return result;
    const enriched_err = r_$(result.err.addBreadCrumb(stepId));
    return $r.XX(enriched_err.message, enriched_err);
}
//# sourceMappingURL=error-report.infra.js.map