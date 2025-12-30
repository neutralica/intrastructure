import type { N_request, FailRecoveryMode } from "./net-request.types.js";
export declare const $n: {
    NewNetRequest: () => {
        GET: () => N_request<{
            method: "GET";
            failBehavior: FailRecoveryMode;
        }>;
        POST: () => N_request<{
            method: "POST";
            failBehavior: FailRecoveryMode;
        }>;
        PUT: () => N_request<{
            method: "PUT";
            failBehavior: FailRecoveryMode;
        }>;
        DELETE: () => N_request<{
            method: "DELETE";
            failBehavior: FailRecoveryMode;
        }>;
    };
};
//# sourceMappingURL=network-request.infra.d.ts.map