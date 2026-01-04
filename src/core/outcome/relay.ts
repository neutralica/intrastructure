// relay.ts
import ErrReport from "../error-report/error-report.js";
import { ErrSeverity, ErrSource } from "../error-report/err-consts/err-consts.js";
import type { ErrData } from "../error-report/err-report.types.js";
import type { NoValue, Outcome, OutcomeDataSuccess, OutcomeFailErr, OutcomeSuccessOnly, Payload } from "./outcome.types.js";
import { NO_VAL } from "./outcome.types.js";
import { format_err } from "../../helpers/format-err.js"; // returns string (as you described)

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isErrData(x: unknown): x is ErrData {
  return (
    isObject(x) &&
    !Array.isArray(x) &&
    !(x instanceof ErrReport) &&
    !("success" in x) &&
    !("__fail" in x) &&
    !("__only" in x)
  );
}

/**
 * CHANGE: internal coercion — callers pass unknown, relay decides.
 */
function coerce_report(cause: unknown): ErrReport {
  if (cause instanceof ErrReport) return cause;
  if (cause instanceof Error) {
    return ErrReport.create({
      message: cause.message,
      source: ErrSource.SYSTEM,
      severity: ErrSeverity.MED,
      stack: cause.stack ?? "",
      timestamp: new Date().toISOString(),
    } as ErrData);
  }
  if (isErrData(cause)) {
    return ErrReport.create({
      ...cause,
      message: cause.message ?? "unknown error",
      module: cause.module ?? "unknown",
      source: cause.source ?? ErrSource.SYSTEM,
      severity: cause.severity ?? ErrSeverity.MED,
    } as ErrData);
  }

  // fallback: stringifying unknowns
  return ErrReport.create({
    message: typeof cause === "string" ? cause : format_err(cause),
    module: "unknown",
    source: ErrSource.SYSTEM,
    severity: ErrSeverity.MED,
    stack: "",
    timestamp: new Date().toISOString(),
  } as ErrData);
}

export const relay = {
  data: <T>(data: T): Outcome<T> => {
    return { success: true, data } as const;
  },
  ok: (): OutcomeSuccessOnly => ({
    success: true,
    data: NO_VAL,
    __only: true,
  }),
  
  err: (msg: string, cause?: unknown): OutcomeFailErr => {
  const cleanMsg = msg.trim();

  let rep: ErrReport;

  if (cause instanceof ErrReport) {
    // CHANGE: reuse existing; only add if it adds information
    rep = cause.addMessage(cleanMsg);
  } else {
    // CHANGE: create fresh with msg as the headline
    rep = ErrReport.create({
      message: cleanMsg.length > 0 ? cleanMsg : "(/)",
      module: "unknown",
      source: ErrSource.SYSTEM,
      severity: ErrSeverity.MED,
      metadata: cause === undefined ? undefined : { cause }, // keep raw cause
    } as ErrData);
  }

  return { success: false, err: rep, __fail: true } as const;
},
} as const;