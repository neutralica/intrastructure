// outcome.wrappers.ts
import { relay } from "./relay.js";
import { enrichOutcome } from "../error-report/error-report.js";
import { wrap_data, wrap_void } from "./relay.wrappers.js";
/**
 * Runtime check for "Outcome-shaped enough".
 * NOTE: This does NOT prove it has methods attached. It only identifies the shape.
 */
function isOutcomeShape(x) {
    return (typeof x === "object" &&
        x !== null &&
        "success" in x &&
        x.success === true || x.success === false);
}
/**
 * During migration you may have Outcome-shaped objects without methods.
 * If everything always comes from relay.make.*, you can delete this.
 */
function ensure_methods(o) {
    // If your Outcome type guarantees these methods exist, this becomes a no-op.
    const anyO = o;
    if (typeof anyO.isErr === "function")
        return o;
    // CHANGE: if you still have "bare" shapes, re-create via relay factories
    // to guarantee methods are attached and to preserve data/err.
    if (anyO.success === false && anyO.err) {
        return relay.err(anyO.err.message ?? "error", anyO.err);
    }
    if (anyO.success === true) {
        // success-only vs data-success
        if (anyO.__only === true || anyO.data === undefined) {
            return relay.ok();
        }
        return relay.data(anyO.data);
    }
    // Fallback: treat unknown thing as internal error
    return relay.err("ensure_methods received non-Outcome-ish value", anyO);
}
/**
 * Moat: always returns Outcome<T>
 */
export async function try_data(fn, step) {
    try {
        const v = await fn();
        if (isOutcomeShape(v)) {
            // CHANGE: normalize + enrich
            const o = ensure_methods(v);
            return enrichOutcome(o, step);
        }
        // CHANGE: raw payload -> OK
        return relay.data(v);
    }
    catch (e) {
        // CHANGE: let relay.make.err handle unknown causes
        return relay.err(step ?? "try_data caught exception", e);
    }
}
/**
 * Moat: always returns Outcome<void>
 */
export async function try_void(fn, step) {
    try {
        const v = await fn();
        if (isOutcomeShape(v)) {
            const o = ensure_methods(v);
            return enrichOutcome(o, step);
        }
        // raw void success
        return relay.ok();
    }
    catch (e) {
        return relay.err(step ?? "try_void caught exception", e);
    }
}
/**
 * must_*: developer-facing “blow up on failure” helpers
 */
export async function must_data(fn, step) {
    const o = await try_data(fn, step);
    return wrap_data(o, step);
}
export async function must_void(fn, step) {
    const o = await try_void(fn, step);
    return wrap_void(o, step);
}
//# sourceMappingURL=outcome.wrappers.js.map