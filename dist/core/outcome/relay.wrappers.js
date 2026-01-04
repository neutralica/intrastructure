import { NO_VAL } from "./outcome.types.js";
import { relay } from "./relay.js";
import { outcome } from "./outcome.js";
import { enrichOutcome } from "../error-report/error-report.js";
export function wrap_data(o, step) {
    const handler = (x) => {
        const e = enrichOutcome(x, step);
        if (outcome.isErr(e))
            throw e.err;
        // “void success” case
        if (outcome.isOK(e)) {
            throw relay.err(step ?? "expected data, got ok").err;
        }
        // After the two checks above, it must be data-success
        return e.data;
    };
    return o instanceof Promise ? o.then(handler) : handler(o);
}
export function wrap_void(o, step) {
    const handler = (x) => {
        const e = enrichOutcome(x, step);
        if (outcome.isErr(e))
            throw e.err;
        // If you ever allow relay.data(void) this will catch it.
        if (outcome.isData(e)) {
            throw relay.err(step ?? "expected ok, got data").err;
        }
        // Narrow to the real success-only value and return it (don’t reconstruct)
        if (outcome.isOK(e))
            return e;
        // Defensive: should be unreachable if your union is correct
        throw relay.err(step ?? "invalid Outcome<void> state").err;
    };
    return o instanceof Promise ? o.then(handler) : handler(o);
}
//# sourceMappingURL=relay.wrappers.js.map