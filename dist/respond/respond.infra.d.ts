import { type OutcomeAsyncJSON, type OutcomeAsyncRender, type OutcomeAsyncSend } from "../outcome/outcome.types.js";
import type { ReqResNextHandler, TypedRequest } from "../types/http.types.js";
export declare const respond: {
    json: <T>(fn: (req: TypedRequest) => OutcomeAsyncJSON<T>) => ReqResNextHandler;
    send: (fn: (req: TypedRequest) => OutcomeAsyncSend) => ReqResNextHandler;
    render: <T extends Record<string, unknown>>(fn: (req: TypedRequest) => OutcomeAsyncRender<T>) => ReqResNextHandler;
    auth: (fn: (req: TypedRequest) => OutcomeAsyncSend) => ReqResNextHandler;
};
//# sourceMappingURL=respond.infra.d.ts.map