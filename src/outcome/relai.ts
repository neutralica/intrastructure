// relai.ts  (drop-in replacement)

// CHANGE: keep this import if ErrReport is a class (used by instanceof checks)
import ErrReport from "../error-report/error-report.js";
import { ErrSeverity, ErrSource } from "../error-report/err-consts/err-consts.js";

import type { ErrData } from "../error-report/err-report.types.js";
import type {
  Outcome,
  OutcomeDataSuccess,
  OutcomeFailErr,
  OutcomeSuccessOnly,
  NoValue,
} from "./outcome.types.js";

import { NO_VAL } from "./outcome.types.js";

/**
 * CHANGE: stronger "is ErrData" guard:
 * - rejects arrays
 * - rejects ErrReport instances
 * - rejects Outcome-shaped objects (sentinel fields)
 * - does NOT try to validate full ErrData shape (ErrReport.create handles that)
 */
function isErrData(x: unknown): x is ErrData {
  if (typeof x !== "object" || x === null) return false;
  if (Array.isArray(x)) return false;
  if (x instanceof ErrReport) return false;

  // ErrData must NOT have Outcome sentinel fields
  if ("success" in x) return false;
  if ("__fail" in x) return false;
  if ("__only" in x) return false;

  return true;
}

export const relai = {
  // ========= constructors =========

  ok: <T>(data?: Exclude<T, NoValue>): Outcome<T> => {
    if (data === undefined) {
      return { success: true, data: NO_VAL, __only: true } as OutcomeSuccessOnly;
    }
    return { success: true, data } as OutcomeDataSuccess<T>;
  },

  err: (
    message: string,
    existingErr?: Outcome<never> | ErrData | ErrReport
  ): OutcomeFailErr => {
    const messagePlusERR = `${message}\n`;

    let base: ErrReport;

    if (existingErr && relai.failErr(existingErr)) {
      // CHANGE: existing failure Outcome -> reuse its ErrReport and enrich
      base = existingErr.err.addMessage(messagePlusERR);
    } else if (existingErr instanceof ErrReport) {
      // CHANGE: direct ErrReport -> enrich it
      base = existingErr.addMessage(messagePlusERR);
    } else {
      // CHANGE: only merge if it's actually ErrData (not some random object)
      const partial: Partial<ErrData> = isErrData(existingErr) ? existingErr : {};

      // CHANGE: create includes the message; do NOT addMessage again
      base = ErrReport.create({
        ...partial,
        message: messagePlusERR,
        module: typeof partial.module === "string" ? partial.module : "unknown",
        source: partial.source ?? ErrSource.SYSTEM,
        severity: partial.severity ?? ErrSeverity.MED,
      } as ErrData);
    }

    return {
      success: false,
      err: base,
      __fail: true,
    } as const;
  },

  // ========= type guards =========

  data: <T>(outcome: Outcome<T>): outcome is OutcomeDataSuccess<T> =>
    outcome.success === true &&
    outcome.data !== NO_VAL &&
    outcome.data !== undefined,

  successOnly: (outcome: unknown): outcome is OutcomeSuccessOnly =>
    typeof outcome === "object" &&
    outcome !== null &&
    (outcome as any).success === true &&
    (outcome as any).__only === true &&
    (outcome as any).data === NO_VAL,

  failErr: (outcome: unknown): outcome is OutcomeFailErr =>
    typeof outcome === "object" &&
    outcome !== null &&
    (outcome as any).success === false &&
    (outcome as any).__fail === true &&
    (outcome as any).err instanceof ErrReport,
} as const;