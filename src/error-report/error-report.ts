// error-report.ts

import { relai } from "../outcome/relai.js";
import type { Outcome } from "../outcome/outcome.types.js";
import { wrap_data } from "../outcome/relai.wrappers.js";
import type { ClientMeta, ServerMeta } from "../types/core.types.js";
import { ErrSource, ErrSeverity } from "./err-consts/err-consts.js";
import type { ErrData, RequiredData } from "./err-report.types.js";


export default class ErrReport extends Error {
  public override message: string;
  public module: string;
  public severity: ErrSeverity;
  public status?: string;

  public override stack: string;

  public timestamp: string;
  public source: ErrSource;
  public metadata?: ClientMeta | ServerMeta;

  private constructor(
    message: string,
    module: string,
    source: ErrSource,
    severity: ErrSeverity,
    partial?: Partial<ErrData>
  ) {
    super(message);

    this.message = message;
    this.module = module;
    this.source = source;
    this.severity = severity;

    this.timestamp = new Date().toISOString();
    this.stack = new Error(message).stack ?? "(no trace available)";

    // Keep optional extras (status/metadata/etc)
    if (partial) Object.assign(this, partial);
  }

  public static create(data: ErrData): ErrReport {
    // Best-effort normalize
    const msg =
      typeof data.message === "string" && data.message.length > 0
        ? data.message
        : "(no message)";

    const mod =
      typeof data.module === "string" && data.module.length > 0
        ? data.module
        : "unknown";

    //  required in types, but still normalize defensively.
    const src: ErrSource = data.source ?? ErrSource.SYSTEM;

    // If severity is missing/invalid, default to MED.
    const sev: ErrSeverity = data.severity ?? ErrSeverity.MED;

    // never throw; always construct
    return new ErrReport(msg, mod, src, sev, data);
  }

  public addMessage(newMessage: string): ErrReport {
    const suffix =
      typeof newMessage === "string" && newMessage.length > 0
        ? newMessage
        : "(empty message)";

    return ErrReport.create({
      ...this.toData(),
      message: `${this.message} | ${suffix}`,
    });
  }

  public addBreadCrumb(tag: string): ErrReport {
    const safeTag =
      typeof tag === "string" && tag.length > 0 ? tag : "(empty tag)";

    const meta = this.metadata ?? {};

    // Tolerate old shapes (string) and coerce
    const prevRaw = (meta as any).breadcrumbs;
    const prev: string[] = Array.isArray(prevRaw)
      ? prevRaw
      : typeof prevRaw === "string" && prevRaw.length > 0
        ? [prevRaw]
        : [];

    const enriched = [...prev, safeTag];

    return ErrReport.create({
      ...this.toData(),
      metadata: {
        ...(meta as any),
        breadcrumbs: enriched,
        enriched: true,
      },
    });
  }

  
  private toData(): ErrData {
    return {
      message: this.message,
      module: this.module,
      source: this.source,
      severity: this.severity,
      status: this.status,
      timestamp: this.timestamp,
      // stack is not in ErrData in your snippet; add it if you want it carried.
      metadata: this.metadata,
    } as ErrData;
  }
}

export function enrichOutcome<T>(outcome: Outcome<T>, stepId?: string): Outcome<T> {
  if (!relai.failErr(outcome)) return outcome;
  if (outcome.err.metadata?.enriched) return outcome;
  if (!stepId) return outcome;

  const enrichedErr = outcome.err.addBreadCrumb(stepId);

  // Preserve original message but swap the report
  return relai.err(enrichedErr.message, enrichedErr);
}