// sentry.ts
// CHANGE: global last-chance error boundary for browser runtime.
// CHANGE: collects ErrReport and forwards to sinks; does NOT use Outcome/relay.

import ErrReport from "../error-report/error-report.js";
import { ErrSeverity, ErrSource } from "../error-report/err-consts/err-consts.js";

export type SentryEvent =
  | { kind: "error"; report: ErrReport; raw: unknown; where: "window.error" | "window.unhandledrejection" | "manual" }
  | { kind: "outcome_thrown"; report: ErrReport; raw: unknown; where: "manual" };

export type SentrySink = (ev: SentryEvent) => void;

type SentryConfig = {
  module?: string;
  enabled?: boolean;
  dedupeWindowMs?: number;
  sinks?: SentrySink[];
};

const _state = {
  enabled: true,
  module: "sentry",
  dedupeWindowMs: 1500,
  sinks: [] as SentrySink[],
  // CHANGE: very small dedupe (message+stack fingerprint)
  recent: new Map<string, number>(),
};

function nowMs(): number {
  return Date.now();
}

function fingerprint(rep: ErrReport): string {
  const msg = rep.message ?? "";
  const st = rep.stack ?? "";
  // keep short; enough to dedupe spam
  return `${msg}@@${st.slice(0, 160)}`;
}

/** CHANGE: Coerce unknown into ErrReport (never throws). */
function coerce_report(raw: unknown, msg?: string): ErrReport {
  if (raw instanceof ErrReport) {
    return msg ? raw.addMessage(msg) : raw;
  }

  if (raw instanceof Error) {
    return ErrReport.create({
      message: msg ? `${msg} | ${raw.message}` : raw.message,
      module: _state.module,
      source: ErrSource.SYSTEM,
      severity: ErrSeverity.HIGH,
      // keep useful context
      metadata: { name: raw.name },
      cause: raw,
    } as any);
  }

  // strings / objects / everything else
  let details = "unknown error";
  if (typeof raw === "string") details = raw;
  else if (raw && typeof raw === "object") {
    try { details = JSON.stringify(raw); } catch { details = String(raw); }
  } else if (raw != null) {
    details = String(raw);
  }

  return ErrReport.create({
    message: msg ? `${msg} | ${details}` : details,
    module: _state.module,
    source: ErrSource.SYSTEM,
    severity: ErrSeverity.HIGH,
    cause: raw,
  } as any);
}

/** CHANGE: dispatch to sinks with dedupe/throttle. */
function dispatch(ev: SentryEvent): void {
  if (!_state.enabled) return;

  const key = fingerprint(ev.report);
  const t = nowMs();
  const last = _state.recent.get(key);
  if (last && (t - last) < _state.dedupeWindowMs) return;
  _state.recent.set(key, t);

  for (const sink of _state.sinks) {
    try { sink(ev); } catch { /* sinks must never break runtime */ }
  }
}

export const sentry = {
  /** CHANGE: configure once at app boot. */
  init(config?: SentryConfig): void {
    if (config?.enabled === false) _state.enabled = false;
    if (typeof config?.enabled === "boolean") _state.enabled = config.enabled;
    if (typeof config?.module === "string") _state.module = config.module;
    if (typeof config?.dedupeWindowMs === "number") _state.dedupeWindowMs = config.dedupeWindowMs;
    if (Array.isArray(config?.sinks)) _state.sinks.push(...config.sinks);

    // CHANGE: global hooks (browser)
    window.addEventListener("error", (e: ErrorEvent) => {
      const rep = coerce_report(e.error ?? e.message, "Uncaught exception");
      dispatch({ kind: "error", report: rep, raw: e.error, where: "window.error" });
    });

    window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
      const rep = coerce_report(e.reason, "Unhandled promise rejection");
      dispatch({ kind: "error", report: rep, raw: e.reason, where: "window.unhandledrejection" });
    });
  },

  /** CHANGE: allow manual reporting (e.g., top-level try/catch boundaries). */
  report(raw: unknown, msg?: string): ErrReport {
    const rep = coerce_report(raw, msg);
    dispatch({ kind: "error", report: rep, raw, where: "manual" });
    return rep;
  },

  /**
   * CHANGE: explicit helper for “something threw an Outcome/ErrReport” cases.
   * You can call this in a catch block where you expect mostly Outcomes.
   */
  reportOutcomeThrow(raw: unknown, msg?: string): ErrReport {
    // If you ever actually throw OutcomeFailErr somewhere, normalize it here.
    // Keeping it shape-based avoids importing Outcome types into sentry.
    if (raw && typeof raw === "object" && (raw as any).success === false && (raw as any).__fail === true) {
      const maybeRep = (raw as any).err;
      const rep = coerce_report(maybeRep, msg ?? "Outcome thrown");
      dispatch({ kind: "outcome_thrown", report: rep, raw, where: "manual" });
      return rep;
    }

    const rep = coerce_report(raw, msg ?? "Non-Outcome thrown");
    dispatch({ kind: "outcome_thrown", report: rep, raw, where: "manual" });
    return rep;
  },

  addSink(sink: SentrySink): void {
    _state.sinks.push(sink);
  },

  setEnabled(on: boolean): void {
    _state.enabled = on;
  },
} as const;