import { type R_asyncJSON, type R_asyncRNDR, type R_asyncSEND } from "../outcome/result.types.js";
import type { ReqResNextHandler, TypedRequest } from "../types/http.types.js";
export declare const respond: {
    JSON: <T>(fn: (req: TypedRequest) => R_asyncJSON<T>) => ReqResNextHandler;
    SEND: (fn: (req: TypedRequest) => R_asyncSEND) => ReqResNextHandler;
    RNDR: <T extends Record<string, unknown>>(fn: (req: TypedRequest) => R_asyncRNDR<T>) => ReqResNextHandler;
    AUTH: (fn: (req: TypedRequest) => R_asyncSEND) => ReqResNextHandler;
};
//# sourceMappingURL=respond.infra.d.ts.map