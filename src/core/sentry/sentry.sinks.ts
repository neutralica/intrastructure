// sentry.sinks.ts
import type { SentryEvent, SentrySink } from "./sentry.js";

// CHANGE: console sink (dev default)
export const sink_console: SentrySink = (ev: SentryEvent) => {
  const rep = ev.report;
  // Avoid double-printing giant stacks unless you want them
  console.error(`[SENTRY:${ev.where}] ${rep.message}`, rep);
};

// CHANGE: optional network sink (fire-and-forget)
export function make_sink_post(url: string): SentrySink {
  return (ev: SentryEvent) => {
    try {
      void fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // keep small; send what you need
        body: JSON.stringify({
          where: ev.where,
          kind: ev.kind,
          message: ev.report.message,
          stack: ev.report.stack,
          module: ev.report.module,
          severity: ev.report.severity,
          source: ev.report.source,
          timestamp: ev.report.timestamp,
          metadata: ev.report.metadata,
        }),
      });
    } catch {
      // no-op: sentry should never throw
    }
  };
}