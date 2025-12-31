// error-report.ts
import { outcomeIs } from "../outcome/outcome.js";
import { wrap_data } from "../outcome/outcome.wrappers.js";
import { ErrSource, ErrSeverity } from "./err-consts/err-consts.js";
export default class ErrReport extends Error {
    message;
    module;
    severity;
    status;
    stack;
    timestamp;
    source;
    metadata;
    constructor(message, module, source, severity, partial) {
        super(message);
        this.message = message;
        this.module = module;
        this.source = source;
        this.severity = severity;
        this.timestamp = new Date().toISOString();
        this.stack = new Error(message).stack ?? "(no trace available)";
        // Keep optional extras (status/metadata/etc)
        if (partial)
            Object.assign(this, partial);
    }
    static create(data) {
        // Best-effort normalize
        const msg = typeof data.message === "string" && data.message.length > 0
            ? data.message
            : "(no message)";
        const mod = typeof data.module === "string" && data.module.length > 0
            ? data.module
            : "unknown";
        //  required in types, but still normalize defensively.
        const src = data.source ?? ErrSource.SYSTEM;
        // If severity is missing/invalid, default to MED.
        const sev = data.severity ?? ErrSeverity.MED;
        // never throw; always construct
        return new ErrReport(msg, mod, src, sev, data);
    }
    addMessage(newMessage) {
        const suffix = typeof newMessage === "string" && newMessage.length > 0
            ? newMessage
            : "(empty message)";
        return ErrReport.create({
            ...this.toData(),
            message: `${this.message} | ${suffix}`,
        });
    }
    addBreadCrumb(tag) {
        const safeTag = typeof tag === "string" && tag.length > 0 ? tag : "(empty tag)";
        const meta = this.metadata ?? {};
        // Tolerate old shapes (string) and coerce
        const prevRaw = meta.breadcrumbs;
        const prev = Array.isArray(prevRaw)
            ? prevRaw
            : typeof prevRaw === "string" && prevRaw.length > 0
                ? [prevRaw]
                : [];
        const enriched = [...prev, safeTag];
        return ErrReport.create({
            ...this.toData(),
            metadata: {
                ...meta,
                breadcrumbs: enriched,
                enriched: true,
            },
        });
    }
    toData() {
        return {
            message: this.message,
            module: this.module,
            source: this.source,
            severity: this.severity,
            status: this.status,
            timestamp: this.timestamp,
            // stack is not in ErrData in your snippet; add it if you want it carried.
            metadata: this.metadata,
        };
    }
}
export function enrichOutcome(outcome, stepId) {
    if (!outcomeIs.failErr(outcome))
        return outcome;
    if (outcome.err.metadata?.enriched)
        return outcome;
    if (!stepId)
        return outcome;
    const enrichedErr = outcome.err.addBreadCrumb(stepId);
    // Preserve original message but swap the report
    return outcomeIs.ERR(enrichedErr.message, enrichedErr);
}
//# sourceMappingURL=error-report.js.map