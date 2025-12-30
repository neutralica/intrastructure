import type { ResultAsync } from "../outcome/result.types.js";
import type { NetResponse } from "./net-request.types.js";
export declare function n_wrapHTML(resultPromise: ResultAsync<NetResponse>): Promise<HTMLElement>;
export declare function n_wrapJSON(resultPromise: ResultAsync<NetResponse>): ResultAsync<object>;
export declare function n_wrapSEND(resultPromise: ResultAsync<NetResponse>): Promise<number>;
//# sourceMappingURL=net-request.wrappers.d.ts.map