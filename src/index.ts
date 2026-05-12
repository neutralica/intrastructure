// root index.ts

export const INTRASTRUCTURE_VERSION = "0.1.1";
// core index.ts
export * from "./core/outcome/index.js";
export * from "./core/error-report/index.js";
export type * from "./core/outcome/types.js";
export type * from "./core/error-report/err-report.types.js"; 
export type * from "./core/network-request/net-request.types.js";
export * from "./core/network-request/index.js";
export * from "./core/outcome/relay.js";