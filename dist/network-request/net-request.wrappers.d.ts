import type { OutcomeAsync } from "../outcome/outcome.types.js";
import type { NetResponse } from "./net-request.types.js";
export declare function n_wrapHTML(outcomePromise: OutcomeAsync<NetResponse>): Promise<HTMLElement>;
export declare function n_wrapJSON(outcomePromise: OutcomeAsync<NetResponse>): OutcomeAsync<object>;
export declare function n_wrapSEND(outcomePromise: OutcomeAsync<NetResponse>): Promise<number>;
//# sourceMappingURL=net-request.wrappers.d.ts.map