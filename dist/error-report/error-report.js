// error-report.ts
import { relay } from "../outcome/relay.js";
import { ErrSource, ErrSeverity } from "./err-consts/err-consts.js";
import { format_err } from "../helpers/format-err.js";
import { outcome } from "../outcome/outcome.js";
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
            : "(/)";
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
        const suffix = typeof newMessage === "string" ? newMessage.trim() : "";
        if (suffix.length === 0)
            return this;
        const base = this.message.trim();
        // CHANGE: if it's the same message, don't double it
        if (suffix === base)
            return this;
        // CHANGE: use newline, not pipes
        const nextMsg = `${base}\n${suffix}`;
        return ErrReport.create({
            ...this.toData(),
            message: nextMsg,
        });
    }
    addTrace(tag) {
        const safeTag = typeof tag === "string" && tag.length > 0 ? tag : "(empty tag)";
        const meta = this.metadata ?? {};
        const prevRaw = meta.breadcrumbs;
        const prev = Array.isArray(prevRaw)
            ? prevRaw
            : typeof prevRaw === "string" && prevRaw.length > 0
                ? [prevRaw]
                : [];
        // de-dupe
        const breadcrumbs = prev.includes(safeTag) ? prev : [...prev, safeTag];
        return ErrReport.create({
            ...this.toData(),
            // CRITICAL: do not change `message` here.
            metadata: {
                ...meta,
                breadcrumbs,
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
// CHANGE: take and return Outcome<T>
export function enrichOutcome(oc, stepId) {
    if (!stepId)
        return oc;
    if (!outcome.isErr(oc))
        return oc;
    // If already enriched with this step, skip (optional but nice)
    const meta = oc.err.metadata ?? {};
    const prev = Array.isArray(meta.breadcrumbs) ? meta.breadcrumbs : [];
    if (prev.includes(stepId))
        return oc;
    // IMPORTANT: do not call relay.err here.
    // Just return the same Outcome, with an updated ErrReport.
    return {
        ...oc,
        err: oc.err.addTrace(stepId), // should be metadata-only
    };
}
//# sourceMappingURL=error-report.js.map