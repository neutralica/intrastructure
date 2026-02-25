// outcome.ts
import { NO_VAL } from "./outcome.types.js";
import type { Outcome, OutcomeData, OutcomeErr, OutcomeVoid } from "./outcome.types.js";
import ErrReport from "../error-report/error-report.js";

export const outcome = {
  isOutcome(x: unknown): x is Outcome<unknown> {
    return typeof x === "object" && x !== null && "success" in x;
  },

  isData<T>(o: Outcome<T>): o is OutcomeData<T> {
    return o.success === true && o.data !== NO_VAL && o.data !== undefined;
  },

  isOK<T>(o: Outcome<T>): o is OutcomeVoid {
    return o.success === true && (o as any).__only === true && o.data === NO_VAL;
  },

  isErr<T>(o: Outcome<T>): o is OutcomeErr {
    return o.success === false && (o as any).__fail === true && (o as any).err instanceof ErrReport;
  },
} as const;