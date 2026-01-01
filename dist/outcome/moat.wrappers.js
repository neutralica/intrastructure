import { enrichOutcome } from "../error-report/error-report.js";
import { format_err } from "../helpers/format-err.js";
import { relai } from "./relai.js";
import { validateOutcome, wrap_data, wrap_void } from "./relai.wrappers.js";
function isOutcome(x) {
    return validateOutcome(x);
}
// Moat: always returns Outcome<T>
export async function try_data(fn, msg) {
    try {
        const v = await fn();
        if (isOutcome(v)) {
            return enrichOutcome(v, msg);
        }
        return relai.ok(v);
    }
    catch (e) {
        return relai.err(msg ?? "try_data caught exception", { message: format_err(e) });
    }
}
// Moat: always returns Outcome<void>
export async function try_void(fn, msg) {
    try {
        const v = await fn();
        if (isOutcome(v)) {
            return enrichOutcome(v, msg);
        }
        // raw void success
        return relai.ok();
    }
    catch (e) {
        return relai.err(msg ?? "try_void caught exception", { message: format_err(e) });
    }
}
export async function must_data(fn, msg) {
    const o = await try_data(fn, msg);
    return wrap_data(o, msg); // throws OutcomeFailErr or ERR(...)
}
export async function must_void(fn, msg) {
    const o = await try_void(fn, msg);
    return wrap_void(o, msg); // throws on failure / unexpected data
}
//# sourceMappingURL=moat.wrappers.js.map