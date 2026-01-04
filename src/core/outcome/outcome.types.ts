// outcome.types.ts
import type ErrReport from "../error-report/error-report.js";

export type NoValue = "$NOVAL";
export const NO_VAL: NoValue = "$NOVAL";

export type Payload<T> = T extends NoValue ? never : T;

// variants
export type OutcomeDataSuccess<T> = { success: true; data: T };
export type OutcomeSuccessOnly = { success: true; data: NoValue; __only: true };
export type OutcomeFailErr = { success: false; err: ErrReport; __fail: true };

// core union
export type Outcome<T> =
  | OutcomeDataSuccess<T>
  | OutcomeSuccessOnly
  | OutcomeFailErr;

// async alias (this is the “OutcomeAsync” you’re asking about)
export type OutcomeAsync<T> = Promise<Outcome<T>>;
// outcome.types.ts (or outcome.aliases.ts if you want to keep the core file tiny)

export type OutcomeAsyncJSON<T> = OutcomeAsync<T>;

export type OutcomeAsyncRender<T extends Record<string, unknown> = {}> =
  OutcomeAsync<{ view: string } & T>;

/**
 * SEND means “side-effect happened, no payload”
 * so it should be void-success or error.
 */
export type OutcomeAsyncSend = OutcomeAsync<void>;