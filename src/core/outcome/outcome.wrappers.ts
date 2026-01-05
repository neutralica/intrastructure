// outcome.wrappers.ts

import type { Outcome, OutcomeSuccessOnly, NoValue } from "./outcome.types.js";
import { relay } from "./relay.js";
import { enrichOutcome } from "../error-report/error-report.js";
import { wrap_data, wrap_void } from "./relay.wrappers.js";

/**
 * Either a raw payload OR an Outcome<T>.
 * The moat accepts both and normalizes to Outcome<T>.
 */
type MaybeOutcome<T> = T | Outcome<T>;
type MaybeOutcomePromise<T> = MaybeOutcome<T> | Promise<MaybeOutcome<T>>;

/**
 * Runtime check for "Outcome-shaped enough".
 * NOTE: This does NOT prove it has methods attached. It only identifies the shape.
 */
function isOutcomeShape(x: unknown): x is { success: boolean } {
  return (
    typeof x === "object" &&
    x !== null &&
    "success" in x &&
    (x as any).success === true || (x as any).success === false
  );
}

/**
 * During migration you may have Outcome-shaped objects without methods.
 * If everything always comes from relay.make.*, you can delete this.
 */
function ensure_methods<T>(o: Outcome<T>): Outcome<T> {
  // If your Outcome type guarantees these methods exist, this becomes a no-op.
  const anyO = o as any;
  if (typeof anyO.isErr === "function") return o;

  // CHANGE: if you still have "bare" shapes, re-create via relay factories
  // to guarantee methods are attached and to preserve data/err.
  if (anyO.success === false && anyO.err) {
    return relay.err(anyO.err.message ?? "error", anyO.err) as Outcome<T>;
  }

  if (anyO.success === true) {
    // success-only vs data-success
    if (anyO.__only === true || anyO.data === undefined) {
      return relay.ok();
    }
    return relay.data(anyO.data) as Outcome<T>;
  }

  // Fallback: treat unknown thing as internal error
  return relay.err("ensure_methods received non-Outcome-ish value", anyO) as Outcome<T>;
}

export function data_sync<T>(
  fn: () => T | Outcome<T>,
  step?: string
): Outcome<T> {
  try {
    const v = fn();

    if (isOutcomeShape(v)) {
      const o = ensure_methods(v);
      return enrichOutcome(o, step);
    }

    return relay.data(v as Exclude<T, NoValue>);
  } catch (e) {
    return relay.err(step ?? "data_sync caught exception", e) as Outcome<T>;
  }
}


export function void_sync(
  fn: () => void | Outcome<void>,
  step?: string
): Outcome<void> {
  try {
    const v = fn();

    if (isOutcomeShape(v)) {
      const o = ensure_methods(v as Outcome<void>);
      return enrichOutcome(o, step);
    }

    return relay.ok() as Outcome<void>;
  } catch (e) {
    return relay.err(step ?? "void_sync caught exception", e) as Outcome<void>;
  }
}
/**
 * Async wrappers (thin)
 */
export async function data_async<T>(
  fn: () => Promise<T | Outcome<T>>,
  step?: string
): Promise<Outcome<T>> {
  try {
    const v = await fn();
    // reuse sync moat by passing a sync thunk returning the resolved value
    return data_sync(() => v, step);
  } catch (e) {
    return relay.err(step ?? "data_async caught exception", e) as Outcome<T>;
  }
}

export async function void_async(
  fn: () => Promise<void | Outcome<void>>,
  step?: string
): Promise<Outcome<void>> {
  try {
    const v = await fn();
    return void_sync(() => v, step);
  } catch (e) {
    return relay.err(step ?? "void_async caught exception", e) as Outcome<void>;
  }
}

// /**
//  * must_*: developer-facing “blow up on failure” helpers
//  */
// export async function must_data<T>(
//   fn: () => MaybeOutcomePromise<T>,
//   step?: string
// ): Promise<T> {
//   const o = await try_data(fn, step);
//   return wrap_data(o, step);
// }

// export async function must_void(
//   fn: () => MaybeOutcomePromise<void>,
//   step?: string
// ): Promise<OutcomeSuccessOnly> {
//   const o = await try_void(fn, step);
//   return wrap_void(o, step);
// }