import { enrichOutcome } from "../error-report/error-report.js";
import { format_err } from "../helpers/format-err.js";
import { relai } from "./relai.js";
import type { NoValue, Outcome, OutcomeSuccessOnly } from "./outcome.types.js";
import { validateOutcome, wrap_data, wrap_void } from "./relai.wrappers.js";

// type MaybePromise<T> = T | Promise<T>;
type MaybeOutcome<T> = T | Outcome<T>;
type MaybeOutcomePromise<T> = MaybeOutcome<T> | Promise<MaybeOutcome<T>>;

function isOutcome<T>(x: unknown): x is Outcome<T> {
    return validateOutcome<T>(x);
}

// Moat: always returns Outcome<T>
export async function try_data<T>(
    fn: () => MaybeOutcomePromise<T>,
    msg?: string
): Promise<Outcome<T>> {
    try {
        const v = await fn();

        if (isOutcome<T>(v)) {
            return enrichOutcome(v, msg);
        }

        return relai.ok(v as Exclude<T, NoValue>);
    } catch (e) {
        return relai.err(msg ?? "try_data caught exception", {message: format_err(e)});
    }
}

// Moat: always returns Outcome<void>
export async function try_void(
    fn: () => MaybeOutcomePromise<void>,
    msg?: string
): Promise<Outcome<void>> {
    try {
        const v = await fn();

        if (isOutcome<void>(v)) {
            return enrichOutcome(v, msg);
        }

        // raw void success
        return relai.ok();
    } catch (e) {
        return relai.err(msg ?? "try_void caught exception", {message: format_err(e)});
    }
}

export async function must_data<T>(
    fn: () => MaybeOutcomePromise<T>,
    msg?: string
): Promise<T> {
    const o = await try_data(fn, msg);
    return wrap_data(o, msg); // throws OutcomeFailErr or ERR(...)
}

export async function must_void(
    fn: () => MaybeOutcomePromise<void>,
    msg?: string
): Promise<OutcomeSuccessOnly> {
    const o = await try_void(fn, msg);
    return wrap_void(o, msg); // throws on failure / unexpected data
}