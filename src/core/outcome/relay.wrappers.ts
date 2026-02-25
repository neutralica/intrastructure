import type { Outcome, OutcomeAsync, OutcomeVoid } from "./outcome.types.js";
import { NO_VAL } from "./outcome.types.js";
import { relay } from "./relay.js";
import { outcome } from "./outcome.js";
import { enrichOutcome } from "../error-report/error-report.js";

// data wrapper
export function relay_data<T>(o: Outcome<T>, step?: string): T;
export function relay_data<T>(o: OutcomeAsync<T>, step?: string): Promise<T>;
export function relay_data<T>(
  o: Outcome<T> | OutcomeAsync<T>,
  step?: string
): T | Promise<T> {
  const handler = (x: Outcome<T>): T => {
    const e = enrichOutcome(x, step);

    if (outcome.isErr(e)) throw e.err;

    // “void success” case
    if (outcome.isOK(e)) {
      throw relay.err(step ?? "expected data, got ok").err;
    }

    // After the two checks above, it must be data-success
    return e.data;
  };

  return o instanceof Promise ? o.then(handler) : handler(o);
}

// void wrapper
export function relay_void(o: Outcome<void>, step?: string): OutcomeVoid;
export function relay_void(o: OutcomeAsync<void>, step?: string): Promise<OutcomeVoid>;
export function relay_void(
  o: Outcome<void> | OutcomeAsync<void>,
  step?: string
): OutcomeVoid | Promise<OutcomeVoid> {
  const handler = (x: Outcome<void>): OutcomeVoid => {
    const e = enrichOutcome(x, step);

    if (outcome.isErr(e)) throw e.err;

    // If you ever allow relay.data(void) this will catch it.
    if (outcome.isData(e)) {
      throw relay.err(step ?? "expected ok, got data").err;
    }

    // Narrow to the real success-only value and return it (don’t reconstruct)
    if (outcome.isOK(e)) return e;

    // Defensive: should be unreachable if your union is correct
    throw relay.err(step ?? "invalid Outcome<void> state");
  };

  return o instanceof Promise ? o.then(handler) : handler(o);
}