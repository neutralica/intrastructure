import type { Outcome } from "./outcome.types.js";
export declare function data_sync<T>(fn: () => T | Outcome<T>, step?: string): Outcome<T>;
export declare function void_sync(fn: () => void | Outcome<void>, step?: string): Outcome<void>;
/**
 * Async wrappers (thin)
 */
export declare function data_async<T>(fn: () => Promise<T | Outcome<T>>, step?: string): Promise<Outcome<T>>;
export declare function void_async(fn: () => Promise<void | Outcome<void>>, step?: string): Promise<Outcome<void>>;
//# sourceMappingURL=outcome.wrappers.d.ts.map